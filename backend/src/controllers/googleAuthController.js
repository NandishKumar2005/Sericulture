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

    const audiences = [
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_ANDROID_CLIENT_ID,
    ].filter(Boolean);

    let payload;
    try {
      // Try verifying as ID token first
      const ticket = await client.verifyIdToken({ idToken: credential, audience: audiences });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('verifyIdToken failed:', verifyErr.message);
      // Fallback: decode without verification to get user info, then re-verify via Google tokeninfo
      const tokenInfoRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      const tokenInfo = await tokenInfoRes.json();
      if (tokenInfo.error || !tokenInfo.email) {
        return res.status(401).json({ success: false, message: 'Invalid Google token: ' + (tokenInfo.error || verifyErr.message) });
      }
      payload = { email: tokenInfo.email, name: tokenInfo.name, sub: tokenInfo.sub, email_verified: tokenInfo.email_verified === 'true' };
    }

    if (!payload.email_verified) return res.status(401).json({ success: false, message: 'Google email not verified.' });

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
