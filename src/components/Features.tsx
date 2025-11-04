import { BookOpen, Brain, ChartBar, FileText, Target, Video } from "lucide-react";
import { Card, CardContent } from "./ui/card";

const features = [
  {
    icon: Video,
    title: "Curated Video Lessons",
    description: "Access handpicked YouTube lessons organized by topic and difficulty level",
    color: "subject-math",
  },
  {
    icon: FileText,
    title: "Past Exam Papers",
    description: "Practice with previous year question papers and detailed solutions",
    color: "subject-science",
  },
  {
    icon: ChartBar,
    title: "Subject Weightages",
    description: "Know exactly which topics carry more marks in your target exams",
    color: "subject-english",
  },
  {
    icon: Brain,
    title: "AI Study Plans",
    description: "Get personalized study schedules based on your strengths and weaknesses",
    color: "subject-history",
  },
  {
    icon: Target,
    title: "Adaptive Quizzes",
    description: "Practice quizzes that adapt to your learning pace and weak areas",
    color: "subject-reasoning",
  },
  {
    icon: BookOpen,
    title: "Grade-Based Resources",
    description: "Content tailored specifically for your grade and curriculum",
    color: "subject-math",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive learning platform designed to help students achieve their academic goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-border hover:shadow-md transition-smooth hover:-translate-y-1 gradient-card"
              >
                <CardContent className="p-6">
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `hsl(var(--${feature.color}) / 0.1)` }}
                  >
                    <Icon
                      className="h-6 w-6"
                      style={{ color: `hsl(var(--${feature.color}))` }}
                    />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
