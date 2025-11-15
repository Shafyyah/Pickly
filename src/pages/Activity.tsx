import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import { SuggestionCard } from "@/components/SuggestionCard";
import { toast } from "sonner";

const Activity = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
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

          {activities.length > 0 && (
            <div className="space-y-6">
              {activities.map((activity, i) => (
                <SuggestionCard
                  key={i}
                  title={activity.title}
                  summary={activity.summary}
                  details={activity.details}
                  imageUrl={activity.imageUrl}
                  onDoIt={() => console.log("Do it")}
                  onChatMessage={(msg) => console.log("Chat:", msg)}
                  loading={loading}
                  expanded={expandedIndex === i}
                />
              ))}
              
              {/* Action Buttons at the end */}
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => generateActivities()} 
                  disabled={loading}
                  variant="outline"
                  className="flex-1"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Suggest Again
                </Button>
                <Button 
                  onClick={() => {
                    const randomIndex = Math.floor(Math.random() * activities.length);
                    setExpandedIndex(randomIndex);
                    toast.success(`Selected: ${activities[randomIndex].title}`);
                  }}
                  disabled={loading}
                  className="flex-1"
                >
                  Pick For Me
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activity;
