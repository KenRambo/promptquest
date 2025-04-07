import React from "react";

type OceanValues = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
};

type Props = {
  values: OceanValues;
  orientation?: "vertical" | "horizontal";
};

const traitLabels = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Neuroticism",
};

export default function OceanBars({ values, orientation = "vertical" }: Props) {
  const traits = Object.entries(values) as [keyof OceanValues, number][];

  if (orientation === "vertical") {
    return (
      <div className="flex flex-row gap-4 items-end">
        {traits.map(([trait, value]) => (
          <div
            key={trait}
            className="flex flex-col items-center text-xs text-green-300"
          >
            <div className="w-4 h-24 bg-green-900 rounded overflow-hidden relative">
              <div
                className="absolute bottom-0 w-full bg-green-400 transition-all duration-700"
                style={{ height: `${value}%` }}
              />
            </div>
            <span className="mt-2 text-green-500">{trait}</span>
          </div>
        ))}
      </div>
    );
  }

  // fallback to horizontal layout if needed
  return (
    <div className="flex flex-col gap-2 w-full">
      {traits.map(([trait, value]) => (
        <div key={trait}>
          <span className="text-green-300 text-xs font-bold">{trait}</span>
          <div className="h-3 bg-green-900 w-full rounded overflow-hidden">
            <div
              className="h-full bg-green-400 transition-all duration-700"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
