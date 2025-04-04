// File: src/app/page.tsx

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import PersonalitySigil from "@/components/PersonalitySigil";

const logo = "/promptquest-logo.png";

function getEmojiForSubtype(label: string): string {
  const map: Record<string, string> = {
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
  return map[label] || "❓";
}

export default function Home() {
  const scrollToBottom = () => {
    endOfLogRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const [conversation, setConversation] = useState<
    { role: "user" | "assistant" | "system"; content: string }[]
  >([]);

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

    if (data.ocean) setOcean(data.ocean);

    if (data.archetype) {
      const [main, sub] = data.archetype.split(" – ");
      setArchetype({ name: main, emoji: getEmojiForSubtype(main) });
      setSubtype({
        name: sub,
        emoji: getEmojiForSubtype(sub),
        commentary: data.commentary ?? "No insight available.",
      });
    }

    setInput("");
    setLoading(false);
    scrollToBottom();
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

  const endOfLogRef = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("promptquest-history") || "[]");
    }
    return [];
  });
  const [riddleStage, setRiddleStage] = useState(() => {
    if (typeof window !== "undefined") {
      return parseInt(localStorage.getItem("promptquest-stage") || "0");
    }
    return 0;
  });
  const [displayedLine, setDisplayedLine] = useState<string | null>(null);
  const [ocean, setOcean] = useState({
    Openness: 50,
    Conscientiousness: 50,
    Extraversion: 50,
    Agreeableness: 50,
    Neuroticism: 50,
  });
  const [archetype, setArchetype] = useState<{
    name: string;
    emoji: string;
  } | null>(null);
  const [subtype, setSubtype] = useState<{
    name: string;
    emoji: string;
    commentary: string;
  } | null>(null);
  const [booting, setBooting] = useState(true);
  const [bootLines, setBootLines] = useState<string[]>([]);

  useEffect(() => {
    const lines = [
      "> SYSTEM CHECK...",
      "> LOADING CORE MODULES...",
      "> INITIALIZING NEURAL INTERFACE...",
      "> ALIGNING PERSONALITY MATRIX...",
      "> WAKING ARCHETYPE ENGINE...",
      "> LINK ESTABLISHED.",
    ];

    let i = 0;
    const interval = setInterval(() => {
      setBootLines((prev) => [...prev, lines[i]]);
      i++;
      if (i === lines.length) {
        clearInterval(interval);
        setTimeout(() => setBooting(false), 1000);
      }
    }, 400);
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6 crt-flicker">
      <div className="max-w-4xl mx-auto">
        {booting ? (
          <div className="bg-black text-green-400 p-4 h-[400px] border border-green-700 rounded overflow-y-scroll mb-6 animate-fade-in-slow">
            {bootLines.map((line, i) => (
              <div key={i} className="animate-fade-in mb-1 whitespace-pre">
                {line}
              </div>
            ))}
            <div className="animate-pulse">█</div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6 animate-fade-in-slow">
              <Image
                src={logo}
                alt="PromptQuest logo"
                width={160}
                height={160}
                className="mx-auto mb-2 rounded shadow-lg animate-logo-flicker"
              />
              <h1 className="text-3xl font-bold tracking-wide">PROMPTQUEST</h1>
              <p className="text-green-600 text-sm italic animate-pulse">
                initializing psyche interface...
              </p>
            </div>

            <div className="mb-4 p-4 border border-green-500 rounded animate-fade-in-slow">
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
                    <span className="w-10 text-right">
                      {Math.round(value)}%
                    </span>
                  </div>
                ))}
              </div>
              <PersonalitySigil archetype={archetype?.name ?? null} />
            </div>

            {archetype && subtype ? (
              <div className="mt-6 p-4 border border-green-600 rounded bg-black shadow-lg animate-fade-in-slow">
                <h2 className="text-xl text-green-300 font-bold mb-2">
                  🧬 Personality Unlocked
                </h2>
                <div className="text-green-400 mb-1">
                  <span className="font-semibold">Archetype:</span>{" "}
                  {archetype.emoji} <strong>{archetype.name}</strong>
                </div>
                <div className="text-green-400 mb-1">
                  <span className="font-semibold">Subtype:</span>{" "}
                  {subtype.emoji} <strong>{subtype.name}</strong>
                </div>
                <p className="text-green-500 italic text-sm mb-4">
                  “{subtype.commentary}”
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const message = `I just unlocked my archetype in PROMPTQUEST: ${archetype.name} (${subtype.name}) ${subtype.emoji} — ${subtype.commentary}`;
                      navigator.clipboard.writeText(message);
                      alert(
                        "Share text copied to clipboard! Paste it on LinkedIn, X, or anywhere.",
                      );
                    }}
                    className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white text-sm rounded transition-all"
                  >
                    📤 Share Your Psyche
                  </button>
                  <span className="text-xs text-green-500 font-mono">
                    Referral Code:{" "}
                    <strong className="text-green-300">
                      PROMPT-{subtype.name.slice(0, 3).toUpperCase()}
                      {Math.floor(Math.random() * 900 + 100)}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex justify-center mt-6 animate-pulse text-green-800 italic">
                Personality analysis in progress...
              </div>
            )}

            <div className="bg-gray-900 p-4 rounded border border-green-600 mb-4 h-[400px] overflow-y-scroll animate-fade-in-slow">
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
                  <span className="animate-pulse">█</span>
                </div>
              )}
              <div ref={endOfLogRef} />
            </div>

            <div className="flex gap-2 animate-fade-in-slow">
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
          </>
        )}
      </div>
    </div>
  );
}
