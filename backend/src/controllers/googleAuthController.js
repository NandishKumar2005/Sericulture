const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const WEB_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID;
const WEB_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const client = new OAuth2Client(WEB_CLIENT_ID);

// ── Helper: find or create user from Google payload ──────────────────────────
async function findOrCreateGoogleUser(payload) {
  const { email, name, sub: googleId } = payload;
  let user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    user = await User.create({
      name, email: email.toLowerCase(),
      phone: '', passwordHash: '', googleId,
      location: 'Karnataka, India', farmName: '',
    });
  } else if (!user.googleId) {
    user.googleId = googleId;
    await user.save();
  }
  return user;
}

function makeJwt(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });
}

function userPayload(user) {
  return {
    id: user._id, name: user.name, email: user.email,
    phone: user.phone, location: user.location,
    farmName: user.farmName || '', acreage: user.acreage || '',
    mulberryVariety: user.mulberryVariety || '',
    silkwormBreed: user.silkwormBreed || '',
  };
}

// ── POST /api/auth/google  (browser ID-token flow) ───────────────────────────
exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ success: false, message: 'Google credential token is required' });

    let payload;

    // Try ID token verification first (browser flow)
    try {
      const audiences = [
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_ANDROID_CLIENT_ID,
      ].filter(Boolean);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: audiences });
      payload = ticket.getPayload();
    } catch (idTokenErr) {
      // Fallback: treat as access token (APK implicit flow)
      try {
        const userInfoRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
          headers: { Authorization: `Bearer ${credential}` },
        });
        const userInfo = await userInfoRes.json();
        if (userInfo.error || !userInfo.email) throw new Error(userInfo.error?.message || 'Invalid access token');
        payload = {
          email: userInfo.email,
          name: userInfo.name,
          sub: userInfo.sub,
          email_verified: userInfo.email_verified,
        };
      } catch (accessTokenErr) {
        // Last fallback: Google tokeninfo endpoint
        const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
        const tokenInfo = await tokenInfoRes.json();
        if (tokenInfo.error || !tokenInfo.email) {
          return res.status(401).json({ success: false, message: 'Invalid Google token' });
        }
        payload = {
          email: tokenInfo.email,
          name: tokenInfo.name,
          sub: tokenInfo.sub,
          email_verified: tokenInfo.email_verified === 'true',
        };
      }
    }

    if (!payload?.email) return res.status(401).json({ success: false, message: 'Could not get email from Google.' });

    const user  = await findOrCreateGoogleUser(payload);
    const token = makeJwt(user);

    res.status(200).json({ success: true, message: 'Google sign-in successful', token, user: userPayload(user) });
  } catch (error) {
    console.error('Google auth error:', error.message);
    res.status(401).json({ success: false, message: 'Google sign-in failed. ' + error.message });
  }
};

// ── POST /api/auth/google-callback  (APK PKCE code exchange) ─────────────────
exports.googleCallback = async (req, res) => {
  try {
    const { code, code_verifier, redirect_uri } = req.body;
    if (!code || !code_verifier || !redirect_uri) {
      return res.status(400).json({ success: false, message: 'Missing code, code_verifier or redirect_uri' });
    }

    if (!WEB_CLIENT_SECRET) {
      return res.status(500).json({ success: false, message: 'Server misconfigured: missing GOOGLE_CLIENT_SECRET' });
    }

    // Exchange auth code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     WEB_CLIENT_ID,
        client_secret: WEB_CLIENT_SECRET,
        redirect_uri,
        grant_type:    'authorization_code',
        code_verifier,
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      console.error('Token exchange error:', tokens);
      return res.status(401).json({ success: false, message: tokens.error_description || 'Token exchange failed' });
    }

    // Verify the id_token
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: [WEB_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean),
    });
    const payload = ticket.getPayload();
    if (!payload.email_verified) return res.status(401).json({ success: false, message: 'Google email not verified.' });

    const user  = await findOrCreateGoogleUser(payload);
    const token = makeJwt(user);

    res.status(200).json({ success: true, message: 'Google sign-in successful', token, user: userPayload(user) });
  } catch (error) {
    console.error('Google callback error:', error.message);
    res.status(401).json({ success: false, message: 'Google sign-in failed: ' + error.message });
  }
};

// ── In-memory session store for APK OAuth polling ────────────────────────────
const oauthSessions = new Map(); // sessionId -> { token, user, error, ts }

// Clean up sessions older than 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 5 * 60 * 1000;
  for (const [id, s] of oauthSessions) {
    if (s.ts < cutoff) oauthSessions.delete(id);
  }
}, 60000);

// POST /api/auth/google-session — callback page stores result here
exports.googleSessionStore = async (req, res) => {
  try {
    const { sessionId, code, code_verifier, redirect_uri } = req.body;
    if (!sessionId) return res.status(400).json({ success: false, message: 'Missing sessionId' });

    if (!code) {
      oauthSessions.set(sessionId, { error: req.body.error || 'No code', ts: Date.now() });
      return res.json({ success: true });
    }

    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code, client_id: WEB_CLIENT_ID, client_secret: WEB_CLIENT_SECRET,
        redirect_uri, grant_type: 'authorization_code', code_verifier,
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) {
      oauthSessions.set(sessionId, { error: tokens.error_description || 'Token exchange failed', ts: Date.now() });
      return res.json({ success: true });
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: [WEB_CLIENT_ID, process.env.GOOGLE_ANDROID_CLIENT_ID].filter(Boolean),
    });
    const payload = ticket.getPayload();
    const user    = await findOrCreateGoogleUser(payload);
    const token   = makeJwt(user);

    oauthSessions.set(sessionId, { token, user: userPayload(user), ts: Date.now() });
    res.json({ success: true });
  } catch (error) {
    console.error('googleSessionStore error:', error.message);
    res.json({ success: true }); // always 200 so callback page doesn't show error
  }
};

// GET /api/auth/google-session/:sessionId — APK polls this
exports.googleSessionPoll = (req, res) => {
  const session = oauthSessions.get(req.params.sessionId);
  if (!session) return res.json({ ready: false });
  oauthSessions.delete(req.params.sessionId);
  if (session.error) return res.status(401).json({ ready: true, success: false, message: session.error });
  res.json({ ready: true, success: true, token: session.token, user: session.user });
};
