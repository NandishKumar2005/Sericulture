# AI-Powered Precision Sericulture and Production Forecasting System

## 1. Project Overview

### Project Title

AI-Powered Precision Sericulture and Production Forecasting System

### Project Type

AI-powered mobile decision-support system for sericulture.

### Primary Platform

Android mobile application.

### Supporting Platform

Public web portal for:

- Project information
- Feature information
- Screenshots
- Farmer benefits
- Android APK download
- Contact/support information

The mobile application is the main product.

---

# 2. Problem Statement

Sericulture requires proper management of mulberry leaves, harvesting, silkworm feeding, and production planning.

Traditional sericulture practices often depend heavily on fixed schedules and farmer experience. Variations in leaf maturity, weather conditions, silkworm growth, feeding quantity, and batch performance can affect cocoon and silk production.

Farmers may also find it difficult to estimate:

- The right time to harvest mulberry leaves
- The quality of available leaves
- The appropriate quantity of feed required
- Expected cocoon production
- Expected silk production

This project aims to develop an AI-powered mobile application that integrates these decision-support functions into a single platform.

---

# 3. Project Goal

Develop a farmer-friendly Android application that uses Artificial Intelligence, Machine Learning, and Computer Vision to provide data-driven recommendations throughout the sericulture production cycle.

The system should connect:

Mulberry Harvesting
        ↓
Leaf Quality
        ↓
Silkworm Feeding
        ↓
Cocoon Production
        ↓
Silk Production

The application should provide understandable recommendations rather than only displaying raw AI predictions.

---

# 4. Core Modules

The application must contain the following five major AI modules.

## Module 1: Predictive Harvest Scheduler

Purpose:

Predict the optimal 2–3 day harvesting window for mulberry leaves.

### Inputs

- Farm location
- Mulberry variety
- Plantation age
- Previous harvest date
- Previous harvest quantity
- Previous leaf yield
- Leaf maturity observations
- Temperature
- Humidity
- Rainfall
- Season
- Historical plantation data

### Outputs

- Recommended harvesting date
- Recommended harvesting window
- Expected leaf yield
- Estimated maturity percentage
- Confidence score
- Explanation of major factors affecting the prediction

### Example

Input:

Previous harvest:
2026-09-10

Current observations:
Leaf maturity: 82%
Temperature: 27°C
Humidity: 72%
Recent rainfall: 12 mm

Output:

Recommended harvesting window:
2026-09-17 to 2026-09-19

Expected leaf yield:
145 kg

Confidence:
87%

---

# 5. Module 2: AI Mulberry Leaf Quality Assessment

Purpose:

Allow the farmer to capture or upload a photograph of a mulberry leaf and use Computer Vision to estimate its visual quality.

### Input

Leaf image captured using mobile camera or selected from gallery.

### AI Analysis

The system should analyze visible characteristics such as:

- Color
- Maturity
- Texture
- Visible spots
- Visible damage
- Leaf size
- Leaf shape
- General visual quality

### Output

The system should provide:

- Quality score
- Quality category
- Visual observations
- Feeding suitability
- Confidence score

### Quality Categories

- Excellent
- Good
- Moderate
- Poor

### Example

Leaf Quality Score:
86/100

Category:
Good

Feeding Suitability:
Suitable

Confidence:
91%

### Suggested AI Technology

- Computer Vision
- CNN
- Transfer Learning
- MobileNet
- EfficientNet
- TensorFlow/Keras
- OpenCV

The model should be lightweight enough for mobile/API-based inference.

---

# 6. Module 3: Dynamic Feeding Optimizer

Purpose:

Recommend the appropriate daily mulberry leaf feeding quantity for a silkworm batch.

The system should use established sericulture feeding practices as the baseline and adjust recommendations based on available farm and batch data.

### Inputs

