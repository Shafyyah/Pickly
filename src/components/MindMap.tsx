import { useEffect, useRef } from "react";

export interface MindMapNode {
  label: string;
  type: "input" | "context" | "analysis" | "final";
}

interface MindMapProps {
  nodes: MindMapNode[];
  finalSuggestion: string;
}

export const MindMap = ({ nodes, finalSuggestion }: MindMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    ctx.scale(2, 2);

    const centerX = canvas.offsetWidth / 2;
    const centerY = canvas.offsetHeight / 2;
    const radius = 120;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw connections from nodes to center
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      // Draw line
      ctx.strokeStyle = "hsl(188 94% 43% / 0.3)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(centerX, centerY);
      ctx.stroke();

      // Draw node circle
      ctx.fillStyle = node.type === "input" ? "hsl(38 92% 50%)" : "hsl(188 94% 43%)";
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Draw label
      ctx.fillStyle = "hsl(215 25% 27%)";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(node.label, x, y - 15);
    });

    // Draw center node
    ctx.fillStyle = "hsl(220 70% 60%)";
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
    ctx.fill();

    // Draw center label
    ctx.fillStyle = "hsl(215 25% 27%)";
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Decision", centerX, centerY + 35);
  }, [nodes]);

  return (
    <div className="bg-muted/50 rounded-xl p-6 mt-6">
      <h3 className="text-sm font-semibold mb-4 text-muted-foreground">AI Decision Process</h3>
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-lg"
        style={{ background: 'transparent' }}
      />
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
        {nodes.map((node, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${node.type === 'input' ? 'bg-secondary' : 'bg-primary'}`} />
            <span className="text-muted-foreground">{node.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
