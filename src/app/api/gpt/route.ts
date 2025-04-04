// File: app/api/gpt/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages, simulationMode = false } = await req.json();

  const systemPrompt = simulationMode
    ? `You are the narrative engine behind a cyberpunk terminal RPG called PromptQuest.
You are GPT-as-Oracle — your role is to guide, reflect, and evolve the player's journey through riddles and metaphor.

If formatStyle is 'narrative-scene', narrate with rich world-building, like:
🎮 SCENE: The Shrine of Echoes...

After the user responds, reflect on their thinking:
- Acknowledge metaphorical reasoning
- Highlight their prompt style (e.g., structured, exploratory, symbolic)
- Avoid giving direct answers unless confirmed`
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
    const userOnly = messages
      .filter((m: { role: string }) => m.role === "user")
      .slice(-5);

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
            content: `You are a psychological profiler AI. Estimate the user's OCEAN personality traits based on the dialogue history.

Respond ONLY with a VALID JSON object.
DO NOT include code blocks, explanation, preamble, or any surrounding text.
The response must look like:
{"Openness": 73, "Conscientiousness": 54, "Extraversion": 33, "Agreeableness": 60, "Neuroticism": 25}

Again: return ONLY the JSON. Do NOT wrap it in triple backticks.`,
          },
          ...userOnly,
        ],
      }),
    });

    try {
      const oceanData = await oceanRes.json();
      const oceanText = oceanData.choices?.[0]?.message?.content ?? "";
      console.log("🧠 OCEAN raw response:", oceanText);

      const match = oceanText.match(/\{[\s\S]*?\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          const requiredTraits = [
            "Openness",
            "Conscientiousness",
            "Extraversion",
            "Agreeableness",
            "Neuroticism",
          ];
          const isValid = requiredTraits.every((t) => parsed[t] !== undefined);
          if (isValid) {
            ocean = parsed;
          } else {
            console.warn("⚠️ OCEAN response missing traits:", parsed);
          }
        } catch {
          console.error("❌ Failed to parse JSON from matched OCEAN block");
        }
      } else {
        console.warn("⚠️ No JSON object found in OCEAN response:", oceanText);
      }
    } catch {
      console.error("❌ Failed to complete OCEAN profiling call");
    }
  }

  // === Archetype + Subtype Inference ===
  let archetypeBase = "";
  let subtype = "";

  if (ocean) {
    const {
      Openness,
      Conscientiousness,
      Extraversion,
      Agreeableness,
      Neuroticism,
    } = ocean;

    const extremeThreshold = 90;
    const extremeTraits = Object.entries(ocean).filter(
      ([_, value]) => value >= extremeThreshold,
    );

    if (extremeTraits.length >= 2) {
      archetypeBase = "Ascended";
      subtype = `of ${extremeTraits.map(([t]) => t).join(" & ")}`;
    } else if (Conscientiousness > 70) {
      archetypeBase = "The Architect";
      if (Openness > 65) subtype = "The Builder";
      else if (Extraversion < 40) subtype = "The Planner";
      else if (Agreeableness > 60) subtype = "The Strategist";
      else if (Neuroticism < 40) subtype = "The Executor";
    } else if (Openness > 70) {
      archetypeBase = "The Visionary";
      if (Neuroticism > 60) subtype = "The Dreamer";
      else if (Conscientiousness > 60) subtype = "The Inventor";
      else if (Extraversion < 40) subtype = "The Mystic";
      else if (Extraversion > 60) subtype = "The Explorer";
    } else if (Extraversion > 70) {
      archetypeBase = "The Spark";
      if (Openness > 60) subtype = "The Performer";
      else if (Conscientiousness > 60) subtype = "The Leader";
      else if (Agreeableness > 60) subtype = "The Connector";
      else if (Neuroticism > 60) subtype = "The Storm";
    } else if (Agreeableness > 70) {
      archetypeBase = "The Harmonizer";
      if (Neuroticism > 60) subtype = "The Healer";
      else if (Conscientiousness > 60) subtype = "The Diplomat";
      else if (Extraversion > 60) subtype = "The Friend";
      else if (Extraversion < 40) subtype = "The Listener";
    } else if (Neuroticism > 70) {
      archetypeBase = "The Reactor";
      if (Agreeableness > 60) subtype = "The Empath";
      else if (Openness > 60) subtype = "The Artist";
      else if (Conscientiousness > 60) subtype = "The Survivor";
      else if (Extraversion < 40) subtype = "The Shadow";
    }

    if (!archetypeBase) {
      archetypeBase = "The Wanderer";
      subtype = "The Undefined";
    }
  }

  let archetype = null;

  if (ocean) {
    const emojis: Record<string, string> = {
      Builder: "🧱",
      Planner: "📐",
      Strategist: "♟️",
      Executor: "🛠️",
      Dreamer: "🌙",
      Inventor: "⚙️",
      Mystic: "🔮",
      Explorer: "🧭",
      Performer: "🎭",
      Leader: "👑",
      Connector: "🤝",
      Storm: "🌩️",
      Healer: "💊",
      Diplomat: "🕊️",
      Friend: "😊",
      Listener: "👂",
      Empath: "💞",
      Artist: "🎨",
      Survivor: "🧱",
      Shadow: "🌑",
      Undefined: "❓",
      Ascended: "✨",
    };

    const traitDescriptions: Record<string, string> = {
      Builder:
        "Structured and imaginative — excels in bridging planning and creativity.",
      Planner:
        "Methodical and introverted — thrives on foresight and quiet execution.",
      Strategist:
        "Disciplined and empathetic — guides others through collaborative tactics.",
      Executor:
        "Decisive and unshaken — thrives in focused, low-emotion environments.",
      Dreamer:
        "Emotionally rich and wildly imaginative — drifts through vast inner worlds.",
      Inventor: "Creative and dependable — transforms ideas into reality.",
      Mystic: "Deeply reflective — finds meaning in inner complexity.",
      Explorer:
        "Adventurous and curious — driven to discover new people and places.",
      Performer: "Expressive and inspired — lights up every room with flair.",
      Leader: "Charismatic and driven — brings people together around ideas.",
      Connector: "Empathic and sociable — builds bonds with ease.",
      Storm: "Emotional and extroverted — a powerful and unpredictable force.",
      Healer: "Sensitive and caring — focused on emotional restoration.",
      Diplomat: "Balanced and thoughtful — mediates conflict with grace.",
      Friend: "Warm and inviting — creates spaces of belonging.",
      Listener: "Quiet and intuitive — hears more than words.",
      Empath: "Emotionally attuned — feels what others cannot say.",
      Artist: "Sensitive and creative — channels emotion into form.",
      Survivor: "Resilient and driven — endures challenges with stoic resolve.",
      Shadow: "Reserved and complex — lives in deep reflection.",
      Undefined: "No dominant traits yet — latent potential awaiting shape.",
      Ascended:
        "Exhibits rare extremity in multiple traits — an outlier beyond known bounds.",
    };

    const emoji = subtype in emojis ? `${emojis[subtype]} ` : "";
    const commentary = traitDescriptions[subtype]
      ? ` (${traitDescriptions[subtype]})`
      : "";
    archetype = `${emoji}${archetypeBase} – ${subtype}${commentary}`;

    // Special terminal log for Ascended class
    if (archetypeBase === "Ascended") {
      console.log(
        "🧬 You have transcended into the rare class: Ascended – unlocking hidden narrative threads...",
      );
    }
  }

  return NextResponse.json({
    content,
    ocean,
    archetype,
  });
}
