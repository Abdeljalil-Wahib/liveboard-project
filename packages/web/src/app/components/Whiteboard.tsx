// packages/web/src/app/components/Whiteboard.tsx
"use client";

import { Stage, Layer, Line, Rect } from "react-konva";

interface Point {
  x: number;
  y: number;
}

interface WhiteboardProps {
  lines: Point[][];
  onMouseDown: (e: any) => void;
  onMouseMove: (e: any) => void;
  onMouseUp: (e: any) => void;
}

export default function Whiteboard({
  lines,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}: WhiteboardProps) {
  // Check if window is defined to avoid SSR errors on dimensions
  const stageWidth =
    typeof window !== "undefined" ? window.innerWidth * 0.8 : 0;
  const stageHeight =
    typeof window !== "undefined" ? window.innerHeight * 0.7 : 0;

  return (
    <div className="border border-gray-400">
      <Stage
        width={stageWidth}
        height={stageHeight}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
      >
        <Layer>
          {/* We render a Rect instead of a Circle for the background */}
          <Rect width={stageWidth} height={stageHeight} fill="white" />
          {lines.map((line, i) => (
            <Line
              key={i}
                  points={line.flatMap(point => [point.x, point.y])}
                  stroke="black"
                  strokeWidth={2}
                  tension={0.5}
                  lineCap="round"
                  lineJoin="round"
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