- Silkworm population
- Silkworm age
- Instar/growth stage
- Batch age
- Current leaf quality score
- Previous feeding quantity
- Actual leaf consumption
- Previous wastage
- Batch history
- Previous feeding efficiency

### Outputs

- Recommended daily leaf quantity
- Number of feedings per day
- Recommended quantity per feeding
- Expected consumption
- Expected wastage
- Feeding efficiency
- Explanation of recommendation

### Example

Silkworm population:
20,000

Growth stage:
5th instar

Leaf quality:
Good

Recommended daily leaf quantity:
32 kg

Feedings:
4 per day

Quantity per feeding:
8 kg

Expected wastage:
5–7%

---

# 7. Module 4: Cocoon and Silk Yield Prediction

This module consists of two connected prediction stages.

## 7.1 Cocoon Prediction

### Inputs

- Silkworm population
- Leaf quality
- Total feeding quantity
- Feeding efficiency
- Feeding wastage
- Batch history
- Silkworm growth information
- Relevant environmental/weather information

### Outputs

- Expected cocoon yield
- Expected cocoon quality
- Average cocoon weight
- Shell ratio
- Quality grade
- Confidence score

### Example

Expected cocoon production:
42 kg

Average cocoon weight:
1.65 g

Expected shell ratio:
22.5%

Quality:
Good

Confidence:
84%

---

## 7.2 Silk Production Prediction

The silk prediction model should use cocoon-related information to estimate final silk production.

### Inputs

- Cocoon weight
- Cocoon quality
- Shell ratio
- Expected silk recovery
- Historical production
- Batch information

### Outputs

- Expected silk production
- Expected silk recovery percentage
- Confidence score

### Example

Cocoon quantity:
42 kg

Expected silk recovery:
14.8%

Expected silk production:
6.2 kg

Confidence:
81%

---

# 8. Module 5: AI Sericulture Copilot

Purpose:

Provide a text-based AI assistant for farmers.

The Copilot should use the farmer's available farm, plantation, harvest, leaf, feeding, cocoon, and silk data to provide contextual recommendations.

## Important

The Copilot is TEXT ONLY.

Do not implement:

- Voice input
- Voice output
- Speech recognition
- Text-to-speech

Regional-language support should be text-based.

### Example Questions

Farmer:

"When should I harvest my mulberry leaves?"

Copilot:

"Based on your current leaf maturity and recent harvest records, the recommended harvesting window is September 17–19."

---

Farmer:

"How much leaf should I give today?"

Copilot:

"Your current batch has 20,000 silkworms in the 5th instar. Based on the current leaf quality and previous consumption, approximately 32 kg of leaves is recommended today."

---

Farmer:

"Why did my predicted cocoon yield decrease?"

Copilot:

"The predicted yield decreased mainly because the recent leaf quality score was lower and feeding wastage increased compared with the previous batch."

### Copilot Architecture

The Copilot should preferably combine:

1. Structured application data
2. Sericulture knowledge base
3. Retrieval-Augmented Generation (RAG)
4. Optional LLM API

The system should not depend entirely on an LLM.

If an external LLM is unavailable, a structured rule/knowledge-base implementation should provide basic responses.

---

# 9. User Roles

Initial version:

## Farmer

The farmer can:

- Register/login
- Create farm
- Add plantation information
- Add silkworm batches
- Record harvesting
- Upload leaf images
- View leaf quality
- View feeding recommendations
- Record actual feeding
- View cocoon predictions
- View silk predictions
- View analytics
- Ask the AI Copilot
- Receive notifications

Admin functionality is not required for the initial version unless needed later.

---

# 10. Mobile Application Screens

The Android application should contain the following screens.

## 10.1 Splash Screen

Displays:

- Application logo
- Project name
- Loading indicator

---

## 10.2 Login

Fields:

- Mobile number/email
- Password

Actions:

- Login
- Register
- Forgot password

---

## 10.3 Registration

Fields:

- Name
- Mobile number
- Email
- Password
- Location

---

