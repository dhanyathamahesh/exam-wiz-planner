import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Subject {
  id: string;
  name: string;
  description: string | null;
  color: string;
}

const Subjects = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("name");

      if (error) throw error;
      setSubjects(data || []);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subjects</h1>
        <p className="text-muted-foreground">Select a subject to view chapters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Card
            key={subject.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/subjects/${subject.id}/chapters`)}
          >
            <CardHeader>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: subject.color }}
                >
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <CardTitle>{subject.name}</CardTitle>
              </div>
            </CardHeader>
            {subject.description && (
              <CardContent>
                <CardDescription>{subject.description}</CardDescription>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Subjects;
