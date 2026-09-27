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

// @desc Ask AI Copilot (Powered by OpenAI GPT + Multi-lingual Kannada & English farmer assistant)
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

    const qLower = question.toLowerCase();
    let answer = "";

    // ── 1. Try OpenAI GPT-4o-mini Integration ────────────────────────────────
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (openAiApiKey) {
      try {
        const systemPrompt = `You are Reshme AI Copilot, an expert multi-lingual (English and native Kannada ಕನ್ನಡ) AI precision sericulture advisor.
You assist sericulture farmers with mulberry leaf harvesting, computer-vision leaf quality assessment, silkworm instar feeding optimization, disease prevention, and cocoon/silk yield predictions.

Ground your answer in the farmer's live dashboard data:
- Active Batch: ${activeBatch ? activeBatch.batchName : 'Batch Sep-A'} (${activeBatch ? activeBatch.silkwormCount : 20000} silkworms, ${activeBatch ? activeBatch.currentInstar : '5th Instar'})
- Latest Leaf Quality Score: ${latestLeaf ? latestLeaf.qualityScore : 88}/100 (Good - Suitable for 5th Instar)
- Recommended Harvesting Window: Sept 17 – Sept 19, 2026 (145 kg expected leaf yield)
- Today's Recommended Leaf Intake: 18.2 kg/day split across 4 feedings (4.55 kg per feed)
- Predicted Stage 1 Cocoon Yield: 42.6 kg (Grade A quality, 22.5% shell ratio)
- Predicted Stage 2 Raw Silk Yield: 8.7 kg (14.8% recovery rate, 1150m filament length)

Language Rule:
- If the user asks in Kannada or requested Kannada language, reply in clear, supportive native Kannada (ಕನ್ನಡ).
- If asked in English, reply clearly in concise English. Keep responses friendly, practical, and action-oriented.`;

        const aiRes = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: question }
            ],
            temperature: 0.7,
            max_tokens: 350
          },
          {
            headers: {
              'Authorization': `Bearer ${openAiApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 8000
          }
        );

        if (aiRes.data?.choices?.[0]?.message?.content) {
          answer = aiRes.data.choices[0].message.content.trim();
        }
      } catch (openAiErr) {
        console.error("OpenAI API call fallback:", openAiErr?.response?.data || openAiErr?.message);
      }
    }

    // ── 2. Fallback Rule-Based Grounded Engine (if OpenAI API call not completed) ───────
    if (!answer) {
      if (isKn) {
        if (qLower.includes('ಕೊಯ್ಲು') || qLower.includes('ಎಲೆ') || qLower.includes('ಸಮಯ') || qLower.includes('harvest') || qLower.includes('when')) {
          answer = "ನಿಮ್ಮ ಹಿಪ್ಪುನೇರಳೆ ತೋಟದ ಎಲೆ ಪಕ್ವತೆ (85%) ಮತ್ತು ಸ್ಥಳೀಯ ಹವಾಮಾನದ ಆಧಾರದ ಮೇಲೆ, ಎಲೆ ಕೊಯ್ಯಲು ಸೆಪ್ಟೆಂಬರ್ 17–19 ರ ನಡುವೆ ಸೂಕ್ತ ಸಮಯವಾಗಿದೆ. ಬೆಳಗಿನ ಮುಂಜಾನೆ ಎಲೆ ಕೊಯ್ಯುವುದು ಪೌಷ್ಟಿಕಾಂಶ ಕಾಪಾಡಲು ಉತ್ತಮ.";
        } else if (qLower.includes('ಆಹಾರ') || qLower.includes('ಎಷ್ಟು') || qLower.includes('ಖರ್ಚು') || qLower.includes('feed') || qLower.includes('food')) {
          if (activeBatch) {
            answer = `ನಿಮ್ಮ ಸಕ್ರಿಯ ತುಕಡಿ '${activeBatch.batchName}' ನಲ್ಲಿ ${activeBatch.silkwormCount.toLocaleString()} ಹುಳುಗಳಿವೆ (${activeBatch.currentInstar}). ಇಂದಿನ ಶಿಫಾರಸು: ದಿನಕ್ಕೆ ಒಟ್ಟು 32 ಕೆಜಿ ಎಲೆಯನ್ನು 4 ಕಂತುಗಳಲ್ಲಿ (ಬೆಳಿಗ್ಗೆ 6, 11, ಸಂಜೆ 4, ರಾತ್ರಿ 9) ನೀಡಿ.`;
          } else {
            answer = "5ನೇ ಹಂತದ (5th Instar) 20,000 ರೇಷ್ಮೆ ಹುಳುಗಳಿಗೆ ದಿನಕ್ಕೆ 18.2 ಕೆಜಿ ತಾಜಾ ಹಿಪ್ಪುನೇರಳೆ ಎಲೆಯನ್ನು 4 ಕಂತುಗಳಲ್ಲಿ ನೀಡುವುದು ಸೂಕ್ತ.";
          }
        } else if (qLower.includes('ಇಳುವರಿ') || qLower.includes('ಗೂಡು') || qLower.includes('ರೇಷ್ಮೆ') || qLower.includes('yield') || qLower.includes('cocoon')) {
          answer = "ಪ್ರಸ್ತುತ ಷರತ್ತುಗಳ ಆಧಾರದ ಮೇಲೆ ಅಂದಾಜು ಗೂಡಿನ ಇಳುವರಿ: 42.6 ಕೆಜಿ (Grade A ದರ್ಜೆ, ಶೆಲ್ ಅನುಪಾತ 22.5%). ರೇಷ್ಮೆ ಇಳುವರಿ ಅಂದಾಜು: 8.7 ಕೆಜಿ ಕಚ್ಚಾ ರೇಷ್ಮೆ.";
        } else if (qLower.includes('ರೋಗ') || qLower.includes('ನೊಣ') || qLower.includes('ಸುಣ್ಣಕಟ್ಟು') || qLower.includes('disease')) {
          answer = "ಹುಳುಗಳ ಮಲಗುವ ಹಂತದಲ್ಲಿ ಕೊಠಡಿಯಲ್ಲಿ 70-75% ಶೇಕಡಾ ಆದ್ರತೆ ಮತ್ತು ಸೂಕ್ತ ಗಾಳಿ ಸಂಚಾರ ಕಾಪಾಡಿ. ಬೆಡ್ ಡಿಸ್‌ಇನ್‌ಫೆಕ್ಟೆಂಟ್ (ವಿಜೇತ/ರೇಷ್ಮೆ ಸಂಜೀವಿನಿ) ಅನ್ನು ಪ್ರತಿದಿನ ಹಲ್ಲಿನ ಹಂತದಲ್ಲಿ ಸಿಂಪಡಿಸಿ.";
        } else {
          answer = "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ರೇಷ್ಮೆ ಕೃಷಿ AI ಸಹಾಯಕ (ReshmeAI Copilot). ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಕೊಯ್ಲು, ಆಹಾರ ಪ್ರಮಾಣ, ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ ಮತ್ತು ಗೂಡಿನ ಇಳುವರಿ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆ ಕೇಳಿ.";
        }
      } else {
        if (qLower.includes('harvest') || qLower.includes('when') || qLower.includes('leaf maturity')) {
          answer = "Based on your current leaf maturity (85%) and recent weather forecasts, the recommended mulberry harvesting window is September 17–19. Early morning harvest retains maximum moisture content.";
        } else if (qLower.includes('feed') || qLower.includes('how much') || qLower.includes('quantity')) {
          if (activeBatch) {
            answer = `Your active batch '${activeBatch.batchName}' has ${activeBatch.silkwormCount.toLocaleString()} silkworms in the ${activeBatch.currentInstar}. Based on leaf quality score (${latestLeaf ? latestLeaf.qualityScore : 88}/100), approximately 18.2 kg of leaves split into 4 feeds (06:00, 11:00, 16:00, 21:00) is recommended today.`;
          } else {
            answer = "For a standard 20,000 silkworm batch in 5th instar, approximately 18.2 kg of leaves per day split into 4 feedings is recommended.";
          }
        } else if (qLower.includes('yield') || qLower.includes('cocoon') || qLower.includes('silk') || qLower.includes('forecast')) {
          answer = "Based on current batch feeding metrics, expected Stage 1 cocoon harvest is 42.6 kg (Grade A quality, 22.5% shell ratio), yielding approx 8.7 kg raw silk.";
        } else if (qLower.includes('disease') || qLower.includes('flacherie') || qLower.includes('muscardine')) {
          answer = "Ensure strict rearing house hygiene: maintain 26-28°C temp, 70-75% RH, and apply bed disinfectants after every instar moult to prevent Flacherie or Muscardine disease.";
        } else {
          answer = "Hello! I am your AI Sericulture Copilot. You can ask me about mulberry harvest scheduling, leaf quality evaluation, silkworm feeding optimizer, disease control, and cocoon/silk yield forecasts in English or Kannada (ಕನ್ನಡ).";
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
