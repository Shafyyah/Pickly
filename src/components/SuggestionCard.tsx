import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChefHat, Sparkles } from "lucide-react";
import { MindMap, type MindMapNode } from "./MindMap";
import { Input } from "@/components/ui/input";

interface SuggestionCardProps {
  title: string;
  summary: string;
  details?: {
    ingredients?: string[];
    steps?: string[];
    time?: string;
    tips?: string;
    description?: string;
    duration?: string;
    instructions?: string[];
  };
  mindMapNodes: MindMapNode[];
  onDoIt: () => void;
  onSuggestAgain?: () => void;
  onPickForMe?: () => void;
  onChatMessage: (message: string) => void;
  loading?: boolean;
}

export const SuggestionCard = ({
  title,
  summary,
  details,
  mindMapNodes,
  onDoIt,
  onSuggestAgain,
  onPickForMe,
  onChatMessage,
  loading,
}: SuggestionCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState("");

  const handleDoIt = () => {
    setExpanded(true);
    onDoIt();
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      onChatMessage(chatMessage);
      setChatMessage("");
    }
  };

  return (
    <div
      className={`bg-card rounded-2xl p-6 transition-all duration-300 ${
        expanded ? "scale-105" : ""
      }`}
      style={{ boxShadow: expanded ? 'var(--shadow-card)' : 'var(--shadow-soft)' }}
    >
      <div className="flex items-start gap-3 mb-4">
        {details?.ingredients ? (
          <ChefHat className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
        ) : (
          <Sparkles className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
        )}
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-muted-foreground">{summary}</p>
        </div>
      </div>

      {expanded && details && (
        <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {details.ingredients && (
            <div>
              <h4 className="font-semibold mb-2">Ingredients:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {details.ingredients.map((ingredient, i) => (
                  <li key={i}>{ingredient}</li>
                ))}
              </ul>
            </div>
          )}

          {details.steps && (
            <div>
              <h4 className="font-semibold mb-2">Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                {details.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}

          {details.instructions && (
            <div>
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                {details.instructions.map((instruction, i) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ul>
            </div>
          )}

          {details.description && (
            <div>
              <h4 className="font-semibold mb-2">Details:</h4>
              <p className="text-sm text-muted-foreground">{details.description}</p>
            </div>
          )}

          {(details.time || details.duration) && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold">Time:</span>
              <span className="text-muted-foreground">{details.time || details.duration}</span>
            </div>
          )}

          {details.tips && (
            <div className="bg-primary/10 rounded-lg p-3">
              <p className="text-sm font-medium text-primary">{details.tips}</p>
            </div>
          )}
        </div>
      )}

      <MindMap nodes={mindMapNodes} finalSuggestion={title} />

      <div className="mt-6">
        <Button
          onClick={handleDoIt}
          className="w-full"
          disabled={loading}
        >
          Do It
        </Button>
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          placeholder="Ask for modifications..."
          value={chatMessage}
          onChange={(e) => setChatMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          disabled={loading}
        />
        <Button onClick={handleSendMessage} disabled={loading || !chatMessage.trim()}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send"}
        </Button>
      </div>
    </div>
  );
};
