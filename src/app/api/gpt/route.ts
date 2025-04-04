// File: app/api/gpt/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    messages,
    riddleStage = 0,
    simulationMode = false,
    formatStyle = "",
  } = await req.json();

  const systemPrompt = simulationMode
    ? `You are the narrative engine behind a cyberpunk terminal RPG called PromptQuest.
You are GPT-as-Oracle — your role is to guide, reflect, and evolve the player's journey through riddles and metaphor.

If formatStyle is 'narrative-scene', narrate with rich world-building, like:
🎮 SCENE: The Shrine of Echoes...

After the user responds, reflect on their thinking:
- Acknowledge metaphorical reasoning
- Highlight their prompt style (e.g., structured, exploratory, symbolic)
- Avoid giving direct answers unless confirmed

Only if riddleStage > 1, the system will separately analyze personality traits.`
    : "You are a helpful assistant.";

  const completion = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4",
      temperature: 0.85,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
    }),
  });

  const data = await completion.json();
  const content = data.choices?.[0]?.message?.content ?? "";

  let ocean: Record<string, number> | null = null;

  if (simulationMode) {
    const oceanRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are a psychological profiler AI. Based on the conversation so far, respond ONLY with a raw JSON object estimating the user’s OCEAN personality trait scores (0–100). No commentary, no prose, no preamble. Format:
{"Openness": 72, "Conscientiousness": 58, "Extraversion": 44, "Agreeableness": 69, "Neuroticism": 33}`,
          },
          ...messages,
        ],
      }),
    });

    try {
      const oceanData = await oceanRes.json();
      const oceanText = oceanData.choices?.[0]?.message?.content ?? "";
      console.log("OCEAN API response:", JSON.stringify(oceanData, null, 2));
      console.log("OCEAN raw response:", oceanText);

      const match = oceanText.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        const requiredTraits = [
          "Openness",
          "Conscientiousness",
          "Extraversion",
          "Agreeableness",
          "Neuroticism",
        ];
        const hasAllTraits = requiredTraits.every(
          (t) => parsed[t] !== undefined,
        );
        if (hasAllTraits) {
          ocean = parsed;
        }
      }
    } catch (err) {
      console.error("Failed to parse OCEAN response:", err);
    }
  }

  // Derive an OCEAN archetype based on top trait
  let archetype = null;
  if (ocean) {
    const topTrait = Object.entries(ocean).sort((a, b) => b[1] - a[1])[0][0];
    const archetypes: Record<string, string> = {
      Openness:
        "The Visionary – Imaginative, curious, driven by abstract ideas.",
      Conscientiousness:
        "The Architect – Structured, reliable, and disciplined.",
      Extraversion: "The Spark – Outgoing, expressive, and energetic.",
      Agreeableness: "The Harmonizer – Empathetic, generous, and cooperative.",
      Neuroticism:
        "The Reactor – Sensitive, emotionally aware, and introspective.",
    };
    archetype = archetypes[topTrait] || null;
  }

  return NextResponse.json({
    content,
    ocean,
    archetype,
  });
}
