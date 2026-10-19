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

    // Dynamic harvest window based on current date
    const today = new Date();
    const harvestStart = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    const harvestEnd = new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000);
    const harvestStartStr = harvestStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const harvestEndStr = harvestEnd.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
    const dynamicHarvestWindow = `${harvestStartStr} – ${harvestEndStr}`;

    if (openRouterApiKey) {
      try {
        const langInstruction = {
          kn: 'Reply ONLY in native Kannada (ಕನ್ನಡ) script. Do not use English.',
          hi: 'Reply ONLY in Hindi (हिन्दी). Do not use English.',
          te: 'Reply ONLY in Telugu (తెలుగు). Do not use English.',
          ta: 'Reply ONLY in Tamil (தமிழ்). Do not use English.',
          ml: 'Reply ONLY in Malayalam (മലയാളം). Do not use English.',
          en: 'Reply in clear English.'
        }[language] || 'Reply in clear English.';

        const systemPrompt = `You are Reshme AI Copilot, a friendly expert AI assistant for sericulture (silk farming) farmers in India. Answer any question the farmer asks naturally.

Today's date: ${today.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}

Live farm dashboard data:
- Active Batch: ${activeBatch ? activeBatch.batchName : 'Batch A'} (${activeBatch ? activeBatch.silkwormCount : 20000} silkworms, ${activeBatch ? activeBatch.currentInstar : '5th Instar'})
- Latest Leaf Quality Score: ${latestLeaf ? latestLeaf.qualityScore : 88}/100 (Good)
- Recommended Harvest Window: ${dynamicHarvestWindow} (approx. 145 kg expected)
- Today's Feeding: 18.2 kg/day across 4 feedings (4.55 kg each)
- Predicted Cocoon Yield: 42.6 kg (Grade A, 22.5% shell ratio)
- Predicted Raw Silk Yield: 8.7 kg (14.8% recovery, 1150m filament)

IMPORTANT - Language: ${langInstruction}
Keep responses concise (2-4 sentences), friendly, and practical.`;

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

      const harvestFallback = {
        en: `Based on your leaf maturity (85%) and current conditions, harvest window is ${dynamicHarvestWindow}. Early morning harvest retains maximum moisture.`,
        kn: `ನಿಮ್ಮ ಎಲೆ ಪಕ್ವತೆ (85%) ಆಧಾರದ ಮೇಲೆ, ಎಲೆ ಕೊಯ್ಯಲು ${dynamicHarvestWindow} ಸೂಕ್ತ ಸಮಯ.`,
        hi: `पत्ती परिपक्वता (85%) के आधार पर, कटाई की अनुशंसित अवधि ${dynamicHarvestWindow} है।`,
        te: `ఆకు పక్వత (85%) ఆధారంగా, కోత కాలం ${dynamicHarvestWindow} అని సూచించబడింది.`,
        ta: `இலை முதிர்ச்சி (85%) அடிப்படையில், அறுவடை காலம் ${dynamicHarvestWindow} பரிந்துரைக்கப்படுகிறது.`,
        ml: `ഇല പക്വത (85%) അടിസ്ഥാനത്തിൽ, വിളവെടുപ്പ് കാലം ${dynamicHarvestWindow} ശുപാർശ ചെയ്യുന്നു.`
      };

      const feedFallback = {
        en: "For 20,000 silkworms in 5th instar, feed 18.2 kg/day across 4 sessions (06:00, 11:00, 16:00, 21:00) for optimal growth.",
        kn: "5ನೇ ಹಂತದ 20,000 ರೇಷ್ಮೆ ಹುಳುಗಳಿಗೆ ದಿನಕ್ಕೆ 18.2 ಕೆಜಿ ಎಲೆಯನ್ನು 4 ಕಂತುಗಳಲ್ಲಿ ನೀಡಿ.",
        hi: "5वें चरण के 20,000 रेशम कीड़ों के लिए प्रतिदिन 18.2 किग्रा पत्तियां 4 बार (06:00, 11:00, 16:00, 21:00) दें।",
        te: "5వ దశలో 20,000 పట్టు పురుగులకు రోజుకు 18.2 కేజీ ఆకులను 4 సార్లు (06:00, 11:00, 16:00, 21:00) ఇవ్వండి.",
        ta: "5-ஆம் நிலை 20,000 பட்டுப்புழுக்களுக்கு தினமும் 18.2 கிலோ இலைகளை 4 முறை (06:00, 11:00, 16:00, 21:00) கொடுங்கள்.",
        ml: "5-ാം ഘട്ടത്തിലെ 20,000 പട്ടുനൂൽ പുഴുക്കൾക്ക് ദിവസം 18.2 കിലോ ഇലകൾ 4 തവണ (06:00, 11:00, 16:00, 21:00) നൽകുക."
      };

      const cocoonFallback = {
        en: "Current forecast: 42.6 kg cocoon yield (Grade A, 22.5% shell ratio), producing ~8.7 kg raw silk.",
        kn: "ಅಂದಾಜು ಗೂಡಿನ ಇಳುವರಿ: 42.6 ಕೆಜಿ (Grade A, 22.5% ಶೆಲ್). ರೇಷ್ಮೆ: 8.7 ಕೆಜಿ.",
        hi: "अनुमानित कोकून उपज: 42.6 किग्रा (ग्रेड A, 22.5% शेल अनुपात), कच्चा रेशम: ~8.7 किग्रा।",
        te: "అంచనా కకూన్ దిగుబడి: 42.6 కేజీ (గ్రేడ్ A, 22.5% షెల్), ముడి పట్టు: ~8.7 కేజీ.",
        ta: "எதிர்பார்க்கப்படும் கூடு மகசூல்: 42.6 கிலோ (தர A, 22.5% ஷெல்), பட்டு: ~8.7 கிலோ.",
        ml: "കൂട് വിളവ് പ്രതീക്ഷ: 42.6 കിലോ (ഗ്രേഡ് A, 22.5% ഷെൽ), ആം പട്ട്: ~8.7 കിലോ."
      };

      const diseaseFallback = {
        en: "Maintain 26-28°C, 70-75% RH in the rearing house. Apply bed disinfectants after every instar moult.",
        kn: "ಕೊಠಡಿಯಲ್ಲಿ 26-28°C ಮತ್ತು 70-75% ಆದ್ರತೆ ಕಾಪಾಡಿ. ಪ್ರತಿ ಹಂತದ ನಂತರ ಬೆಡ್ ಡಿಸ್‌ಇನ್‌ಫೆಕ್ಟೆಂಟ್ ಸಿಂಪಡಿಸಿ.",
        hi: "26-28°C तापमान और 70-75% आर्द्रता बनाए रखें। हर चरण के बाद बेड डिसइन्फेक्टेंट छिड़कें।",
        te: "26-28°C ఉష్ణోగ్రత, 70-75% తేమ నిర్వహించండి. ప్రతి దశ తర్వాత బెడ్ డిసిన్ఫెక్టెంట్ చల్లండి.",
        ta: "26-28°C வெப்பம், 70-75% ஈரப்பதம் பராமரிக்கவும். ஒவ்வொரு நிலைக்கும் பிறகு படுக்கை கிருமிநாசினி தெளிக்கவும்.",
        ml: "26-28°C, 70-75% ആർദ്രത നിലനിർത്തുക. ഓരോ ഘട്ടത്തിനും ശേഷം ബെഡ് ഡിസ്‌ഇൻഫെക്ടന്റ് തളിക്കുക."
      };

      const defaultFallback = {
        en: `I'm your Reshme AI Copilot. Leaf quality: ${latestLeaf?.qualityScore || 88}/100, harvest window: ${dynamicHarvestWindow}, cocoon forecast: 42.6 kg. Ask me anything!`,
        kn: `ನಾನು ನಿಮ್ಮ ರೇಷ್ಮೆ AI ಸಹಾಯಕ. ಎಲೆ ಕೊಯ್ಲು, ಆಹಾರ, ರೋಗ ತಡೆ ಅಥವಾ ಗೂಡಿನ ಇಳುವರಿ ಬಗ್ಗೆ ಕೇಳಿ.`,
        hi: `मैं आपका रेशम AI सहायक हूँ। पत्ती कटाई, आहार, रोग नियंत्रण या कोकून उपज के बारे में पूछें।`,
        te: `నేను మీ పట్టు AI సహాయకుడిని. ఆకు కోత, మేత, వ్యాధి నివారణ లేదా కకూన్ దిగుబడి గురించి అడగండి.`,
        ta: `நான் உங்கள் பட்டு AI உதவியாளர். இலை அறுவடை, உணவு, நோய் தடுப்பு அல்லது கூடு மகசூல் பற்றி கேளுங்கள்.`,
        ml: `ഞാൻ നിങ്ങളുടെ പട്ട് AI സഹായിയാണ്. ഇല വിളവെടുപ്പ്, തീറ്റ, രോഗ നിയന്ത്രണം അല്ലെങ്കിൽ കൂട് വിളവ് ഇവ ചോദിക്കൂ.`
      };

      const lang = language || 'en';
      const isHarvest = qLower.includes('harvest') || qLower.includes('when') || qLower.includes('leaf maturity') ||
        qLower.includes('ಕೊಯ್ಲು') || qLower.includes('ఆకుల కోత') || qLower.includes('कटाई') ||
        qLower.includes('அறுவடை') || qLower.includes('വിളവെടുപ്പ്');
      const isFeed = qLower.includes('feed') || qLower.includes('food') || qLower.includes('how much') ||
        qLower.includes('ಆಹಾರ') || qLower.includes('మేత') || qLower.includes('आहार') ||
        qLower.includes('உணவு') || qLower.includes('തീറ്റ');
      const isCocoon = qLower.includes('cocoon') || qLower.includes('yield') || qLower.includes('silk') ||
        qLower.includes('ಗೂಡು') || qLower.includes('కకూన్') || qLower.includes('कोकून') ||
        qLower.includes('கூடு') || qLower.includes('കൂട്');
      const isDisease = qLower.includes('disease') || qLower.includes('prevent') || qLower.includes('flacherie') ||
        qLower.includes('ರೋಗ') || qLower.includes('వ్యాధి') || qLower.includes('रोग') ||
        qLower.includes('நோய்') || qLower.includes('രോഗ');
      const isDashboard = qLower.includes('dashboard') || qLower.includes('summary') || qLower.includes('overview');

      if (isHarvest) {
        answer = harvestFallback[lang] || harvestFallback.en;
      } else if (isFeed) {
        answer = feedFallback[lang] || feedFallback.en;
      } else if (isCocoon) {
        answer = cocoonFallback[lang] || cocoonFallback.en;
      } else if (isDisease) {
        answer = diseaseFallback[lang] || diseaseFallback.en;
      } else if (isDashboard) {
        answer = `📊 Leaf Quality: ${latestLeaf?.qualityScore || 88}/100\n📅 Harvest: ${dynamicHarvestWindow}\n🌿 Feeding: 18.2 kg/day (4 sessions)\n🧵 Cocoons: 42.6 kg | Silk: 8.7 kg`;
      } else {
        answer = defaultFallback[lang] || defaultFallback.en;
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
