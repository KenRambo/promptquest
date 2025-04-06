import React, { useRef, useEffect, useState } from "react";
import html2canvas from "html2canvas";
import Image from "next/image";

interface ShareCardProps {
  archetype: { name: string; emoji: string } | null;
  subtype: { name: string; emoji: string; commentary: string } | null;
}

const ShareCard: React.FC<ShareCardProps> = ({ archetype, subtype }) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 500);
    return () => clearTimeout(timeout);
  }, []);

  const handleEnableAudio = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
    setAudioEnabled(true);
  };

  const generateImageAndDownload = async () => {
    if (!cardRef.current) return;

    const canvas = await html2canvas(cardRef.current);
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "promptquest-psyche.png";
    link.click();
  };

  const copyToClipboard = () => {
    if (!archetype || !subtype) return;
    const shareText = `🎮 I just unlocked my psyche in PROMPTQUEST!\n\nArchetype: ${archetype.name} ${archetype.emoji}\nSubtype: ${subtype.name} ${subtype.emoji}\n\n“${subtype.commentary}”\n\nCurious what yours is? Try it out: https://promptquest.com #PromptQuest #PersonalityUncovered`;
    navigator.clipboard.writeText(shareText);
    alert("Text copied! Ready to paste into LinkedIn, X, or anywhere.");
  };

  if (!archetype || !subtype) return null;

  return (
    <div className="text-center mt-6">
      <audio ref={audioRef} loop>
        <source src="/ambient-synth-loop.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {!audioEnabled && (
        <button
          onClick={handleEnableAudio}
          className="mb-4 px-4 py-2 bg-blue-700 text-white rounded-lg shadow-md hover:bg-blue-600"
        >
          🔊 Enable Ambient Music
        </button>
      )}

      <div
        ref={cardRef}
        className={`relative bg-gradient-to-br from-purple-800 via-indigo-900 to-black text-white p-8 rounded-2xl shadow-2xl w-[400px] mx-auto border-4 border-green-400 transform transition duration-1000 ease-out ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95"}`}
      >
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-green-400 rounded-full animate-ping"></div>
        <div className="absolute -bottom-4 -right-4 w-10 h-10 bg-green-400 rounded-full animate-ping"></div>

        <Image
          src="/promptquest-logo.png"
          alt="PromptQuest Logo"
          width={64}
          height={64}
          className="mx-auto mb-4 rounded-lg shadow-md"
        />

        <h2 className="text-3xl font-bold text-yellow-300">
          ✨ My PromptQuest Psyche
        </h2>
        <p className="mt-6 text-xl">
          {archetype.emoji} <strong>{archetype.name}</strong>
        </p>
        <p className="text-lg mt-1">
          {subtype.emoji} <strong>{subtype.name}</strong>
        </p>
        <blockquote className="italic text-indigo-200 mt-4 text-sm">
          “{subtype.commentary}”
        </blockquote>

        <div className="mt-6 flex justify-center gap-2 text-xs">
          <span className="bg-black bg-opacity-30 border border-white px-2 py-1 rounded-full">
            #PromptQuest
          </span>
          <span className="bg-black bg-opacity-30 border border-white px-2 py-1 rounded-full">
            #PsycheProfile
          </span>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        <button
          onClick={generateImageAndDownload}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-700 hover:from-green-400 hover:to-green-600 text-white font-semibold rounded-xl shadow-md"
        >
          📸 Download Image
        </button>
        <button
          onClick={copyToClipboard}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-semibold rounded-xl shadow-md"
        >
          📋 Copy Share Text
        </button>
      </div>
    </div>
  );
};

export default ShareCard;
