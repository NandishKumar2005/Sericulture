/**
 * Weather Service Module
 * ======================
 * Provides real-time weather & forecast parameters (Temperature, Humidity, Rainfall)
 * for Mulberry, Tasar, Muga, Eri, and Bivoltine Sericulture farm locations across India
 * (Karnataka, Andhra Pradesh, Tamil Nadu, West Bengal, Assam, Jharkhand, Jammu & Kashmir)
 * using Open-Meteo live API, OpenWeatherMap API, or regional sericulture defaults.
 */

const axios = require('axios');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || null;

// Regional climate profiles for major sericulture hub states & districts across India
const REGIONAL_WEATHER_DEFAULTS = {
  // ── KARNATAKA (Mulberry Silk Hub) ──────────────────────────
  kolar: { temperature: 27.5, humidity: 72, rainfall: 10, condition: 'Partly Cloudy', lat: 13.1367, lon: 78.1292, region: 'Karnataka', type: 'Mulberry' },
  chikkaballapur: { temperature: 26.8, humidity: 74, rainfall: 12, condition: 'Clear', lat: 13.4355, lon: 77.7315, region: 'Karnataka', type: 'Mulberry' },
  ramanagara: { temperature: 28.2, humidity: 70, rainfall: 8, condition: 'Sunny', lat: 12.7150, lon: 77.2810, region: 'Karnataka', type: 'Mulberry (Cocoon Market)' },
  mysore: { temperature: 26.0, humidity: 78, rainfall: 15, condition: 'Light Rain', lat: 12.2958, lon: 76.6394, region: 'Karnataka', type: 'Mulberry' },
  mandya: { temperature: 27.0, humidity: 75, rainfall: 12, condition: 'Cloudy', lat: 12.5218, lon: 76.8951, region: 'Karnataka', type: 'Mulberry' },
  tumkur: { temperature: 28.0, humidity: 68, rainfall: 5, condition: 'Clear', lat: 13.3409, lon: 77.1006, region: 'Karnataka', type: 'Mulberry' },
  bengaluru: { temperature: 26.5, humidity: 71, rainfall: 5, condition: 'Partly Cloudy', lat: 12.9716, lon: 77.5946, region: 'Karnataka', type: 'Mulberry' },
  bangalore: { temperature: 26.5, humidity: 71, rainfall: 5, condition: 'Partly Cloudy', lat: 12.9716, lon: 77.5946, region: 'Karnataka', type: 'Mulberry' },

  // ── ANDHRA PRADESH (Mulberry Silk Hub) ──────────────────────
  anantapur: { temperature: 29.5, humidity: 65, rainfall: 2, condition: 'Sunny / Warm', lat: 14.6819, lon: 77.6006, region: 'Andhra Pradesh', type: 'Mulberry' },
  hindupur: { temperature: 28.8, humidity: 67, rainfall: 4, condition: 'Clear', lat: 13.8299, lon: 77.4932, region: 'Andhra Pradesh', type: 'Mulberry (Cocoon Market)' },
  chittoor: { temperature: 28.5, humidity: 71, rainfall: 6, condition: 'Partly Cloudy', lat: 13.2172, lon: 79.1003, region: 'Andhra Pradesh', type: 'Mulberry' },
  kadapa: { temperature: 30.2, humidity: 62, rainfall: 0, condition: 'Hot / Dry', lat: 14.4673, lon: 78.8242, region: 'Andhra Pradesh', type: 'Mulberry' },
  vijayawada: { temperature: 31.0, humidity: 76, rainfall: 8, condition: 'Humid', lat: 16.5062, lon: 80.6480, region: 'Andhra Pradesh', type: 'Mulberry' },

  // ── TAMIL NADU (Mulberry & Reeling Hub) ─────────────────────
  dharmapuri: { temperature: 28.4, humidity: 73, rainfall: 8, condition: 'Partly Cloudy', lat: 12.1211, lon: 78.1582, region: 'Tamil Nadu', type: 'Mulberry' },
  salem: { temperature: 29.1, humidity: 69, rainfall: 5, condition: 'Sunny', lat: 11.6643, lon: 78.1460, region: 'Tamil Nadu', type: 'Mulberry (Silk Weaving)' },
  krishnagiri: { temperature: 27.6, humidity: 74, rainfall: 10, condition: 'Clear', lat: 12.5186, lon: 78.2137, region: 'Tamil Nadu', type: 'Mulberry' },
  erode: { temperature: 29.8, humidity: 68, rainfall: 4, condition: 'Warm', lat: 11.3410, lon: 77.7172, region: 'Tamil Nadu', type: 'Mulberry' },
  coimbatore: { temperature: 26.5, humidity: 76, rainfall: 12, condition: 'Pleasant', lat: 11.0168, lon: 76.9558, region: 'Tamil Nadu', type: 'Mulberry' },
  hosur: { temperature: 25.8, humidity: 73, rainfall: 9, condition: 'Partly Cloudy', lat: 12.7409, lon: 77.8253, region: 'Tamil Nadu', type: 'Mulberry' },

  // ── WEST BENGAL (Mulberry & Nistari Hub) ────────────────────
  malda: { temperature: 28.0, humidity: 82, rainfall: 18, condition: 'Humid / Light Rain', lat: 25.0108, lon: 88.1411, region: 'West Bengal', type: 'Mulberry (Nistari)' },
  murshidabad: { temperature: 27.8, humidity: 80, rainfall: 15, condition: 'Cloudy', lat: 24.1750, lon: 88.2800, region: 'West Bengal', type: 'Mulberry Silk Weaving' },
  birbhum: { temperature: 28.5, humidity: 78, rainfall: 12, condition: 'Partly Cloudy', lat: 23.8400, lon: 87.5300, region: 'West Bengal', type: 'Mulberry' },
  bankura: { temperature: 29.0, humidity: 76, rainfall: 10, condition: 'Clear', lat: 23.2313, lon: 87.0784, region: 'West Bengal', type: 'Mulberry & Tasar' },
  kolkata: { temperature: 29.5, humidity: 83, rainfall: 20, condition: 'Humid / Rain', lat: 22.5726, lon: 88.3639, region: 'West Bengal', type: 'Mulberry Trade' },

  // ── ASSAM (Muga Golden Silk & Eri Silk Capital) ──────────────
  jorhat: { temperature: 24.5, humidity: 86, rainfall: 25, condition: 'Moist / Drizzle', lat: 26.7509, lon: 94.2037, region: 'Assam', type: 'Muga & Eri Silk (CMERTI)' },
  kamrup: { temperature: 25.2, humidity: 84, rainfall: 22, condition: 'Cloudy', lat: 26.3161, lon: 91.5984, region: 'Assam', type: 'Sualkuchi Muga Weaving' },
  lakhimpur: { temperature: 23.8, humidity: 88, rainfall: 30, condition: 'Rain Showers', lat: 27.2300, lon: 94.1000, region: 'Assam', type: 'Muga Host Plants (Som/Soalu)' },
  sivasagar: { temperature: 24.2, humidity: 85, rainfall: 24, condition: 'Overcast', lat: 26.9826, lon: 94.6425, region: 'Assam', type: 'Muga Silkworm Rearing' },
  guwahati: { temperature: 25.5, humidity: 82, rainfall: 18, condition: 'Partly Cloudy', lat: 26.1445, lon: 91.7362, region: 'Assam', type: 'Muga & Eri Trade' },

  // ── JHARKHAND (Tasar Wild Silk Capital of India) ─────────────
  ranchi: { temperature: 25.0, humidity: 74, rainfall: 14, condition: 'Pleasant', lat: 23.3441, lon: 85.3096, region: 'Jharkhand', type: 'Tasar Silk (CTRI Hub)' },
  dumka: { temperature: 27.2, humidity: 77, rainfall: 16, condition: 'Partly Cloudy', lat: 24.2686, lon: 87.2490, region: 'Jharkhand', type: 'Tropical Tasar' },
  singhbhum: { temperature: 28.0, humidity: 75, rainfall: 12, condition: 'Clear', lat: 22.5500, lon: 85.8000, region: 'Jharkhand', type: 'Asan & Arjun Forest Tasar' },
  chaibasa: { temperature: 28.1, humidity: 74, rainfall: 10, condition: 'Sunny', lat: 22.5500, lon: 85.8000, region: 'Jharkhand', type: 'Tasar Rearing' },
  giridih: { temperature: 27.5, humidity: 73, rainfall: 11, condition: 'Clear', lat: 24.1900, lon: 86.3000, region: 'Jharkhand', type: 'Tasar Silk' },

  // ── JAMMU & KASHMIR (Temperate Bivoltine Mulberry Silk Hub) ─
  anantnag: { temperature: 18.5, humidity: 68, rainfall: 8, condition: 'Cool / Breezy', lat: 33.7311, lon: 75.1487, region: 'Jammu & Kashmir', type: 'Temperate Bivoltine Mulberry' },
  baramulla: { temperature: 17.8, humidity: 70, rainfall: 10, condition: 'Cool / Clear', lat: 34.2000, lon: 74.3500, region: 'Jammu & Kashmir', type: 'Bivoltine Mulberry' },
  srinagar: { temperature: 19.0, humidity: 65, rainfall: 6, condition: 'Mild / Clear', lat: 34.0837, lon: 74.7973, region: 'Jammu & Kashmir', type: 'Kashmir Silk Hub' },
  jammu: { temperature: 27.2, humidity: 64, rainfall: 5, condition: 'Sunny', lat: 32.7266, lon: 74.8570, region: 'Jammu & Kashmir', type: 'Sub-tropical Mulberry' },
  pulwama: { temperature: 18.2, humidity: 69, rainfall: 7, condition: 'Cool / Partly Cloudy', lat: 33.8718, lon: 74.8970, region: 'Jammu & Kashmir', type: 'Bivoltine Silkworm Rearing' },

  default: { temperature: 27.0, humidity: 72, rainfall: 10, condition: 'Partly Cloudy', lat: 13.1367, lon: 78.1292, region: 'India Sericulture Hub', type: 'Mulberry' },
};

