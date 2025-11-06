import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Clock, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  description: string | null;
  estimated_time_minutes: number | null;
  difficulty: string | null;
}

const Chapters = () => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [subjectName, setSubjectName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (subjectId) {
      fetchChapters();
    }
  }, [subjectId, user]);

  const fetchChapters = async () => {
    try {
      // Fetch subject name
      const { data: subjectData } = await supabase
        .from("subjects")
        .select("name")
        .eq("id", subjectId)
        .single();

      if (subjectData) {
        setSubjectName(subjectData.name);
      }

      // Fetch chapters
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("subject_id", subjectId)
        .order("chapter_number");

      if (error) throw error;
      setChapters(data || []);
    } catch (error) {
      console.error("Error fetching chapters:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate("/subjects")}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Subjects
      </Button>

      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{subjectName}</h1>
        <p className="text-muted-foreground">
          Select a chapter to start learning
        </p>
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              No chapters available yet. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chapters.map((chapter) => (
            <Card
              key={chapter.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/chapters/${chapter.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        Chapter {chapter.chapter_number}
                      </Badge>
                      {chapter.difficulty && (
                        <Badge
                          variant={
                            chapter.difficulty === "easy"
                              ? "default"
                              : chapter.difficulty === "medium"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {chapter.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {chapter.title}
                    </CardTitle>
                    {chapter.description && (
                      <CardDescription>{chapter.description}</CardDescription>
                    )}
                  </div>
                  {chapter.estimated_time_minutes && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{chapter.estimated_time_minutes} min</span>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Chapters;
