import { ArrowRight, BookOpen, Target, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-education.jpg";

export const Hero = () => {
  return (
    <section id="home" className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-5" />
      
      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center py-12">
        <div className="space-y-8">
          <div className="inline-block">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-light px-4 py-2 text-sm font-medium text-primary">
              <Zap className="h-4 w-4" />
              AI-Powered Learning Platform
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Master Every Subject with{" "}
            <span className="gradient-primary bg-clip-text text-transparent">
              Personalized Learning
            </span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl">
            Access curated resources, previous exam papers, subject-wise weightages, and AI-generated 
            study plans tailored to your grade and target exams.
          </p>

          <div className="flex flex-wrap gap-4">
            <Button variant="hero" size="lg" className="group" asChild>
              <Link to="/auth">
                Start Learning
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#resources">
                <BookOpen className="h-5 w-5" />
                Browse Resources
              </a>
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
            <div>
              <div className="text-3xl font-bold text-primary">1000+</div>
              <div className="text-sm text-muted-foreground">Resources</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary">500+</div>
              <div className="text-sm text-muted-foreground">Past Papers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent">50+</div>
              <div className="text-sm text-muted-foreground">Exams Covered</div>
            </div>
          </div>
        </div>

        <div className="relative lg:block hidden">
          <div className="relative rounded-2xl overflow-hidden shadow-lg">
            <img
              src={heroImage}
              alt="Students learning together"
              className="w-full h-auto object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>
          
          <div className="absolute -bottom-6 -left-6 bg-card rounded-xl shadow-lg p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full gradient-secondary flex items-center justify-center">
                <Target className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <div className="font-semibold">AI Study Plans</div>
                <div className="text-sm text-muted-foreground">Personalized for you</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
