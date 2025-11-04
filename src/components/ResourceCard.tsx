import { ExternalLink, FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ResourceCardProps {
  title: string;
  type: "video" | "pdf" | "paper";
  subject: string;
  difficulty: "Easy" | "Medium" | "Hard";
  description: string;
  url?: string;
}

export const ResourceCard = ({
  title,
  type,
  subject,
  difficulty,
  description,
  url,
}: ResourceCardProps) => {
  const getTypeIcon = () => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5" />;
      case "pdf":
        return <FileText className="h-5 w-5" />;
      case "paper":
        return <FileText className="h-5 w-5" />;
    }
  };

  const getDifficultyColor = () => {
    switch (difficulty) {
      case "Easy":
        return "bg-success/10 text-success";
      case "Medium":
        return "bg-warning/10 text-warning";
      case "Hard":
        return "bg-destructive/10 text-destructive";
    }
  };

  return (
    <Card className="border-border hover:shadow-md transition-smooth">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <Badge variant="outline">{type.toUpperCase()}</Badge>
          </div>
          <Badge className={getDifficultyColor()}>{difficulty}</Badge>
        </div>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          <span className="font-medium">{subject}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{description}</p>
        {url && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              View Resource
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
