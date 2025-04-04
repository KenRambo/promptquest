// File: app/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import PersonalitySigil from "@/components/PersonalitySigil";

type ConversationRole = "user" | "assistant" | "system";
type OceanTrait =
  | "Openness"
  | "Conscientiousness"
  | "Extraversion"
  | "Agreeableness"
  | "Neuroticism";

const BlinkingCursor = () => (
  <span className="animate-pulse text-green-400">█</span>
);

export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("promptquest-history") || "[]");
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [ocean, setOcean] = useState<Record<OceanTrait, number>>({
    Openness: 50,
    Conscientiousness: 50,
    Extraversion: 50,
    Agreeableness: 50,
    Neuroticism: 50,
  });
  const [archetype, setArchetype] = useState<string | null>(null);
  const [conversation, setConversation] = useState<
    { role: ConversationRole; content: string }[]
  >([]);

  const [riddleStage, setRiddleStage] = useState<number>(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("promptquest-stage") || "0");
    }
    return 0;
  });
  const [displayedLine, setDisplayedLine] = useState<string | null>(null);

  const endOfLogRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const typewriterEffect = async (text: string) => {
    return new Promise<void>((resolve) => {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedLine(text.slice(0, i + 1));
        i++;
        if (i === text.length) {
          clearInterval(interval);
          resolve();
        }
      }, 10);
    });
  };

  const animateOcean = (incoming: Record<OceanTrait, number>) => {
    const duration = 500;
    const steps = 20;
    const interval = duration / steps;
    let step = 0;
    const start = { ...ocean };
    const animate = setInterval(() => {
      setOcean((prev) => {
        const updated = { ...prev };
        (Object.keys(prev) as OceanTrait[]).forEach((trait) => {
          const diff = incoming[trait] - start[trait];
          updated[trait] = Math.max(
            0,
            Math.min(100, start[trait] + (diff * step) / steps),
          );
        });
        return updated;
      });
      step++;
      if (step > steps) clearInterval(animate);
    }, interval);
  };

  const submitPrompt = async () => {
    if (!input) return;
    setLoading(true);

    const updatedConversation = [
      ...conversation,
      { role: "user", content: input },
    ];

    setConversation(updatedConversation);
    setHistory((prev) => {
      const updated = [...prev, `> ${input}`];
      localStorage.setItem("promptquest-history", JSON.stringify(updated));
      return updated;
    });

    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: updatedConversation,
        riddleStage,
        simulationMode: true,
        formatStyle: "narrative-scene",
      }),
    });

    const data = await res.json();
    const response = data.content || "⚠️ SYSTEM ERROR: No response received.";

    setConversation((prev) => [
      ...prev,
      { role: "assistant", content: response },
    ]);
    await typewriterEffect(response);
    setDisplayedLine(null);

    setHistory((prev) => {
      const updated = [...prev, response];
      localStorage.setItem("promptquest-history", JSON.stringify(updated));
      return updated;
    });

    setRiddleStage((prev) => {
      const next = prev + 1;
      localStorage.setItem("promptquest-stage", next.toString());
      return next;
    });

    if (data.ocean) {
      const startOcean = { ...ocean }; // snapshot of current state before update

      // Immediately update state to the target so React re-renders the new values
      setOcean(data.ocean);
      animateOcean(data.ocean);

      const deltas: string[] = [];
      (Object.keys(data.ocean) as OceanTrait[]).forEach((trait) => {
        const change = data.ocean[trait] - startOcean[trait];
        if (Math.abs(change) >= 5) {
          const direction = change > 0 ? "↑" : "↓";
          deltas.push(`${trait} ${direction} ${Math.abs(Math.round(change))}%`);
        }
      });

      if (deltas.length > 0) {
        const summary = `🧭 Trait Shift: ${deltas.join(" | ")}`;
        setHistory((prev) => {
          const updated = [...prev, summary];
          localStorage.setItem("promptquest-history", JSON.stringify(updated));
          return updated;
        });
      }
    }

    if (data.archetype) setArchetype(data.archetype);

    setInput("");
    setLoading(false);
    scrollToBottom();
  };

  useEffect(() => {
    setConversation([
      {
        role: "system",
        content:
          "You are the narrative engine behind PromptQuest. Use immersive metaphor, riddles, and reflect OCEAN traits as the player prompts.",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 p-4 border border-green-500 rounded">
          <h2 className="text-xl mb-2">🧠 Personality Profile:</h2>
          <div className="space-y-1">
            {Object.entries(ocean).map(([trait, value]) => (
              <div key={trait} className="flex items-center gap-2 text-sm">
                <div className="w-40 text-white">{trait}</div>
                <div className="flex-1 h-2 bg-green-900 rounded">
                  <div
                    className="h-full bg-green-400 rounded transition-all duration-300"
                    style={{ width: `${value}%` }}
                  ></div>
                </div>
                <span className="w-10 text-right">{Math.round(value)}%</span>
              </div>
            ))}
          </div>
          <PersonalitySigil archetype={archetype} />
        </div>

        <div className="bg-gray-900 p-4 rounded border border-green-600 mb-4 h-[400px] overflow-y-scroll">
          {history.map((line, i) => (
            <div key={i} className="mb-2 whitespace-pre-wrap">
              {line}
            </div>
          ))}
          {displayedLine && (
            <div className="whitespace-pre-wrap mb-2">{displayedLine}</div>
          )}
          {loading && (
            <div className="mb-2 whitespace-pre-wrap">
              <BlinkingCursor />
            </div>
          )}
          <div ref={endOfLogRef} />
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
