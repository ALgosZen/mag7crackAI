import React from "react";

interface STARRadarProps {
  metrics: {
    situationTask: number;
    action: number;
    result: number;
    communication: number;
  };
}

export default function STARRadar({ metrics }: STARRadarProps) {
  const size = 180;
  const center = size / 2;
  const radius = size * 0.4;

  const points = [
    { label: "S/T", val: metrics.situationTask, angle: -Math.PI / 2 },
    { label: "A", val: metrics.action, angle: 0 },
    { label: "R", val: metrics.result, angle: Math.PI / 2 },
    { label: "C", val: metrics.communication, angle: Math.PI }
  ];

  const polygonPoints = points.map(p => {
    const r = (p.val / 10) * radius;
    const x = center + r * Math.cos(p.angle);
    const y = center + r * Math.sin(p.angle);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background webs */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((step, i) => (
          <path
            key={i}
            d={points.map((p, j) => {
              const r = radius * step;
              const x = center + r * Math.cos(p.angle);
              const y = center + r * Math.sin(p.angle);
              return `${j === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(" ") + " Z"}
            fill="none"
            stroke="#e4e4e7"
            strokeWidth="1"
          />
        ))}
        {/* Axis lines */}
        {points.map((p, i) => {
          const x = center + radius * Math.cos(p.angle);
          const y = center + radius * Math.sin(p.angle);
          return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e4e4e7" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(129, 140, 248, 0.2)"
          stroke="#6366f1"
          strokeWidth="2"
        />
        {/* Labels */}
        {points.map((p, i) => {
          const r = radius + 15;
          const x = center + r * Math.cos(p.angle);
          const y = center + r * Math.sin(p.angle);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              className="text-[10px] font-black fill-zinc-400"
              dominantBaseline="middle"
            >
              {p.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
