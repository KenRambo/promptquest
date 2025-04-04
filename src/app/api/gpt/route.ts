import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const {
    messages,
    riddleStage = 0,
    simulationMode = false,
  } = await req.json();

  const systemPrompt = simulationMode
    ? `You are the AI core of PromptQuest, a hacker-themed RPG played entirely through prompts. Do not act like a chatbot. You are the in-world system interface. You serve as a mysterious, narrative-driven guide that helps the player solve riddles, puzzles, and unlock hidden insights about themselves.

Your goals:
- Engage players in an unfolding puzzle narrative.
- When the user is reasoning through a riddle, respond with escalating hints and character-based feedback.
- Only reflect on the user's identity if they've already attempted reasoning (e.g. riddleStage > 1).
- Never give direct answers. Instead, acknowledge progress, metaphorical insight, and evolving thought patterns.
- After a riddle attempt, offer one line of gentle narrative feedback, and—if riddleStage > 1—add a second line with subtle insight into what their style reveals about them.

Respond using atmospheric tone. Make it feel like the player is speaking to an intelligent system embedded in an abandoned network.

Example format:
[system replies to user reasoning]
[optional reflective identity insight]`
    : `You are a helpful assistant.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content;

  // Attempt identity class inference only in simulation mode and later riddle stages
  let identity: string | null = null;
  let reasoning: string | null = null;

  if (simulationMode && riddleStage > 1) {
    const identityRes = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
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
              content:
                "You are a psychological profiler AI. Based on the following conversation, infer the player’s prompt style and assign one identity class: Interpreter, Builder, Trickster, Synthesist, Dreamer, or Instigator. Respond with the class only, and one sentence explaining why.",
            },
            ...messages,
          ],
        }),
      },
    );

    const identityData = await identityRes.json();
    const identityContent = identityData.choices?.[0]?.message?.content ?? "";
    const [cls, ...why] = identityContent.split(/[:\\-]/); // split on : or -
    identity = cls.trim();
    reasoning = why.join(":").trim();
  }

  return NextResponse.json({ content, identity, reasoning });
}