## 10.4 Dashboard

Display:

- Farm summary
- Current silkworm batch
- Current leaf quality
- Next recommended harvest
- Today's feeding recommendation
- Expected cocoon yield
- Expected silk production
- Important notifications

---

## 10.5 Farm Management

Display and manage:

- Farm name
- Location
- Mulberry area
- Mulberry variety
- Plantation age
- Number of plots

---

## 10.6 Harvest Scheduler

Display:

- Current plantation information
- Leaf maturity
- Weather summary
- Previous harvest
- Recommended harvesting window
- Expected leaf yield
- Confidence
- Explanation

Actions:

- Record harvest
- View previous harvests

---

## 10.7 Leaf Scanner

Actions:

- Open camera
- Select image
- Analyze leaf

Display:

- Uploaded image
- Quality score
- Quality category
- Feeding suitability
- AI observations
- Confidence

---

## 10.8 Silkworm Batch

Display:

- Batch ID
- Start date
- Number of silkworms
- Current instar
- Batch age
- Current status

Actions:

- Add batch
- Update batch
- Record feeding
- Record cocoon production

---

## 10.9 Feeding Optimizer

Display:

- Current silkworm population
- Growth stage
- Leaf quality
- Previous feeding
- Recommended quantity
- Number of feedings
- Quantity per feeding
- Expected wastage

Actions:

- Record actual feeding
- Compare recommended vs actual

---

## 10.10 Production Forecast

Display:

### Cocoon Forecast

- Expected cocoon yield
- Average weight
- Shell ratio
- Quality
- Confidence

### Silk Forecast

- Expected silk production
- Silk recovery
- Confidence

---

## 10.11 Analytics

Display:

- Harvest history
- Leaf quality history
- Feeding quantity
- Feeding wastage
- Feeding efficiency
- Cocoon yield
- Silk production
- Prediction history

Use simple charts and graphs.

---

## 10.12 AI Copilot

Text chat interface.

Features:

- Ask questions
- Context-aware responses
- Farmer-specific recommendations
- Regional-language text support
- Conversation history

---

## 10.13 Notifications

Display:

- Harvest reminders
- Feeding reminders
- Prediction updates
- Important system messages

---

# 11. Technology Stack

## Mobile Application

- React Native
- Expo
- TypeScript
- Expo Router

Expo's current tooling supports creating React Native applications using `create-expo-app`, and Expo Router can provide file-based navigation. :contentReference[oaicite:0]{index=0}

---

## Backend

- Node.js
- Express.js
- REST APIs
- JWT authentication

---

## AI/ML Service

- Python
- FastAPI
- Scikit-learn
- XGBoost
- TensorFlow/Keras
- OpenCV
- Pandas
- NumPy

---

## Database

MongoDB Atlas

---

## Image Storage

Cloudinary

---

## Weather

Weather API provider.

Weather data should be accessed through the backend rather than directly exposing API keys in the mobile application.

---

## Notifications

Firebase Cloud Messaging.

---

## Public Website

- React
- Vite
- Tailwind CSS
- Vercel

---

## Version Control

Git
GitHub

---

# 12. System Architecture

```text
                    PUBLIC WEBSITE
                  React + Vite + Tailwind
                           |
                           |
                     APK Download
                           |
                           v
                ANDROID MOBILE APP
                React Native + Expo
                           |
                           |
                       REST APIs
                           |
                           v
                 NODE.JS + EXPRESS
                      BACKEND
                           |
             +-------------+-------------+
             |                           |
             v                           v
       MongoDB Atlas                Cloudinary
       Application Data             Leaf Images
             |
             |
             v
       PYTHON FASTAPI
          AI SERVICE
             |
     +-------+-------+-------+-------+-------+
     |       |       |       |       |       |
     v       v       v       v       v       v
  Harvest  Leaf   Feeding Cocoon  Silk   Copilot
  Model    CV     Optimizer Model Model  / RAG