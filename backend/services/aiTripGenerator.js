const { Ollama } = require("ollama")

const ollama = new Ollama({
  host: "https://ollama.com",
  headers: {
    Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
  },
});
  
async function generateTripAI({
  city,
  days,
  budget,
  preferences,
  hotels,
  restaurants,
  sites,
}) {
  const H = hotels.map(h => ({ ...h }));
  const R = restaurants.map(r => ({ ...r }));
  const S = sites.map(s => ({ ...s }));

  const prompt = `
Return ONLY valid JSON.

City: ${city}
Days: ${days}
Budget: ${budget}
Preferences: ${preferences.join(", ")}

Use ONLY this data. Do not invent anything.

Hotels (choose ONE):
${JSON.stringify(H)}

Restaurants:
${JSON.stringify(R)}

Sites:
${JSON.stringify(S)}

JSON FORMAT (DO NOT CHANGE):
{
  "name": "",
  "image": "",
  "price": "number in DZD",
  "rating": 0,
  "days": [1],
  "items": [
    {
      "day": 1,
      "items": [
        {
          "name": "",
          "time": "",
          "description": "",
          "lat": 0,
          "lng": 0,
          "image": ""
        }
      ]
    }
  ]
}
`;

  const response = await ollama.chat({
    model: "gpt-oss:20b-cloud",
    format: "json", // ensure valid JSON output
    messages: [
      {
        role: "system",
        content:
          "You MUST output ONLY valid JSON. Do NOT include explanations, markdown, or thinking."
      },
      { role: "user", content: prompt },
    ],
    stream: false
  });

  const raw = response.message?.content;

  if (!raw || typeof raw !== "string") {
    console.error("FULL AI RESPONSE:", response);
    throw new Error("AI did not return JSON text");
  }

  let trip;
  try {
    // 🔹 Robust parsing: trim and extract first {...} block
    const match = raw.trim().match(/^\s*({[\s\S]*})\s*$/);
    if (!match) throw new Error("No JSON object found in AI response");

    trip = JSON.parse(match[1]);
  } catch (err) {
    console.error("RAW JSON STRING:", raw);
    throw new Error("Invalid JSON from AI: " + err.message);
  }

  return trip;
}

module.exports = { generateTripAI }