function getWeatherConditionFromCode(code) {
  if (code === 0) return 'Clear Sky';
  if (code >= 1 && code <= 3) return 'Partly Cloudy';
  if (code === 45 || code === 48) return 'Foggy';
  if (code >= 51 && code <= 67) return 'Drizzle / Light Rain';
  if (code >= 71 && code <= 77) return 'Snow / Cold Air';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Partly Cloudy';
}

function generateSericultureAdvice(temp, humidity, locationName = '') {
  let advice = [];
  const locLower = locationName.toLowerCase();

  // Region specific climate guidance
  if (locLower.includes('assam') || locLower.includes('jorhat') || locLower.includes('lakhimpur') || locLower.includes('kamrup')) {
    advice.push('🌾 Assam Muga/Eri Advice: High humidity detected. Ensure proper airflow around Som/Soalu host trees to protect outdoor Muga larvae.');
  } else if (locLower.includes('jharkhand') || locLower.includes('ranchi') || locLower.includes('dumka') || locLower.includes('singhbhum')) {
    advice.push('🌳 Jharkhand Tasar Advice: Monitor outdoor Asan/Arjun plantations against predators and extreme temperature spikes.');
  } else if (locLower.includes('kashmir') || locLower.includes('srinagar') || locLower.includes('anantnag') || locLower.includes('baramulla')) {
    advice.push('🏔️ J&K Bivoltine Advice: Protect bivoltine silkworms from sudden temperature drops (<18°C) using controlled rearing heaters.');
  }

  // Standard temperature check
  if (temp > 29) {
    advice.push('High Temp Alert (>29°C): Sprinkle water on rearing house roof/floor and maintain air circulation.');
  } else if (temp < 22) {
    advice.push('Low Temp Alert (<22°C): Use artificial heating (charcoal stoves/heaters) to protect silkworm moulting.');
  } else {
    advice.push('Temperature is within optimal sericulture rearing range (24°C - 28°C).');
  }

  // Standard humidity check
  if (humidity < 65) {
    advice.push('Low Humidity Alert (<65%): Hang wet gunny bags inside rearing house to prevent leaf drying.');
  } else if (humidity > 85) {
    advice.push('High Humidity Alert (>85%): Dust lime powder on rearing beds to prevent grasserie/flacherie disease.');
  } else {
    advice.push('Relative humidity is optimal (70% - 85%) for cocoon spinning & larva growth.');
  }

  return advice.join(' ');
}

