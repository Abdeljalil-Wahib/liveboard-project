// packages/web/src/app/board/[roomId]/page.tsx
"use client";

import { useEffect, useState, useRef, use } from "react";
import io, { Socket } from "socket.io-client";
import dynamic from "next/dynamic";

const Whiteboard = dynamic(() => import("../../components/Whiteboard"), {
  ssr: false,
});

interface Point {
  x: number;
  y: number;
}

// 1. THE FIX: We explicitly type 'params' as a Promise.
// This tells TypeScript to expect a value that can be unwrapped by React.use().
export default function BoardPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  // 2. Now, React.use() is valid because it's receiving a Promise-like type.
  // We also add the type assertion as a final guarantee.
  const { roomId } = use(params) as { roomId: string };

  const [socket, setSocket] = useState<Socket | null>(null);
  const [lines, setLines] = useState<Point[][]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("join-room", roomId);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    if (!socket) return;

    const handleCanvasState = (linesHistory: Point[][]) => {
      setLines(linesHistory);
    };
    socket.on("canvas-state", handleCanvasState);
    const handleDraw = (data: Point) => {
      setLines((prevLines) => {
        const newLines = [...prevLines];
        newLines[newLines.length - 1].push(data);
        return newLines;
      });
    };

    const handleStartDrawing = (data: Point) => {
      setLines((prevLines) => [...prevLines, [data]]);
    };
    const handleClear = () => setLines([]);
    socket.on("start-drawing", handleStartDrawing);
    socket.on("drawing", handleDraw);
    socket.on("clear", handleClear);
    return () => {
      socket.off("canvas-state", handleCanvasState);
      socket.off("drawing", handleDraw);
      socket.off("start-drawing", handleStartDrawing);
      socket.off("clear", handleClear);
    };
  }, [socket]);

  // All handlers below this line remain the same and are correct.
  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    setLines((prevLines) => [...prevLines, [pos]]);
    socket?.emit("start-drawing", { ...pos, roomId });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const pos = e.target.getStage().getPointerPosition();
    setLines((prevLines) => {
      const newLines = [...prevLines];
      newLines[newLines.length - 1].push(pos);
      return newLines;
    });
    socket?.emit("drawing", { ...pos, roomId });
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
    socket?.emit("finish-drawing", { roomId });
  };

  const handleClear = () => {
    if (!socket) return;
    socket.emit("clear", { roomId });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-2xl mb-4">
        Whiteboard Room:{" "}
        <span className="font-bold text-blue-500">{roomId}</span>
      </h1>
      <Whiteboard
        lines={lines}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <button
        onClick={handleClear}
        className="mt-4 px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-700"
      >
        Clear Canvas
      </button>
    </main>
  );
}
