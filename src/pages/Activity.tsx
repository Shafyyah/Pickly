import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { SuggestionCard } from "@/components/SuggestionCard";
import { toast } from "sonner";

const Activity = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        // Auto-generate activities on load
        generateActivities(session.user.id);
      } else {
        navigate("/login");
      }
    });
  }, [navigate]);

  const generateActivities = async (userId?: string) => {
    const id = userId || user?.id;
    if (!id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-activities", {
        body: { userId: id },
      });

      if (error) throw error;

      setActivities(data.activities);
      toast.success("Activities generated!");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate activities");
    }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-subtle)' }}>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
            What Should I Do?
          </h1>
          <Button
            onClick={() => generateActivities()}
            disabled={loading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {activities.length === 0 && !loading && (
            <div className="bg-card rounded-2xl p-12 text-center" style={{ boxShadow: 'var(--shadow-card)' }}>
              <p className="text-muted-foreground">Generating personalized activities for you...</p>
            </div>
          )}

          {activities.map((activity, i) => (
            <SuggestionCard
              key={i}
              title={activity.title}
              summary={activity.summary}
              details={activity.details}
              mindMapNodes={activity.mindMapNodes}
              onDoIt={() => console.log("Do it")}
              onSuggestAgain={() => generateActivities()}
              onPickForMe={() => console.log("Pick for me")}
              onChatMessage={(msg) => console.log("Chat:", msg)}
              loading={loading}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activity;