/**
 * Get current weather metrics for a farm location string across any Indian Sericulture region.
 * @param {string} location - City, district or region (e.g., "Kolar, Karnataka", "Malda, West Bengal", "Jorhat, Assam", "Anantnag, J&K")
 * @returns {Promise<{location: string, temperature_celsius: number, humidity_pct: number, rainfall_mm: number, condition: string, wind_speed_kmh: number, source: string, sericulture_advice: string}>}
 */
async function getWeatherForLocation(location = 'Kolar') {
  const cleanLoc = (location || 'Kolar').trim();
  const locLower = cleanLoc.toLowerCase();

  // 1. Open-Meteo Free Live Weather API (No API key required - works globally including all Indian cities)
  try {
    let lat = null;
    let lon = null;
    let displayCity = cleanLoc;

    // Search Geocoding API for city coordinates in India
    const geoRes = await axios.get(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanLoc)}&count=1&language=en&format=json`,
      { timeout: 4000 }
    );

    if (geoRes.data && geoRes.data.results && geoRes.data.results.length > 0) {
      const match = geoRes.data.results[0];
      lat = match.latitude;
      lon = match.longitude;
      displayCity = `${match.name}, ${match.admin1 || match.country || ''}`.trim();
    } else {
      // Fallback matching lat/lon from Indian regional defaults dictionary
      for (const key of Object.keys(REGIONAL_WEATHER_DEFAULTS)) {
        if (locLower.includes(key)) {
          lat = REGIONAL_WEATHER_DEFAULTS[key].lat;
          lon = REGIONAL_WEATHER_DEFAULTS[key].lon;
          break;
        }
      }
    }

    if (lat !== null && lon !== null) {
      const weatherRes = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&timezone=auto`,
        { timeout: 4000 }
      );

      const current = weatherRes.data?.current;
      if (current) {
        const temp = Math.round(current.temperature_2m);
        const hum = Math.round(current.relative_humidity_2m);
        const rain = Math.round(current.precipitation || 0);
        const wind = Math.round(current.wind_speed_10m || 0);
        const condition = getWeatherConditionFromCode(current.weather_code);

        return {
          location: displayCity,
          temperature_celsius: temp,
          humidity_pct: hum,
          rainfall_mm: rain,
          wind_speed_kmh: wind,
          condition: condition,
          source: 'Open-Meteo Live API',
          sericulture_advice: generateSericultureAdvice(temp, hum, cleanLoc)
        };
      }
    }
  } catch (openMeteoErr) {
    console.warn(`[WeatherService] Open-Meteo API failed for ${cleanLoc}:`, openMeteoErr.message);
  }

  // 2. OpenWeatherMap API fallback if key provided
  if (OPENWEATHER_API_KEY) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cleanLoc)},IN&units=metric&appid=${OPENWEATHER_API_KEY}`,
        { timeout: 4000 }
      );
      const data = response.data;
      const temp = Math.round(data.main?.temp ?? 27.0);
      const hum = Math.round(data.main?.humidity ?? 72);
      return {
        location: data.name ? `${data.name}, ${data.sys?.country || 'India'}` : cleanLoc,
        temperature_celsius: temp,
        humidity_pct: hum,
        rainfall_mm: Math.round(data.rain?.['1h'] || data.rain?.['3h'] || 0),
        wind_speed_kmh: Math.round((data.wind?.speed || 0) * 3.6),
        condition: data.weather?.[0]?.main || 'Clear',
        source: 'OpenWeatherMap API',
        sericulture_advice: generateSericultureAdvice(temp, hum, cleanLoc)
      };
    } catch (err) {
      console.warn(`[WeatherService] OpenWeatherMap request failed for ${cleanLoc}:`, err.message);
    }
  }

  // 3. Fallback to regional sericulture climate profiles
  let matchedKey = 'default';
  for (const key of Object.keys(REGIONAL_WEATHER_DEFAULTS)) {
    if (locLower.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  const profile = REGIONAL_WEATHER_DEFAULTS[matchedKey];
  return {
    location: cleanLoc,
    temperature_celsius: profile.temperature,
    humidity_pct: profile.humidity,
    rainfall_mm: profile.rainfall,
    wind_speed_kmh: 12,
    condition: profile.condition,
    source: `Regional Sericulture Profile (${profile.region || matchedKey})`,
    sericulture_advice: generateSericultureAdvice(profile.temperature, profile.humidity, cleanLoc)
  };
}

module.exports = {
  getWeatherForLocation,
  REGIONAL_WEATHER_DEFAULTS
};
