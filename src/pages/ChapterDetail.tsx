import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowLeft, Clock, BookOpen, Youtube, Mic, FileText, MessageCircle, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  description: string | null;
  estimated_time_minutes: number | null;
  difficulty: string | null;
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  url: string | null;
  resource_type: string | null;
  difficulty: string;
}

const ChapterDetail = () => {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (chapterId) {
      fetchChapterData();
      trackProgress();
    }
  }, [chapterId, user]);

  const fetchChapterData = async () => {
    try {
      // Fetch chapter details
      const { data: chapterData, error: chapterError } = await supabase
        .from("chapters")
        .select("*")
        .eq("id", chapterId)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // Fetch resources for this chapter only
      const { data: resourcesData, error: resourcesError } = await supabase
        .from("resources")
        .select("*")
        .eq("chapter_id", chapterId);

      if (resourcesError) throw resourcesError;
      setResources(resourcesData || []);
    } catch (error) {
      console.error("Error fetching chapter data:", error);
      toast.error("Failed to load chapter");
    } finally {
      setLoading(false);
    }
  };

  const trackProgress = async () => {
    if (!user || !chapterId) return;

    try {
      // Check if progress exists
      const { data: existingProgress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("chapter_id", chapterId)
        .single();

      if (!existingProgress) {
        // Create progress entry
        await supabase.from("user_progress").insert({
          user_id: user.id,
          chapter_id: chapterId,
          status: "in_progress",
          first_accessed_at: new Date().toISOString(),
        });
      }

      setProgress(existingProgress?.progress_percentage || 0);
    } catch (error) {
      console.error("Error tracking progress:", error);
    }
  };

  const getResourcesByType = (type: string) => {
    return resources.filter((r) => r.resource_type === type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Chapter Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Badge variant="outline">Chapter {chapter.chapter_number}</Badge>
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
          {chapter.estimated_time_minutes && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground ml-auto">
              <Clock className="h-4 w-4" />
              <span>{chapter.estimated_time_minutes} min</span>
            </div>
          )}
        </div>
        <h1 className="text-4xl font-bold mb-2">{chapter.title}</h1>
        {chapter.description && (
          <p className="text-muted-foreground">{chapter.description}</p>
        )}
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      </div>

      {/* Tabs for different resource types */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notes">
            <BookOpen className="h-4 w-4 mr-2" />
            Study Notes
          </TabsTrigger>
          <TabsTrigger value="youtube">
            <Youtube className="h-4 w-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Mic className="h-4 w-4 mr-2" />
            Voiceover
          </TabsTrigger>
          <TabsTrigger value="examples">
            <FileText className="h-4 w-4 mr-2" />
            Examples
          </TabsTrigger>
          <TabsTrigger value="mentor">
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Mentor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Study Notes</CardTitle>
              <CardDescription>
                Read through the chapter content and key concepts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getResourcesByType("notes").length > 0 ? (
                getResourcesByType("notes").map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    {resource.url && (
                      <CardContent>
                        <Button asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Notes
                          </a>
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No study notes available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="youtube" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>YouTube Lessons</CardTitle>
              <CardDescription>
                Watch video explanations for this chapter
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getResourcesByType("youtube").length > 0 ? (
                getResourcesByType("youtube").map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    {resource.url && (
                      <CardContent>
                        <div className="aspect-video">
                          <iframe
                            className="w-full h-full rounded-lg"
                            src={resource.url.replace("watch?v=", "embed/")}
                            title={resource.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No videos available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audio" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Voiceover</CardTitle>
              <CardDescription>
                Listen to chapter content with text-to-speech
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Voiceover feature coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Examples & Solutions</CardTitle>
              <CardDescription>
                Practice problems and worked examples
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {getResourcesByType("examples").length > 0 ? (
                getResourcesByType("examples").map((resource) => (
                  <Card key={resource.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{resource.title}</CardTitle>
                      {resource.description && (
                        <CardDescription>{resource.description}</CardDescription>
                      )}
                    </CardHeader>
                    {resource.url && (
                      <CardContent>
                        <Button asChild>
                          <a href={resource.url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2 h-4 w-4" />
                            View Examples
                          </a>
                        </Button>
                      </CardContent>
                    )}
                  </Card>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No examples available yet
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentor" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ask Mentor</CardTitle>
              <CardDescription>
                Get help from your AI mentor chatbot
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Mentor chatbot coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChapterDetail;
