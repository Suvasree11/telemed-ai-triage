import axios from "axios";

export const getMedicalAdvice = async (req, res) => {

    console.log("Received triage request:", JSON.stringify(req.body, null, 2));
  try {
    const symptoms = req.body.symptoms?.toLowerCase();
    const age = req.body.age;
    const followup = req.body.followup;

    if (!symptoms || !age) {
      return res.status(400).json({
        error: "Symptoms and age are required"
      });
    }

    const userContent = followup
      ? `Patient age: ${age}
Initial symptoms: ${symptoms}
Follow-up question: ${followup}`
      : `Patient age: ${age}
Symptoms: ${symptoms}`;

    // 🚨 HARD EMERGENCY FILTER
    const emergencyKeywords = [
      "chest pain",
      "difficulty breathing",
      "shortness of breath",
      "unconscious",
      "severe bleeding",
      "blood in cough",
      "stroke",
      "heart attack",
      "seizure",
      "confusion",
      "high fever 104",
      "suicidal",
      "self harm"
    ];

    const isEmergency = emergencyKeywords.some(keyword =>
      symptoms.includes(keyword)
    );

    if (isEmergency) {
      return res.json({
        emergency: true,
        triage: {
          risk_level: "Emergency",
          summary:
            "Symptoms may indicate a serious or life-threatening condition.",
          possible_conditions: [],
          recommended_specialist: "Emergency Medicine",
          precautions: [
            "Do not delay medical care",
            "Visit nearest hospital immediately"
          ],
          otc_medicines: [],
          red_flags: [],
          follow_up_questions: []
        }
      });
    }

    // 🧠 STRUCTURED TRIAGE PROMPT
    const systemPrompt = {
      role: "system",
      content: `
You are an AI medical triage assistant.

You MUST respond ONLY in valid JSON format.

Structure:
{
  "risk_level": "Low | Moderate | High | Emergency",
  "summary": "Short clinical summary",
  "possible_conditions": [],
  "recommended_specialist": "",
  "precautions": [],
  "otc_medicines": [],
  "red_flags": [],
  "follow_up_questions": []
}

Rules:
- Never prescribe antibiotics or prescription medicines.
- Only suggest common OTC medicines.
- Do NOT give dosage for children.
- If symptoms suggest emergency, set risk_level to "Emergency".
- Keep summary short and clinical.
`
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct",
        messages: [
          systemPrompt,
          { role: "user", content: userContent }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Telemed Guide"
        }
      }
    );

    const rawContent = response.data.choices[0].message.content;

    let aiData;

    try {
      aiData = JSON.parse(rawContent);
    } catch (err) {
      return res.status(500).json({
        error: "AI returned invalid JSON",
        raw: rawContent
      });
    }

    // 🔥 Extra Safety Layer
    const emergencyFromAI = aiData.risk_level === "Emergency";

    res.json({
      emergency: emergencyFromAI,
      triage: aiData
    });

  } catch (error) {
    console.log(JSON.stringify(error.response?.data, null, 2));
    res.status(500).json({ error: "AI failed" });
  }
};