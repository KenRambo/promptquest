// components/PersonalitySigil.tsx

import React from "react";

interface SigilProps {
  archetype: string | null;
}

const archetypeStyles: Record<string, { icon: string; color: string }> = {
  "The Visionary": { icon: "🌌", color: "text-purple-400" },
  "The Architect": { icon: "🏛️", color: "text-yellow-300" },
  "The Spark": { icon: "⚡", color: "text-pink-400" },
  "The Harmonizer": { icon: "💮", color: "text-green-300" },
  "The Reactor": { icon: "💧", color: "text-blue-400" },
};

export default function PersonalitySigil({ archetype }: SigilProps) {
  if (!archetype) return null;

  const label = archetype.split("–")[0].trim();
  const description = archetype.split("–")[1]?.trim();
  const style = archetypeStyles[label] || { icon: "🌀", color: "text-white" };

  return (
    <div className="mt-4 p-4 border border-green-600 rounded shadow-inner bg-gray-900 animate-pulse">
      <div className="flex items-center space-x-4">
        <span className={`text-3xl ${style.color}`}>{style.icon}</span>
        <div>
          <h3 className={`text-xl font-bold ${style.color}`}>{label}</h3>
          <p className="text-green-300 italic mt-1">{description}</p>
        </div>
      </div>
    </div>
  );
}
