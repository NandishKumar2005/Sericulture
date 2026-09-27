import React, { useState } from 'react';

// Icons using inline SVG for high performance and zero dependency issues
const Icons = {
  Leaf: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Calendar: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Utensils: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Bot: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4-4-4z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m18 0a9 9 0 01-9 9m9-9a9 9 0 00-9-9m0 18a9 9 0 01-9-9m9 9a9 9 0 00-9-9m9 9h18" />
    </svg>
  )
};

const TRANSLATIONS = {
  en: {
    nav: {
      sub: "Precision Sericulture",
      overview: "Overview",
      modules: "5 Core Modules",
      architecture: "Architecture",
      downloadNav: "Download App",
      btnDownload: "Download Android APK"
    },
    hero: {
      badge: "Sericulture Decision Support System • Mobile + ML API",
      titlePre: "AI-Powered ",
      titleSpan: "Precision Sericulture",
      titlePost: " & Production Forecasting",
      desc: "Empowering sericulture farmers through the entire production cycle — from optimal mulberry leaf harvesting and computer-vision quality assessment to dynamic silkworm feeding and two-stage cocoon/silk yield forecasting.",
      btnApk: "Download Android App (APK)",
      btnExplore: "Explore Core Modules",
      metrics: [
        { val: "94%+", label: "Leaf Scanner Accuracy", detail: "OpenCV CV pipeline" },
        { val: "15–20%", label: "Wastage Reduction", detail: "Instar-based optimization" },
        { val: "2–3 Days", label: "Predictive Harvest Window", detail: "Weather & maturity model" },
        { val: "5 Modules", label: "Integrated Core Scope", detail: "Full production coverage" }
      ]
    },
    modulesSection: {
      badge: "End-to-End Decision Support",
      title: "Five Integrated Core AI Modules",
      desc: "Designed specifically for smallholder sericulture farmers to boost yields, prevent crop failure, and maximize silk returns.",
      capabilities: "Key Capabilities:"
    },
    archSection: {
      badge: "Production Technology Stack",
      title: "Microservice Architecture & Data Flow",
      desc: "Modular decoupled setup ensuring fast mobile responses, scalable computer vision processing, and robust data persistence.",
      cards: [
        { icon: "📱", title: "Mobile Frontend App", desc: "React + Vite single-page mobile shell styled with Tailwind CSS. Provides camera scanning, dashboard metric cards, feeding schedule logs, and copilot chat." },
        { icon: "⚡", title: "Node.js Express Backend", desc: "Central REST API gateway with JWT auth, MongoDB Atlas persistence, weather service lookup, and proxy controllers communicating with the Python ML microservice." },
        { icon: "🧠", title: "Python FastAPI ML Service", desc: "Executes OpenCV leaf image segmentation, biological silkworm growth logic, harvest window timing curves, and cocoon/silk yield prediction models." }
      ]
    },
    downloadSection: {
      badge: "Ready for Farmer Deployment",
      title: "Get the ReshmeAI Android Mobile App",
      desc: "Install directly on any Android smartphone to start scanning mulberry leaves, optimizing silkworm feeds, and receiving harvest predictions.",
      cardTitle: "ReshmeAI Farmer Portal (v1.0.0)",
      cardSub: "Android APK • Release Package",
      status: "MVP Stable",
      instTitle: "Installation Instructions:",
      instSteps: [
        "Download the ReshmeAI-v1.0.0.apk file.",
        "Enable \"Install from Unknown Sources\" in Android settings.",
        "Tap the APK file to install and open the app.",
        "Register your farm location and active silkworm batch."
      ],
      btnDownloadMain: "Download ReshmeAI-v1.0.0.apk (18.4 MB)"
    },
    footer: {
      title: "ReshmeAI Sericulture System",
      baseline: "Production Baseline",
      tagline: "AI-Powered Precision Sericulture & Yield Forecasting"
    }
  },

  kn: {
    nav: {
      sub: "ನಿಖರ ರೇಷ್ಮೆ ಕೃಷಿ",
      overview: "ಅವಲೋಕನ",
      modules: "5 ಪ್ರಮುಖ ಮಾಡ್ಯೂಲ್‌ಗಳು",
      architecture: "ಆರ್ಕಿಟೆಕ್ಚರ್",
      downloadNav: "ಆ್ಯಪ್ ಡೌನ್‌ಲೋಡ್",
      btnDownload: "Android APK ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
    },
    hero: {
      badge: "ರೇಷ್ಮೆ ಕೃಷಿ ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ • ಮೊಬೈಲ್ + ಎಐ ಸೇವೆ",
      titlePre: "ಎಐ-ಚಾಲಿತ ",
      titleSpan: "ನಿಖರ ರೇಷ್ಮೆ ಕೃಷಿ",
      titlePost: " ಮತ್ತು ಉತ್ಪಾದನಾ ಮುನ್ಸೂಚನೆ",
      desc: "ರೇಷ್ಮೆ ಬೆಳೆಗಾರರಿಗೆ ಸಂಪೂರ್ಣ ಕೃಷಿ ಹಂತಗಳಲ್ಲಿ ಸಹಾಯ — ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಕೊಯ್ಲಿನಿಂದ ಕಂಪ್ಯೂಟರ್-ವಿಷನ್ ಎಲೆ ತಪಾಸಣೆ, ರೇಷ್ಮೆ ಹುಳುಗಳ ಆಹಾರ ಪ್ರಮಾಣ ಆಪ್ಟಿಮೈಸೇಶನ್ ಮತ್ತು ಗೂಡು/ರೇಷ್ಮೆ ಇಳುವರಿ ಮುನ್ಸೂಚನೆ.",
      btnApk: "Android ಆ್ಯಪ್ (APK) ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
      btnExplore: "ಪ್ರಮುಖ ಮಾಡ್ಯೂಲ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
      metrics: [
        { val: "94%+", label: "ಎಲೆ ಸ್ಕ್ಯಾನರ್ ನಿಖರತೆ", detail: "OpenCV ಕಂಪ್ಯೂಟರ್ ವಿಷನ್" },
        { val: "15–20%", label: "ಎಲೆ ತ್ಯಾಜ್ಯ ಕಡಿತ", detail: "ಹಂತ-ಆಧಾರಿತ ಆಪ್ಟಿಮೈಸೇಶನ್" },
        { val: "2–3 ದಿನ", label: "ಕೊಯ್ಲು ಸಮಯ ಮುನ್ಸೂಚನೆ", detail: "ಹವಾಮಾನ ಮಾದರಿ" },
        { val: "5 ಮಾಡ್ಯೂಲ್", label: "ಸಮಗ್ರ ಕೃಷಿ ಪರಿಹಾರ", detail: "ಸಂಪೂರ್ಣ ಬೆಳೆ ಮುನ್ಸೂಚನೆ" }
      ]
    },
    modulesSection: {
      badge: "ಸಮಗ್ರ ನಿರ್ಧಾರ ಬೆಂಬಲ",
      title: "ಐದು ಸಮಗ್ರ ಎಐ ಪ್ರಮುಖ ಮಾಡ್ಯೂಲ್‌ಗಳು",
      desc: "ರೇಷ್ಮೆ ರೈತರ ಬೆಳೆ ಇಳುವರಿ ಹೆಚ್ಚಿಸಲು ಮತ್ತು ರೇಷ್ಮೆ ಆದಾಯವನ್ನು ಗರಿಷ್ಠಗೊಳಿಸಲು ವಿಶೇಷವಾಗಿ ವಿನ್ಯಾಸಗೊಳಿಸಲಾಗಿದೆ.",
      capabilities: "ಪ್ರಮುಖ ಸಾಮರ್ಥ್ಯಗಳು:"
    },
    archSection: {
      badge: "ಉತ್ಪಾದನಾ ತಂತ್ರಜ್ಞಾನ ವ್ಯವಸ್ಥೆ",
      title: "ಮೈಕ್ರೋಸೇವಿಸ್ ಆರ್ಕಿಟೆಕ್ಚರ್ ಮತ್ತು ಡೇಟಾ ಹರಿವು",
      desc: "ವೇಗದ ಮೊಬೈಲ್ ಪ್ರತಿಕ್ರಿಯೆಗಳು, ಎಐ ಸಿವಿ ಸ್ಕ್ಯಾನಿಂಗ್ ಮತ್ತು ಸುರಕ್ಷಿತ ಡೇಟಾ ಸಂಗ್ರಹಣೆಯನ್ನು ಒದಗಿಸುವ ಆಧುನಿಕ ವ್ಯವಸ್ಥೆ.",
      cards: [
        { icon: "📱", title: "ಮೊಬೈಲ್ ಫ್ರಂಟ್‌ಎಂಡ್ ಆ್ಯಪ್", desc: "ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನಿಂಗ್, ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಮೆಟ್ರಿಕ್‌ಗಳು, ಆಹಾರ ಪಟ್ಟಿ ಮತ್ತು ಕನ್ನಡಿಗ ಎಐ ಕೊಪೈಲಟ್ ಹೊಂದಿರುವ ರಿಯಾಕ್ಟ್ ಆ್ಯಪ್." },
        { icon: "⚡", title: "Node.js Express ಬ್ಯಾಕೆಂಡ್", desc: "ಸುರಕ್ಷಿತ REST API ಗೇಟ್‌ವೇ, ಹವಾಮಾನ ಸೇವೆ, ಮತ್ತು Python ML ಸೇವೆಯೊಂದಿಗೆ ಸಂವಹನ ನಡೆಸುವ ಮುಖ್ಯ ವ್ಯವಸ್ಥೆ." },
        { icon: "🧠", title: "Python FastAPI ML ಸೇವೆ", desc: "OpenCV ಎಲೆ ತಪಾಸಣೆ, ಹುಳುಗಳ ಬೆಳವಣಿಗೆಯ ಲೆಕ್ಕಾಚಾರ ಮತ್ತು ಗೂಡು/ರೇಷ್ಮೆ ಇಳುವರಿ ಮುನ್ಸೂಚನೆ ನೀಡುವ ಎಐ ಸೇವೆ." }
      ]
    },
    downloadSection: {
      badge: "ರೈತರ ಬಳಕೆಗೆ ಸಿದ್ಧವಾಗಿದೆ",
      title: "ReshmeAI Android ಮೊಬೈಲ್ ಆ್ಯಪ್ ಪಡೆಯಿರಿ",
      desc: "ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಲು, ಹುಳುಗಳ ಆಹಾರ ಆಪ್ಟಿಮೈಸ್ ಮಾಡಲು ಮತ್ತು ಗೂಡಿನ ಇಳುವರಿ ತಿಳಿಯಲು ನಿಮ್ಮ ಮೊಬೈಲ್‌ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.",
      cardTitle: "ReshmeAI ರೈತ ಪೋರ್ಟಲ್ (v1.0.0)",
      cardSub: "Android APK • ಬಿಡುಗಡೆ ಪ್ಯಾಕೇಜ್",
      status: "ಸ್ಥಿರ ಆವೃತ್ತಿ",
      instTitle: "ಇನ್‌ಸ್ಟಾಲೇಶನ್ ಮಾರ್ಗದರ್ಶಿ:",
      instSteps: [
        "ReshmeAI-v1.0.0.apk ಫೈಲ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
        "ಮೊಬೈಲ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ನಲ್ಲಿ \"Unknown Sources\" ಅನುಮತಿಸಿ.",
        "APK ಫೈಲ್ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ.",
        "ನಿಮ್ಮ ತೋಟದ ವಿವರ ಮತ್ತು ರೇಷ್ಮೆ ಹುಳುಗಳ ಬ್ಯಾಚ್ ನೋಂದಾಯಿಸಿ."
      ],
      btnDownloadMain: "ReshmeAI-v1.0.0.apk (18.4 MB) ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
    },
    footer: {
      title: "ReshmeAI ರೇಷ್ಮೆ ಕೃಷಿ ವ್ಯವಸ್ಥೆ",
      baseline: "ಉತ್ಪಾದನಾ ಆವೃತ್ತಿ",
      tagline: "ಎಐ-ಚಾಲಿತ ನಿಖರ ರೇಷ್ಮೆ ಕೃಷಿ ಮತ್ತು ಇಳುವರಿ ಮುನ್ಸೂಚನೆ"
    }
  },

  hi: {
    nav: {
      sub: "सटीक रेशम कीट पालन",
      overview: "अवलोकन",
      modules: "5 मुख्य मॉड्यूल",
      architecture: "आर्किटेक्चर",
      downloadNav: "ऐप डाउनलोड",
      btnDownload: "Android APK डाउनलोड करें"
    },
    hero: {
      badge: "रेशम पालन निर्णय सहायता प्रणाली • मोबाइल + एआई एपीआई",
      titlePre: "एआई-संचालित ",
      titleSpan: "सटीक रेशम कीट पालन",
      titlePost: " और उपज पूर्वानुमान",
      desc: "रेशम कीट पालकों को संपूर्ण उत्पादन चक्र में सहायता — शहतूत पत्ती कटाई से लेकर कंप्यूटर-विज़न गुणवत्ता मूल्यांकन, कीट आहार अनुकूलन और कोकून/रेशम उपज पूर्वानुमान तक।",
      btnApk: "Android ऐप (APK) डाउनलोड करें",
      btnExplore: "मुख्य मॉड्यूल देखें",
      metrics: [
        { val: "94%+", label: "पत्ती स्कैनर सटीकता", detail: "OpenCV विज़न पाइपलाइन" },
        { val: "15–20%", label: "पत्ती बर्बादी कमी", detail: "चरण-आधारित अनुकूलन" },
        { val: "2–3 दिन", label: "पूर्वानुमानित कटाई अवधि", detail: "मौसम एवं परिपक्वता मॉडल" },
        { val: "5 मॉड्यूल", label: "समेकित एआई प्रणाली", detail: "पूर्ण उत्पादन कवरेज" }
      ]
    },
    modulesSection: {
      badge: "एंड-टू-एंड निर्णय सहायता",
      title: "पाँच एकीकृत एआई मुख्य मॉड्यूल",
      desc: "विशेष रूप से रेशम किसानों की फसल उपज बढ़ाने और रेशम आय को अधिकतम करने के लिए डिज़ाइन किया गया।",
      capabilities: "मुख्य क्षमताएं:"
    },
    archSection: {
      badge: "उत्पादन प्रौद्योगिकी स्टैक",
      title: "माइक्रोसर्विस आर्किटेक्चर एवं डेटा प्रवाह",
      desc: "मॉड्यूलर सेटअप जो तेज़ मोबाइल प्रतिक्रियाएँ, स्केलेबल विज़न प्रोसेसिंग और सुरक्षित डेटा संग्रह प्रदान करता है।",
      cards: [
        { icon: "📱", title: "मोबाइल फ्रंटएंड ऐप", desc: "कैमरा स्कैनिंग, डैशबोर्ड मेट्रिक्स, आहार लॉग और एआई सह-पायलट चैट के साथ रिएक्ट ऐप।" },
        { icon: "⚡", title: "Node.js Express बैकएंड", desc: "सुरक्षित REST API गेटवे, मौसम सेवा और Python ML माइक्रोसर्विस के साथ संचार करने वाला मुख्य बैकएंड।" },
        { icon: "🧠", title: "Python FastAPI ML सेवा", desc: "OpenCV पत्ती छवि विश्लेषण, कीट वृद्धि लॉजिक और कोकून/रेशम उपज पूर्वानुमान मॉडल चलाता है।" }
      ]
    },
    downloadSection: {
      badge: "किसानों के उपयोग हेतु तैयार",
      title: "ReshmeAI Android मोबाइल ऐप प्राप्त करें",
      desc: "शहतूत पत्तियों को स्कैन करने, रेशम कीट आहार को अनुकूलित करने और कटाई पूर्वानुमान प्राप्त करने के लिए अपने मोबाइल में इंस्टॉल करें।",
      cardTitle: "ReshmeAI किसान पोर्टल (v1.0.0)",
      cardSub: "Android APK • रिलीज़ पैकेज",
      status: "स्थिर संस्करण",
      instTitle: "इंस्टॉलेशन निर्देश:",
      instSteps: [
        "ReshmeAI-v1.0.0.apk फ़ाइल डाउनलोड करें।",
        "मोबाइल सेटिंग्स में \"Unknown Sources\" अनुमति दें।",
        "APK फ़ाइल पर टैप करके इंस्टॉल करें।",
        "अपने खेत का स्थान और सक्रिय कीट बैच पंजीकृत करें।"
      ],
      btnDownloadMain: "ReshmeAI-v1.0.0.apk (18.4 MB) डाउनलोड करें"
    },
    footer: {
      title: "ReshmeAI रेशम पालन प्रणाली",
      baseline: "उत्पादन संस्करण",
      tagline: "एआई-संचालित सटीक रेशम कीट पालन और उपज पूर्वानुमान"
    }
  },

  te: {
    nav: {
      sub: "ఖచ్చితమైన పట్టు పరిశ్రమ",
      overview: "అవలోకనం",
      modules: "5 ప్రధాన మాడ్యూళ్లు",
      architecture: "ఆర్కిటెక్చర్",
      downloadNav: "యాప్ డౌన్‌లోడ్",
      btnDownload: "Android APK డౌన్‌లోడ్ చేయండి"
    },
    hero: {
      badge: "పట్టు పెంపకం నిర్ణయ సహాయ వ్యవస్థ • మొబైల్ + ఏఐ సేవ",
      titlePre: "ఏఐ-చాలక ",
      titleSpan: "ఖచ్చితమైన పట్టు పెంపకం",
      titlePost: " & దిగుబడి అంచనా",
      desc: "పట్టు రైతులకు ఉత్పత్తి దశలన్నింటిలో సహాయం — మల్బరీ ఆకుల కోత నుండి కంప్యూటర్ విజన్ నాణ్యత పరీక్ష, పట్టుపురుగుల మేత యాజమాన్యం మరియు దిగుబడి అంచనా వరకు.",
      btnApk: "Android యాప్ (APK) డౌన్‌లోడ్ చేయండి",
      btnExplore: "మాడ్యూళ్లను పరిశీలించండి",
      metrics: [
        { val: "94%+", label: "ఆకు స్కానర్ ఖచ్చితత్వం", detail: "OpenCV విజన్ పైప్‌లైన్" },
        { val: "15–20%", label: "ఆకు వృధా తగ్గింపు", detail: "దశల ఆధారిత ఆప్టిమైజేషన్" },
        { val: "2–3 రోజులు", label: "అంచనా కోత సమయం", detail: "వాతావరణం & పరిపక్వత మోడల్" },
        { val: "5 మాడ్యూళ్లు", label: "సమగ్ర ఏఐ పరిష్కారం", detail: "పూర్తి ఉత్పత్తి పరిధి" }
      ]
    },
    modulesSection: {
      badge: "సమగ్ర నిర్ణయ సహాయం",
      title: "ఐదు సమగ్ర ఏఐ ప్రధాన మాడ్యూళ్లు",
      desc: "రైతుల పంట దిగుబడిని పెంచడానికి మరియు పట్టు ద్వారా ఆదాయాన్ని గరిష్టం చేయడానికి ప్రత్యేకంగా రూపొందించబడింది.",
      capabilities: "ప్రధాన సామర్థ్యాలు:"
    },
    archSection: {
      badge: "ఉత్పత్తి సాంకేతిక వ్యవస్థ",
      title: "మైక్రోసర్వీస్ ఆర్కిటెక్చర్ & డేటా ప్రవాహం",
      desc: "వేగవంతమైన మొబైల్ స్పందనలు, స్కేలబుల్ ఏఐ ప్రాసెసింగ్ మరియు భద్రమైన డేటా నిల్వను అందించే ఆధునిక వ్యవస్థ.",
      cards: [
        { icon: "📱", title: "మొబైల్ ఫ్రంట్‌ఎండ్ యాప్", desc: "కెమెరా స్కానింగ్, డాష్‌బోర్డ్ మెట్రిక్స్, మేత లాగ్‌లు మరియు ఏఐ సహాయకుడితో కూడిన రియాక్ట్ యాప్." },
        { icon: "⚡", title: "Node.js Express బ్యాకెండ్", desc: "భద్రమైన REST API గేట్‌వే, వాతావరణ సేవలు మరియు Python ML మైక్రోసర్వీస్‌తో అనుసంధానమయ్యే ప్రధాన బ్యాకెండ్." },
        { icon: "🧠", title: "Python FastAPI ML సేవ", desc: "OpenCV ఆకుల విశ్లేషణ, పట్టుపురుగుల ఎదుగుదల లాజిక్ మరియు కకూన్/పట్టు దిగుబడి అంచనా మోడళ్లను నడుపుతుంది." }
      ]
    },
    downloadSection: {
      badge: "రైతుల వాడకానికి సిద్ధం",
      title: "ReshmeAI Android మొబైల్ యాప్ పొందండి",
      desc: "మల్బరీ ఆకులను స్కాన్ చేయడానికి, మేత నిర్వహణను సరిచేసుకోవడానికి మరియు దిగుబడి అంచనాలను పొందడానికి మీ మొబైల్‌లో ఇన్‌స్టాల్ చేయండి.",
      cardTitle: "ReshmeAI రైతు పోర్టల్ (v1.0.0)",
      cardSub: "Android APK • విడుదల ప్యాకేజీ",
      status: "స్థిరమైన వర్షన్",
      instTitle: "ఇన్‌స్టాలేషన్ మార్గదర్శకాలు:",
      instSteps: [
        "ReshmeAI-v1.0.0.apk ఫైల్ డౌన్‌లోడ్ చేయండి.",
        "మొబైల్ సెట్టింగ్స్‌లో \"Unknown Sources\" అనుమతించండి.",
        "APK ఫైల్‌పై టాప్ చేసి ఇన్‌స్టాల్ చేయండి.",
        "మీ తోట వివరాలు మరియు సక్రియ బ్యాచ్‌ను నమోదు చేయండి."
      ],
      btnDownloadMain: "ReshmeAI-v1.0.0.apk (18.4 MB) డౌన్‌లోడ్ చేయండి"
    },
    footer: {
      title: "ReshmeAI పట్టు పెంపకం వ్యవస్థ",
      baseline: "ఉత్పత్తి ఆవృత్తి",
      tagline: "ఏఐ-చాలక ఖచ్చితమైన పట్టు పెంపకం & దిగుబడి అంచనా"
    }
  },

  ta: {
    nav: {
      sub: "துல்லிய பட்டு வளர்ப்பு",
      overview: "அறிமுகம்",
      modules: "5 முக்கிய தொகுதிகள்",
      architecture: "கட்டமைப்பு",
      downloadNav: "செயலி பதிவிறக்கம்",
      btnDownload: "Android APK பதிவிறக்குக"
    },
    hero: {
      badge: "பட்டு வளர்ப்பு முடிவு உதவி அமைப்பு • மொபைல் + ஏஐ சேவை",
      titlePre: "ஏஐ-இயங்கும் ",
      titleSpan: "துல்லிய பட்டு வளர்ப்பு",
      titlePost: " & மகசூல் கணிப்பு",
      desc: "பட்டு விவசாயிகளுக்கு முழு உற்பத்தி சுழற்சியிலும் உதவி — மல்பெரி இலை அறுவடையிலிருந்து கம்ப்யூட்டர் விஷன் தர பரிசோதனை, உணவு மேலாண்மை மற்றும் பட்டு மகசூல் கணிப்பு வரை.",
      btnApk: "Android செயலி (APK) பதிவிறக்குக",
      btnExplore: "முக்கிய தொகுதிகளை காண்க",
      metrics: [
        { val: "94%+", label: "இலை ஸ்கேனர் துல்லியம்", detail: "OpenCV விஷன் பைப்லைன்" },
        { val: "15–20%", label: "இலை வீணாதல் குறைப்பு", detail: "வளர்ச்சி நிலை உகப்பாக்கம்" },
        { val: "2–3 நாட்கள்", label: "கணிக்கப்பட்ட அறுவடை நேரம்", detail: "வானிலை & முதிர்ச்சி மாதிரி" },
        { val: "5 தொகுதிகள்", label: "ஒருங்கிணைந்த ஏஐ திட்டம்", detail: "முழு உற்பத்தி பாதுகாப்பு" }
      ]
    },
    modulesSection: {
      badge: "முழுமையான முடிவு உதவி",
      title: "ஐந்து ஒருங்கிணைந்த ஏஐ முக்கிய தொகுதிகள்",
      desc: "விவசாயிகளின் பயிர் மகசூலை அதிகரிக்கவும், பட்டு வருமானத்தை பெருக்கவும் சிறப்பாக வடிவமைக்கப்பட்டது.",
      capabilities: "முக்கிய திறன்கள்:"
    },
    archSection: {
      badge: "உற்பத்தி தொழில்நுட்ப கட்டமைப்பு",
      title: "மைக்ரோசர்வீஸ் கட்டமைப்பு & தரவு ஓட்டம்",
      desc: "வேகமான மொபைல் பதில்கள், ஏஐ ஸ்கேனிங் மற்றும் பாதுகாப்பான தரவு சேமிப்பை வழங்கும் நவீன கட்டமைப்பு.",
      cards: [
        { icon: "📱", title: "மொபைல் ஃப்ரண்ட்எண்ட் செயலி", desc: "கேமரா ஸ்கேனிங், டாஷ்போர்டு புள்ளிவிவரங்கள், உணவு அட்டவணை மற்றும் ஏஐ உதவியாளருடன் கூடிய ரியாக்ட் செயலி." },
        { icon: "⚡", title: "Node.js Express பேக்கெண்ட்", desc: "பாதுகாப்பான REST API கேட்வே, வானிலை சேவை மற்றும் Python ML சேவையுடன் தொடர்புகொள்ளும் முதன்மை பேக்கெண்ட்." },
        { icon: "🧠", title: "Python FastAPI ML சேவை", desc: "OpenCV இலை பட பகுப்பாய்வு, புழு வளர்ச்சி தர்க்கம் மற்றும் கூடு/பட்டு மகசூல் கணிப்பு மாதிரிகளை இயக்குகிறது." }
      ]
    },
    downloadSection: {
      badge: "விவசாயிகள் பயன்படுத்த தயார்",
      title: "ReshmeAI Android மொபைல் செயலியை பெறுங்கள்",
      desc: "மல்பெரி இலைகளை ஸ்கேன் செய்யவும், உணவு அளவை சீராக்கவும், அறுவடை கணிப்புகளை பெறவும் உங்கள் மொபைலில் நிறுவவும்.",
      cardTitle: "ReshmeAI விவசாயி போர்டல் (v1.0.0)",
      cardSub: "Android APK • வெளியீட்டு தொகுப்பு",
      status: "நிலையான பதிப்பு",
      instTitle: "நிறுவல் வழிமுறைகள்:",
      instSteps: [
        "ReshmeAI-v1.0.0.apk கோப்பை பதிவிறக்கவும்.",
        "மொபைல் அமைப்புகளில் \"Unknown Sources\" அனுமதிக்கவும்.",
        "APK கோப்பை தட்டி நிறுவவும்.",
        "உங்கள் பண்ணை இடம் மற்றும் புழுக்களின் பேட்சை பதிவு செய்யவும்."
      ],
      btnDownloadMain: "ReshmeAI-v1.0.0.apk (18.4 MB) பதிவிறக்குக"
    },
    footer: {
      title: "ReshmeAI பட்டு வளர்ப்பு அமைப்பு",
      baseline: "உற்பத்தி பதிப்பு",
      tagline: "ஏஐ-இயங்கும் துல்லிய பட்டு வளர்ப்பு & மகசூல் கணிப்பு"
    }
  },

  ml: {
    nav: {
      sub: "കൃത്യതയുള്ള പട്ടുനൂൽ കൃഷി",
      overview: "അവലോകനം",
      modules: "5 പ്രധാന മൊഡ്യൂളുകൾ",
      architecture: "ആർക്കിടെക്ചർ",
      downloadNav: "ആപ്പ് ഡൗൺലോഡ്",
      btnDownload: "Android APK ഡൗൺലോഡ് ചെയ്യുക"
    },
    hero: {
      badge: "പട്ടുനൂൽ കൃഷി തീരുമാന സഹായ സംവിധാനം • മൊബൈൽ + എഐ സേവനം",
      titlePre: "എഐ-പ്രവർത്തിത ",
      titleSpan: "കൃത്യതയുള്ള പട്ടുനൂൽ കൃഷി",
      titlePost: " & വിളവ് പ്രവചനം",
      desc: "പട്ടുനൂൽ കർഷകർക്ക് മുഴുവൻ ഉൽപ്പാദന ഘട്ടങ്ങളിലും പിന്തുണ — മൾബറി ഇല വിളവെടുപ്പ് മുതൽ കമ്പ്യൂട്ടർ വിഷൻ ഗുണനിലവാര പരിശോധന, തീറ്റ ക്രമീകരണം, വിളവ് പ്രവചനം വരെ.",
      btnApk: "Android ആപ്പ് (APK) ഡൗൺലോഡ് ചെയ്യുക",
      btnExplore: "പ്രധാന മൊഡ്യൂളുകൾ കാണുക",
      metrics: [
        { val: "94%+", label: "ഇല സ്കാനർ കൃത്യത", detail: "OpenCV കമ്പ്യൂട്ടർ വിഷൻ" },
        { val: "15–20%", label: "ഇല നഷ്ടം കുറയ്ക്കൽ", detail: "വളർച്ച ഘട്ട ആപ്റ്റിമൈസേഷൻ" },
        { val: "2–3 ദിവസം", label: "പ്രതീക്ഷിത വിളവെടുപ്പ് സമയം", detail: "കാലാവസ്ഥ & പാകത മോഡൽ" },
        { val: "5 മൊഡ്യൂളുകൾ", label: "സംയോജിത എഐ പദ്ധതി", detail: "പൂർണ്ണ ഉൽപ്പാദന സുരക്ഷ" }
      ]
    },
    modulesSection: {
      badge: "പൂർണ്ണ തീരുമാന പിന്തുണ",
      title: "അഞ്ച് സംയോജിത എഐ പ്രധാന മൊഡ്യൂളുകൾ",
      desc: "കർഷകരുടെ വിളവ് വർദ്ധിപ്പിക്കുന്നതിനും പട്ടുനൂൽ വരുമാനം പരമാവധിയാക്കുന്നതിനും പ്രത്യേകമായി രൂപകൽപ്പന ചെയ്തത്.",
      capabilities: "പ്രധാന ശേഷികൾ:"
    },
    archSection: {
      badge: "ഉൽപ്പാദന സാങ്കേതിക സംവിധാനം",
      title: "മൈക്രോസർവീസ് ആർക്കിടെക്ചർ & ഡാറ്റാ ഒഴുക്ക്",
      desc: "വേഗത്തിലുള്ള മൊബൈൽ പ്രതികരണങ്ങൾ, എഐ സ്കാനിംഗ്, സുരക്ഷിതമായ ഡാറ്റ സംഭരണം എന്നിവ നൽകുന്ന ആധുനിക സംവിധാനം.",
      cards: [
        { icon: "📱", title: "മൊബൈൽ ഫ്രണ്ട്എൻഡ് ആപ്പ്", desc: "ക്യാമറ സ്കാനിംഗ്, ഡാഷ്‌ബോർഡ് സ്ഥിതിവിവരക്കണക്കുകൾ, തീറ്റ ലോഗുകൾ, എഐ സഹായി എന്നിവ അടങ്ങിയ റിയാക്റ്റ് ആപ്പ്." },
        { icon: "⚡", title: "Node.js Express ബാക്കെൻഡ്", desc: "സുരക്ഷിതമായ REST API ഗേറ്റ്‌വേ, കാലാവസ്ഥാ സേവനം, Python ML മൈക്രോസർവീസുമായി ബന്ധപ്പെടുന്ന പ്രധാന ബാക്കെൻഡ്." },
        { icon: "🧠", title: "Python FastAPI ML സേവനം", desc: "OpenCV ഇല ചിത്ര പരിശോധന, പുഴു വളർച്ചാ യുക്തി, കൂട്/പട്ട് വിളവ് പ്രവചന മോഡലുകൾ എന്നിവ പ്രവർത്തിപ്പിക്കുന്നു." }
      ]
    },
    downloadSection: {
      badge: "കർഷകർക്ക് ഉപയോഗിക്കാൻ തയ്യാറാണ്",
      title: "ReshmeAI Android മൊബൈൽ ആപ്പ് നേടുക",
      desc: "മൾബറി ഇലകൾ സ്കാൻ ചെയ്യാനും തീറ്റ ക്രമം നന്നാക്കാനും വിളവെടുപ്പ് പ്രവചനങ്ങൾ ലഭിക്കാനും നിങ്ങളുടെ മൊബൈലിൽ ഇൻസ്റ്റാൾ ചെയ്യുക.",
      cardTitle: "ReshmeAI കർഷക പോർട്ടൽ (v1.0.0)",
      cardSub: "Android APK • റിലീസ് പാക്കേജ്",
      status: "സ്ഥിരതയുള്ള പതിപ്പ്",
      instTitle: "ഇൻസ്റ്റലേഷൻ നിർദ്ദേശങ്ങൾ:",
      instSteps: [
        "ReshmeAI-v1.0.0.apk ഫയൽ ഡൗൺലോഡ് ചെയ്യുക.",
        "മൊബൈൽ സെറ്റിംഗ്സിൽ \"Unknown Sources\" അനുവദിക്കുക.",
        "APK ഫയലിൽ ക്ലിക്ക് ചെയ്ത് ഇൻസ്റ്റാൾ ചെയ്യുക.",
        "നിങ്ങളുടെ തോട്ടത്തിന്റെ വിവരങ്ങളും പുഴു ബാച്ചും രജിസ്റ്റർ ചെയ്യുക."
      ],
      btnDownloadMain: "ReshmeAI-v1.0.0.apk (18.4 MB) ഡൗൺലോഡ് ചെയ്യുക"
    },
    footer: {
      title: "ReshmeAI പട്ടുനൂൽ കൃഷി സംവിധാനം",
      baseline: "ഉൽപ്പാദന പതിപ്പ്",
      tagline: "എഐ-പ്രവർത്തിത കൃത്യതയുള്ള പട്ടുനൂൽ കൃഷിയും വിളവ് പ്രവചനവും"
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [lang, setLang] = useState('en'); // 'en', 'kn', 'hi', 'te', 'ta', 'ml'
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const languagesList = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' }
  ];

  const handleDownloadAndRedirect = (e) => {
    if (e) e.preventDefault();
    
    // 1. Trigger APK file download
    const link = document.createElement('a');
    link.href = '/ReshmeAI-v1.0.0.apk';
    link.download = 'ReshmeAI-v1.0.0.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 2. Redirect to Mobile Web App
    setTimeout(() => {
      window.location.href = 'http://localhost:3000';
    }, 800);
  };

  const currentLangObj = languagesList.find(l => l.code === lang) || languagesList[0];

  const modules = [
    {
      id: 1,
      name: lang === 'kn' ? "ಹಿಪ್ಪುನೇರಳೆ ಎಲೆ ಕೊಯ್ಲು ವೇಳಾಪಟ್ಟಿ" :
            lang === 'hi' ? "शहतूत पत्ती कटाई अनुसूची" :
            lang === 'te' ? "మల్బరీ ఆకుల కోత షెడ్యూల్" :
            lang === 'ta' ? "மல்பெரி இலை அறுவடை அட்டவணை" :
            lang === 'ml' ? "മൾബറി ഇല വിളവെടുപ്പ് ഷെഡ്യൂൾ" : "Mulberry Harvest Scheduler",
      badge: "Module 1",
      icon: Icons.Calendar,
      color: "from-amber-500 to-orange-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/10",
      tagline: "Predictive 2–3 Day Harvest Window Optimization",
      desc: "Combines leaf maturity stages (75-90%), local temperature, humidity, rainfall, and mulberry variety profiles (V1, S36, M5) to recommend the exact peak harvesting date, maximizing nutritive quality for silkworms.",
      features: [
        "2-3 day optimal harvest window determination",
        "Leaf maturity progression forecasting",
        "Weather impact & rainfall penalty factors",
        "Previous yield historical blending"
      ],
      stat: "82–92%",
      statLabel: "Target Leaf Maturity Score"
    },
    {
      id: 2,
      name: lang === 'kn' ? "ಎಐ ಎಲೆ ಗುಣಮಟ್ಟ ಸ್ಕ್ಯಾನರ್" :
            lang === 'hi' ? "एआई पत्ती गुणवत्ता स्कैनर" :
            lang === 'te' ? "ఏఐ ఆకు నాణ్యత స్కానర్" :
            lang === 'ta' ? "ஏஐ இலை தர ஸ்கேனர்" :
            lang === 'ml' ? "എഐ ഇല ഗുണനിലവാര സ്കാനർ" : "AI Leaf Quality Scanner",
      badge: "Module 2",
      icon: Icons.Sparkles,
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/10",
      tagline: "OpenCV Computer Vision Quality Assessment",
      desc: "Uses smartphone camera image processing to segment mulberry leaves, compute RGB/HSV colour distributions (green, yellow, brown ratio), detect leaf spot/damage density, and classify feeding suitability into Excellent, Good, Moderate, or Poor grades.",
      features: [
        "Instant camera & gallery base64 image scanning",
        "Colour distribution analysis (Green vs Yellow vs Brown)",
        "Edge density spot & pest damage detection",
        "Direct feeding suitability grade output"
      ],
      stat: "< 2.5s",
      statLabel: "Scan & Analysis Speed"
    },
    {
      id: 3,
      name: lang === 'kn' ? "ಆಹಾರ ಪ್ರಮಾಣ ಆಪ್ಟಿಮೈಜರ್" :
            lang === 'hi' ? "दैनिक आहार अनुकूलक" :
            lang === 'te' ? "రోజువారీ మేత ఆప్టిమైజర్" :
            lang === 'ta' ? "தினசரி உணவு மேலாண்மை" :
            lang === 'ml' ? "ദിനചര്യ തീറ്റ ഓപ്റ്റിമൈസർ" : "Dynamic Feeding Optimizer",
      badge: "Module 3",
      icon: Icons.Utensils,
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/10",
      tagline: "Instar Rearing Schedule & Wastage Prevention",
      desc: "Calculates precise daily mulberry leaf feeding requirements (kg) based on silkworm population, rearing instar stage (1st–5th instar), intra-instar age, scanned leaf quality scores, and historical wastage feedback.",
      features: [
        "Instar 1 to 5 biological intake baseline curves",
        "4-session daily feeding schedule (06:00, 11:00, 16:00, 21:00)",
        "Leaf quality compensation (+5% to +15%)",
        "Feedback loop reducing leaf wastage below 5%"
      ],
      stat: "15–20%",
      statLabel: "Leaf Wastage Reduction"
    },
    {
      id: 4,
      name: lang === 'kn' ? "ಗೂಡು ಮತ್ತು ರೇಷ್ಮೆ ಇಳುವರಿ ಮುನ್ಸೂಚನೆ" :
            lang === 'hi' ? "कोकून और रेशम उपज पूर्वानुमान" :
            lang === 'te' ? "కకూన్ & పట్టు దిగుబడి అంచనా" :
            lang === 'ta' ? "கூடு & பட்டு மகசூல் கணிப்பு" :
            lang === 'ml' ? "കൂട് & പട്ട് വിളവ് പ്രവചനം" : "Cocoon & Silk Yield Predictor",
      badge: "Module 4",
      icon: Icons.TrendingUp,
      color: "from-indigo-500 to-purple-500",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/30",
      bgColor: "bg-indigo-500/10",
      tagline: "Two-Stage Production & Silk Recovery Forecast",
      desc: "Predicts Stage 1 cocoon harvest yield (kg), average cocoon weight (g), shell ratio (%), quality grade (Grade A/B/C), and Stage 2 raw silk yield (kg), recovery rate (%), and filament length (meters).",
      features: [
        "Stage 1: Cocoon yield (kg) & Shell ratio (%) forecasting",
        "Cocoon quality grading (Grade A, B, C)",
        "Stage 2: Raw silk yield (kg) & recovery rate (%)",
        "AI confidence scoring & factor explanations"
      ],
      stat: "88–95%",
      statLabel: "Forecast Accuracy"
    },
    {
      id: 5,
      name: lang === 'kn' ? "ಎಐ ರೇಷ್ಮೆ ಕೃಷಿ ಸಹಾಯಕ (ಕೊಪೈಲಟ್)" :
            lang === 'hi' ? "एआई रेशम पालन सह-पायलट" :
            lang === 'te' ? "ఏఐ పట్టు సహాయకుడు" :
            lang === 'ta' ? "ஏஐ பட்டு உதவியாளர்" :
            lang === 'ml' ? "എഐ പട്ട് സഹായി" : "AI Sericulture Copilot",
      badge: "Module 5",
      icon: Icons.Bot,
      color: "from-rose-500 to-pink-500",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/30",
      bgColor: "bg-rose-500/10",
      tagline: "Context-Aware Farmer Decision Support Assistant",
      desc: "Text-based assistant grounded in farmer's active farm metrics, latest leaf quality scans, and batch rearing records to answer questions about harvest timing, disease prevention, and feeding adjustments.",
      features: [
        "Contextual query understanding (Harvest, Feeding, Yield)",
        "Grounded in real farm & batch state metrics",
        "MongoDB conversation history logging",
        "Quick prompt suggestions for easy mobile typing"
      ],
      stat: "24 / 7",
      statLabel: "Farmer Advisory Support"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ── Top Navigation Bar ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              🍃
            </div>
            <div>
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Reshme<span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 block -mt-1 font-semibold uppercase tracking-wider">
                {t.nav.sub}
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-semibold text-slate-300">
            <a href="#overview" className="hover:text-emerald-400 transition-colors">{t.nav.overview}</a>
            <a href="#modules" className="hover:text-emerald-400 transition-colors">{t.nav.modules}</a>
            <a href="#architecture" className="hover:text-emerald-400 transition-colors">{t.nav.architecture}</a>
            <a href="#download" className="hover:text-emerald-400 transition-colors">{t.nav.downloadNav}</a>
          </div>

          <div className="flex items-center gap-3">
            
            {/* 6-Language Multi-Lingual Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                className="flex items-center gap-2 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-400 transition-all shadow-md"
              >
                <Icons.Globe />
                <span>{currentLangObj.native}</span>
                <span className="text-[10px] text-slate-400">▼</span>
              </button>

              {isLangDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-slate-900 border border-slate-800 rounded-2xl p-1.5 shadow-2xl z-50 animate-fadeIn space-y-1">
                  {languagesList.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center justify-between ${
                        lang === l.code
                          ? 'bg-emerald-500 text-slate-950 font-extrabold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{l.native}</span>
                      <span className="text-[10px] text-slate-400 uppercase">{l.code}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleDownloadAndRedirect}
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Icons.Download /> {t.nav.btnDownload}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ─────────────────────────────────────────────────── */}
      <section id="overview" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-emerald-500/30 px-3.5 py-1.5 rounded-full text-emerald-400 text-xs font-bold shadow-md">
            <Icons.ShieldCheck />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            {t.hero.titlePre}<span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">{t.hero.titleSpan}</span>{t.hero.titlePost}
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {t.hero.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handleDownloadAndRedirect}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3.5 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
            >
              <Icons.Download /> {t.hero.btnApk}
            </button>
            <a
              href="#modules"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold px-6 py-3.5 rounded-2xl text-sm transition-all"
            >
              {t.hero.btnExplore} <Icons.ArrowRight />
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {t.hero.metrics.map((m, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-sm">
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">{m.val}</div>
                <div className="text-xs font-bold text-white mt-1">{m.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{m.detail}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 Core Modules Interactive Showcase ────────────────────────────── */}
      <section id="modules" className="py-20 bg-slate-900/50 border-y border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              {t.modulesSection.badge}
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              {t.modulesSection.title}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              {t.modulesSection.desc}
            </p>
          </div>

          {/* Module Selector Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none justify-start sm:justify-center">
            {modules.map((m, idx) => {
              const IconComp = m.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={m.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? `${m.bgColor} ${m.textColor} ${m.borderColor} shadow-lg`
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <IconComp />
                  <span>{m.badge}: {m.name}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Module Detail Panel */}
          {(() => {
            const m = modules[activeTab];
            const IconComp = m.icon;
            return (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 grid md:grid-cols-12 gap-8 items-center shadow-2xl">
                <div className="md:col-span-7 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${m.bgColor} ${m.textColor} ${m.borderColor}`}>
                      {m.badge}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">{m.tagline}</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${m.bgColor} ${m.textColor}`}>
                      <IconComp />
                    </div>
                    {m.name}
                  </h3>

                  <p className="text-slate-300 text-sm leading-relaxed">{m.desc}</p>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      {t.modulesSection.capabilities}
                    </span>
                    {m.features.map((feat, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-200">
                        <div className={`w-4 h-4 rounded-full ${m.bgColor} ${m.textColor} flex items-center justify-center shrink-0`}>
                          <Icons.Check />
                        </div>
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-full text-center space-y-6">
                  <div className="space-y-1 pt-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{m.statLabel}</span>
                    <div className={`text-5xl font-black ${m.textColor}`}>{m.stat}</div>
                  </div>

                  <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-left space-y-2">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <Icons.Sparkles /> API Endpoint
                    </div>
                    <code className="text-[11px] font-mono text-emerald-400 block bg-slate-950 p-2 rounded border border-slate-800">
                      POST /api/{m.id === 1 ? 'predictions/harvest' : m.id === 2 ? 'leaf-analysis/analyse' : m.id === 3 ? 'feeding/optimise' : m.id === 4 ? 'predictions/cocoon-silk' : 'copilot'}
                    </code>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── System Architecture Section ──────────────────────────────────── */}
      <section id="architecture" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            {t.archSection.badge}
          </span>
          <h2 className="text-3xl font-black text-white tracking-tight">
            {t.archSection.title}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t.archSection.desc}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {t.archSection.cards.map((card, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
                {card.icon}
              </div>
              <h3 className="text-base font-bold text-white">{card.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Download APK Section ─────────────────────────────────────────── */}
      <section id="download" className="py-20 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-xs font-bold">
            <Icons.Download /> {t.downloadSection.badge}
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            {t.downloadSection.title}
          </h2>

          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            {t.downloadSection.desc}
          </p>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl mx-auto text-left space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="text-sm font-bold text-white">{t.downloadSection.cardTitle}</div>
                <div className="text-xs text-slate-400">{t.downloadSection.cardSub}</div>
              </div>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {t.downloadSection.status}
              </span>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="font-bold text-slate-200">{t.downloadSection.instTitle}</div>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-400">
                {t.downloadSection.instSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>

            <button
              onClick={handleDownloadAndRedirect}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/20 active:scale-[0.98] cursor-pointer"
            >
              <Icons.Download /> {t.downloadSection.btnDownloadMain}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-8 border-t border-slate-900 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">{t.footer.title}</span>
            <span>•</span>
            <span>{t.footer.baseline}</span>
          </div>
          <div>{t.footer.tagline}</div>
        </div>
      </footer>
    </div>
  );
}
