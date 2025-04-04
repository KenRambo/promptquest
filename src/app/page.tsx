// File: app/page.tsx (or pages/index.tsx in traditional Next.js)

"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [identity, setIdentity] = useState("???");

  const submitPrompt = async () => {
    if (!input) return;
    setLoading(true);
    const res = await fetch("/api/gpt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });
    const data = await res.json();
    setHistory([...history, `> ${input}`, data]);

    // Naive identity inference example
    if (input.toLowerCase().includes("analyze") || input.length > 150) {
      setIdentity("The Interpreter");
    } else if (
      input.toLowerCase().includes("build") ||
      input.includes("code")
    ) {
      setIdentity("The Builder");
    } else if (
      input.toLowerCase().includes("you are") &&
      input.toLowerCase().includes("pirate")
    ) {
      setIdentity("The Trickster");
    }

    setInput("");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black text-green-400 font-mono p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-4 p-4 border border-green-500 rounded">
          <h2 className="text-xl">
            🧠 Identity Class: <span className="text-white">{identity}</span>
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
