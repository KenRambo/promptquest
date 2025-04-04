// File: app/components/PersonalitySigil.tsx

interface Props {
  archetype: string | null;
}

function getEmojiForSubtype(archetype: string): string {
  if (archetype.includes("Builder")) return "🧱";
  if (archetype.includes("Planner")) return "📐";
  if (archetype.includes("Strategist")) return "♟️";
  if (archetype.includes("Executor")) return "🛠️";
  if (archetype.includes("Dreamer")) return "🌙";
  if (archetype.includes("Inventor")) return "⚙️";
  if (archetype.includes("Mystic")) return "🔮";
  if (archetype.includes("Explorer")) return "🧭";
  if (archetype.includes("Performer")) return "🎭";
  if (archetype.includes("Leader")) return "👑";
  if (archetype.includes("Connector")) return "🤝";
  if (archetype.includes("Storm")) return "🌩️";
  if (archetype.includes("Healer")) return "💊";
  if (archetype.includes("Diplomat")) return "🕊️";
  if (archetype.includes("Friend")) return "😊";
  if (archetype.includes("Listener")) return "👂";
  if (archetype.includes("Empath")) return "💞";
  if (archetype.includes("Artist")) return "🎨";
  if (archetype.includes("Survivor")) return "🧱";
  if (archetype.includes("Shadow")) return "🌑";
  if (archetype.includes("Ascended")) return "✨";
  return "❓";
}

export default function PersonalitySigil({ archetype }: Props) {
  if (!archetype || archetype.includes("Undefined")) {
    return (
      <div className="mt-4 text-center text-green-600 animate-pulse italic">
        Analyzing psyche...
      </div>
    );
  }

  return (
    <div className="mt-4 text-lg text-center">
      <div className="text-green-400">
        {getEmojiForSubtype(archetype)}{" "}
        <span className="italic">{archetype}</span>
      </div>
    </div>
  );
}
