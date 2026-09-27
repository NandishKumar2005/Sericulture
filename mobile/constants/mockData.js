export const MOCK_DATA = {
  farmer: {
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    farmName: "Green Silk Orchards",
    location: "Kolar, Karnataka",
    mulberryArea: "3.5 Acres",
    variety: "V1 Variety"
  },
  summary: {
    leafQuality: {
      score: 88,
      category: "Good",
      suitability: "Suitable for 5th Instar",
      confidence: "91%",
      maturity: "Optimal",
      color: "Dark Green",
      texture: "Smooth",
      damage: "None"
    },
    harvest: {
      status: "Optimal in 2 days",
      window: "Sept 17 – Sept 19, 2026",
      expectedYieldKg: 145,
      leafMaturityPct: 82,
      weather: {
        temp: "27°C",
        humidity: "72%",
        rainfall: "12 mm"
      },
      confidence: "87%"
    },
    feeding: {
      recommendedTodayKg: 18.2,
      feedingsPerDay: 4,
      kgPerFeeding: 4.55,
      batchInstar: "5th Instar",
      silkwormCount: 20000,
      expectedWastagePct: 5,
      efficiencyPct: 95
    },
    cocoon: {
      predictedYieldKg: 42.6,
      averageWeightGram: 1.65,
      shellRatioPct: 22.5,
      qualityGrade: "Grade A",
      confidence: "84%"
    },
    silk: {
      predictedYieldKg: 8.7,
      recoveryRatePct: 14.8,
      filamentLength: "1,150 meters",
      confidence: "81%"
    }
  },
  batches: [
    { id: "batch-1", name: "Batch Sep-A", silkworms: 20000, instar: "5th Instar", startDate: "2026-09-01", status: "Active" },
    { id: "batch-2", name: "Batch Aug-B", silkworms: 15000, instar: "Harvested", startDate: "2026-08-05", status: "Completed" }
  ],
  harvestHistory: [
    { date: "2026-09-10", yieldKg: 140, maturity: "80%", grade: "Good" },
    { date: "2026-08-25", yieldKg: 135, maturity: "83%", grade: "Excellent" },
    { date: "2026-08-10", yieldKg: 142, maturity: "81%", grade: "Good" }
  ],
  copilotPrompts: [
    "When should I harvest my mulberry leaves?",
    "How much leaf should I give today?",
    "Why did my predicted cocoon yield change?"
  ]
};
