"use client";

import React from "react";

// Define props interface for all chart components
interface ChartProps {
  large?: boolean;
}

// Bar Chart Component
export const BarChart: React.FC<ChartProps> = ({ large }) => {
  return (
    <div className="w-full h-full flex items-end justify-between gap-1">
      {[65, 40, 80, 55, 95, 70, 30, 85].map((height, index) => (
        <div key={index} className="flex flex-col items-center">
          <div
            className="bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-200"
            style={{
              height: `${height}%`,
              width: large ? "24px" : "16px",
            }}
          ></div>
          <span className="text-xs mt-1 text-muted-foreground">
            {["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8"][index]}
          </span>
        </div>
      ))}
    </div>
  );
};

// Line Chart Component
export const LineChart: React.FC<ChartProps> = ({}) => {
  // SVG dimensions
  const width = 100;
  const height = 100;

  // Sample data points (normalized to 0-100 range)
  const dataPoints = [10, 40, 30, 60, 55, 70, 45, 90];

  // Generate SVG path from data points
  const generatePath = () => {
    const points = dataPoints.map((point, index) => {
      const x = (index / (dataPoints.length - 1)) * width;
      const y = height - (point / 100) * height;
      return `${x},${y}`;
    });

    return `M ${points.join(" L ")}`;
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((line) => (
          <line
            key={line}
            x1="0"
            y1={height - (line / 100) * height}
            x2={width}
            y2={height - (line / 100) * height}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}

        {/* Line chart path */}
        <path
          d={generatePath()}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {dataPoints.map((point, index) => {
          const x = (index / (dataPoints.length - 1)) * width;
          const y = height - (point / 100) * height;

          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="hsl(var(--primary))"
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    </div>
  );
};

// Pie Chart Component
export const PieChart: React.FC<ChartProps> = ({ large }) => {
  // Sample data for pie segments
  const segments = [
    { percentage: 45, color: "hsl(var(--primary))" },
    { percentage: 30, color: "hsl(var(--primary) / 0.8)" },
    { percentage: 15, color: "hsl(var(--primary) / 0.6)" },
    { percentage: 10, color: "hsl(var(--primary) / 0.4)" },
  ];

  // Calculate SVG coordinates for pie segments
  const generatePieSegments = () => {
    const center = 50;
    const radius = 40;
    let startAngle = 0;

    return segments.map((segment, index) => {
      const angle = (segment.percentage / 100) * 360;
      const endAngle = startAngle + angle;

      // Convert angles to radians
      const startRad = (startAngle - 90) * (Math.PI / 180);
      const endRad = (endAngle - 90) * (Math.PI / 180);

      // Calculate coordinates
      const x1 = center + radius * Math.cos(startRad);
      const y1 = center + radius * Math.sin(startRad);
      const x2 = center + radius * Math.cos(endRad);
      const y2 = center + radius * Math.sin(endRad);

      // Determine if the arc should be drawn as a large arc
      const largeArcFlag = angle > 180 ? 1 : 0;

      // Create SVG path
      const path = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      // Update start angle for next segment
      startAngle = endAngle;

      return (
        <path
          key={index}
          d={path}
          fill={segment.color}
          stroke="white"
          strokeWidth="1"
        />
      );
    });
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        {generatePieSegments()}
      </svg>

      {/* Legend */}
      {large && (
        <div className="absolute bottom-0 right-0 flex flex-col gap-1 text-xs">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              ></div>
              <span>{segment.percentage}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
