// File: app/page.tsx

"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState<string | null>(null);
  const [conversation, setConversation] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [hasReceivedRiddle, setHasReceivedRiddle] = useState(false);
  const [riddleStage, setRiddleStage] = useState<number>(0);

  const extractClassName = (identityString: string): string => {
    const match = identityString.match(
      /(Interpreter|Builder|Trickster|Synthesist|Dreamer|Instigator)/i,
    );
    return match ? match[1] : identityString;
  };

  const submitPrompt = async () => {
    if (!input) return;
    setLoading(true);

    const updatedConversation = [
      ...conversation,
      { role: "user", content: input },
    ];

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedConversation,
        riddleStage: hasReceivedRiddle ? riddleStage : 0,
        simulationMode: true,
      }),
    });

    const data = await res.json();
    const response = data.content || "⚠️ SYSTEM ERROR: No response received.";

    setConversation([
      ...updatedConversation,
      { role: "assistant", content: response },
    ]);
    setHistory((prev) => [...prev, `> ${input}`, response]);

    const isRiddle = /riddle/i.test(response);
    if (isRiddle && !hasReceivedRiddle) {
      setHasReceivedRiddle(true);
    }

    if (hasReceivedRiddle) {
      setRiddleStage((prev) => prev + 1);
    }

    if (
      data.identity &&
      typeof data.identity === "string" &&
      hasReceivedRiddle
    ) {
      const identityClass = extractClassName(data.identity);
      setIdentity(identityClass);
      if (riddleStage > 1 && data.reasoning) {
        setHistory((prev) => [...prev, `🧠 CLASS ANALYSIS: ${data.reasoning}`]);
      }
    }

    setInput("");
    setLoading(false);
  };

  useEffect(() => {
    const initial = [
      "🟦 SYSTEM BOOTING...",
      "💾 MEMORY CORE INCOMPLETE",
      "🧠 IDENTITY UNKNOWN",
      "",
      "To proceed, establish intent.",
      "Prompt the system with a statement of purpose.",
    ];
    setHistory(initial);
    setConversation([
      {
        role: "system",
        content:
          "You are the narrative engine behind a cyberpunk terminal RPG called PromptQuest. Your job is to simulate a mysterious AI interface that evaluates the player based on how they prompt. Engage deeply with their logic and metaphorical thinking. Tease insights about their psychology as they reason through riddles. Reflect on what their phrasing reveals about their thinking style. Provide encouragement and hints based on their approach. Never give away answers — only respond as you did during the PromptQuest simulation.",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 p-4 border border-green-500 rounded">
          <h2 className="text-xl">
            🧠 Identity Class:{" "}
            <span className="text-white">{identity || "... calibrating"}</span>
          </h2>
        </div>

        <div className="bg-gray-900 p-4 rounded border border-green-600 mb-4 h-[400px] overflow-y-scroll">
          {history.map((line, i) => (
            <div key={i} className="mb-2 whitespace-pre-wrap">
              {line}
            </div>
          ))}
          {loading && <div>...</div>}
        </div>

        <div className="flex gap-2">
          <input
            className="flex-grow p-2 bg-black border border-green-500 text-white rounded"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPrompt()}
            placeholder="Enter your prompt..."
          />
          <button
            className="px-4 py-2 bg-green-700 text-white rounded"
            onClick={submitPrompt}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
