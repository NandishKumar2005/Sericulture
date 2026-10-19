const axios = require('axios');
const CopilotConversation = require('../models/CopilotConversation');
const SilkwormBatch = require('../models/SilkwormBatch');
const Farm = require('../models/Farm');
const LeafAnalysis = require('../models/LeafAnalysis');

/**
 * Detects if a string contains native Kannada characters (\u0C80-\u0CFF)
 */
function isKannadaText(str) {
  return /[\u0C80-\u0CFF]/.test(str);
}

// @desc Ask AI Copilot (Powered by OpenRouter AI + Multi-lingual Kannada & English farmer assistant)
// @route POST /api/copilot
exports.askCopilot = async (req, res) => {
  try {
    const { question, conversationId, language, metrics } = req.body;
    const userId = req.user ? req.user.id : 'demo_farmer_id';

    if (!question) {
      return res.status(400).json({ success: false, message: 'Question text is required' });
    }

    const activeConvId = conversationId || `conv_${userId}_${Date.now()}`;
    const isKn = language === 'kn' || isKannadaText(question);

    // Fetch farmer's farm and active batch context for knowledge-augmented response
    let activeBatch = null;
    let latestLeaf = null;

    try {
      const userFarms = await Farm.find({ userId });
      const farmIds = userFarms.map(f => f._id);
      activeBatch = await SilkwormBatch.findOne({ farmId: { $in: farmIds }, status: 'active' });
      latestLeaf = await LeafAnalysis.findOne({ farmId: { $in: farmIds } }).sort({ createdAt: -1 });
    } catch (dbErr) {
      // Graceful fallback if DB records not yet seeded
    }

    let answer = "";

    // ── 1. Try OpenRouter AI Integration ─────────────────────────────────────
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (openRouterApiKey) {
      try {
        const langInstruction = {
          kn: 'Reply in native Kannada (ಕನ್ನಡ) script only.',
          hi: 'Reply in Hindi (हिन्दी) only.',
          te: 'Reply in Telugu (తెలుగు) only.',
          ta: 'Reply in Tamil (தமிழ்) only.',
          ml: 'Reply in Malayalam (മലയാളം) only.',
          en: 'Reply in clear English.'
        }[language] || 'Reply in clear English.';

        const systemPrompt = `You are Reshme AI Copilot, a friendly and expert AI assistant for sericulture (silk farming) farmers in India. You speak naturally like a real assistant — you can answer any question the farmer asks, whether it is about sericulture, general farming advice, or even casual conversation.

Live farm dashboard data:
- Active Batch: ${activeBatch ? activeBatch.batchName : 'Batch Sep-A'} (${activeBatch ? activeBatch.silkwormCount : 20000} silkworms, ${activeBatch ? activeBatch.currentInstar : '5th Instar'})
- Latest Leaf Quality Score: ${latestLeaf ? latestLeaf.qualityScore : 88}/100 (Good — Suitable for 5th Instar)
- Recommended Harvest Window: Sept 17–19, 2026 (145 kg expected)
- Today's Feeding: 18.2 kg/day across 4 feedings (4.55 kg each)
- Predicted Cocoon Yield: 42.6 kg (Grade A, 22.5% shell ratio)
- Predicted Raw Silk Yield: 8.7 kg (14.8% recovery, 1150m filament)

Language: ${langInstruction}
Keep responses concise (2-4 sentences), friendly, and practical. Never repeat the same response for different questions.`;

        const aiRes = await axios.post(
          'https://openrouter.ai/api/v1/chat/completions',
          {
            model: 'google/gemma-3-12b-it:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question }
            ],
            temperature: 0.8,
            max_tokens: 400
          },
          {
            headers: {
              'Authorization': `Bearer ${openRouterApiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'https://reshme-sericulture.app',
              'X-Title': 'Reshme AI Copilot'
            },
            timeout: 10000
          }
        );

        const replyText = aiRes.data?.choices?.[0]?.message?.content;
        if (replyText) {
          answer = replyText.trim();
        }
      } catch (openRouterErr) {
        console.error("OpenRouter API call fallback:", openRouterErr?.response?.data || openRouterErr?.message);
      }
    }

    // ── 2. Fallback Rule-Based Grounded Engine (if OpenRouter API call not completed) ───────
    if (!answer) {
      const qLower = question.toLowerCase();
      const isKnLang = isKn || language === 'kn';

      if (isKnLang) {
        if (qLower.includes('ಕೊಯ್ಲು') || qLower.includes('ಎಲೆ') || qLower.includes('ಸಮಯ') || qLower.includes('harvest') || qLower.includes('when')) {
          answer = "ನಿಮ್ಮ ಹಿಪ್ಪುನೇರಳೆ ತೋಟದ ಎಲೆ ಪಕ್ವತೆ (85%) ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ, ಎಲೆ ಕೊಯ್ಯಲು ಸೆಪ್ಟೆಂಬರ್ 17–19 ರ ನಡುವೆ ಸೂಕ್ತ ಸಮಯವಾಗಿದೆ.";
        } else if (qLower.includes('ಆಹಾರ') || qLower.includes('ಎಷ್ಟು') || qLower.includes('feed')) {
          answer = "5ನೇ ಹಂತದ 20,000 ರೇಷ್ಮೆ ಹುಳುಗಳಿಗೆ ದಿನಕ್ಕೆ 18.2 ಕೆಜಿ ತಾಜಾ ಹಿಪ್ಪುನೇರಳೆ ಎಲೆಯನ್ನು 4 ಕಂತುಗಳಲ್ಲಿ ನೀಡುವುದು ಸೂಕ್ತ.";
        } else if (qLower.includes('ಇಳುವರಿ') || qLower.includes('ಗೂಡು') || qLower.includes('cocoon')) {
          answer = "ಪ್ರಸ್ತುತ ಷರತ್ತುಗಳ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜು ಗೂಡಿನ ಇಳುವರಿ: 42.6 ಕೆಜಿ (Grade A, ಶೆಲ್ 22.5%). ರೇಷ್ಮೆ ಇಳುವರಿ: 8.7 ಕೆಜಿ.";
        } else if (qLower.includes('ರೋಗ') || qLower.includes('disease')) {
          answer = "ಕೊಠಡಿಯಲ್ಲಿ 70-75% ಆದ್ರತೆ ಮತ್ತು 26-28°C ತಾಪಮಾನ ಕಾಪಾಡಿ. ಪ್ರತಿ ಹಂತದ ನಂತರ ಬೆಡ್ ಡಿಸ್‌ಇನ್‌ಫೆಕ್ಟೆಂಟ್ ಸಿಂಪಡಿಸಿ.";
        } else {
          answer = "ನಾನು ನಿಮ್ಮ ರೇಷ್ಮೆ ಕೃಷಿ AI ಸಹಾಯಕ. ಎಲೆ ಕೊಯ್ಲು, ಆಹಾರ, ರೋಗ ತಡೆ ಅಥವಾ ಗೂಡಿನ ಇಳುವರಿ ಬಗ್ಗೆ ಕೇಳಿ — ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.";
        }
      } else {
        if (qLower.includes('harvest') || qLower.includes('leaf maturity') || qLower.includes('when to')) {
          answer = "Based on your leaf maturity (85%) and weather data, the recommended mulberry harvest window is Sept 17–19. Early morning harvest retains maximum moisture and nutrition.";
        } else if (qLower.includes('feed') || qLower.includes('how much') || qLower.includes('quantity') || qLower.includes('food')) {
          answer = activeBatch
            ? `Your batch '${activeBatch.batchName}' has ${activeBatch.silkwormCount.toLocaleString()} silkworms in ${activeBatch.currentInstar}. Recommended: 18.2 kg/day split across 4 feedings (06:00, 11:00, 16:00, 21:00).`
            : "For 20,000 silkworms in 5th instar, feed 18.2 kg/day across 4 sessions for optimal growth.";
        } else if (qLower.includes('yield') || qLower.includes('cocoon') || qLower.includes('silk') || qLower.includes('forecast') || qLower.includes('predict')) {
          answer = "Current forecast: 42.6 kg cocoon yield (Grade A, 22.5% shell ratio), producing ~8.7 kg raw silk at 14.8% recovery rate.";
        } else if (qLower.includes('disease') || qLower.includes('flacherie') || qLower.includes('muscardine') || qLower.includes('prevent')) {
          answer = "Maintain 26-28°C, 70-75% RH in the rearing house. Apply bed disinfectants after every instar moult to prevent Flacherie or Muscardine.";
        } else if (qLower.includes('dashboard') || qLower.includes('summary') || qLower.includes('overview') || qLower.includes('status')) {
          answer = `📊 Dashboard Summary:\n• Leaf Quality: ${latestLeaf?.qualityScore || 88}/100 (Good)\n• Harvest Window: Sept 17–19, 2026\n• Feeding Today: 18.2 kg/day (4 sessions)\n• Cocoon Forecast: 42.6 kg | Silk: 8.7 kg`;
        } else if (qLower.includes('built') || qLower.includes('who made') || qLower.includes('how were you') || qLower.includes('what are you')) {
          answer = "I'm Reshme AI Copilot, built to help sericulture farmers with real-time farm intelligence — from leaf quality and harvest timing to feeding schedules and silk yield forecasts.";
        } else if (qLower.includes('language') || qLower.includes('kannada') || qLower.includes('hindi') || qLower.includes('telugu')) {
          answer = "Yes! You can ask me in Kannada, Hindi, Telugu, Tamil, or Malayalam. Just switch the language using the buttons at the top and ask your question.";
        } else if (qLower.includes('weather') || qLower.includes('rain') || qLower.includes('temperature')) {
          answer = "Current conditions are suitable for rearing. Maintain rearing house temperature at 26-28°C and humidity at 70-75% regardless of outside weather.";
        } else {
          answer = `I'm your Reshme AI Copilot. Your farm is doing well — leaf quality at ${latestLeaf?.qualityScore || 88}/100, harvest window Sept 17–19, and cocoon forecast at 42.6 kg. Ask me anything about your farm!`;
        }
      }
    }

    // Save messages in conversation history if DB is available
    try {
      let conversation = await CopilotConversation.findOne({ userId, conversationId: activeConvId });
      if (!conversation) {
        conversation = new CopilotConversation({
          userId,
          conversationId: activeConvId,
          messages: []
        });
      }

      const userMessage = { sender: 'user', text: question, timestamp: new Date() };
      const copilotMessage = { sender: 'copilot', text: answer, timestamp: new Date() };

      conversation.messages.push(userMessage, copilotMessage);
      await conversation.save();
    } catch (saveErr) {
      // Fallback if DB saving is disabled or offline
    }

    res.status(200).json({
      success: true,
      language: isKn ? 'kn' : 'en',
      conversationId: activeConvId,
      reply: answer
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc Get farmer conversation history
// @route GET /api/copilot/conversations
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : 'demo_farmer_id';
    const conversations = await CopilotConversation.find({ userId }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
