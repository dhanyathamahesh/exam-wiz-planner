import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ArrowRight } from "lucide-react";

const grades = [
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const examTypes = [
  { value: "school", label: "School Exams" },
  { value: "competitive", label: "Competitive Exams" },
];

const competitiveExams = [
  "JEE Main",
  "JEE Advanced",
  "NEET",
  "SAT",
  "ACT",
  "GATE",
  "CAT",
  "GRE",
];

export const ExamSelector = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [selectedExam, setSelectedExam] = useState("");

  const handleGetStarted = () => {
    if (selectedGrade && (selectedExamType === "school" || selectedExam)) {
      // Navigate to resources - this would be implemented with routing
      console.log("Navigation:", { selectedGrade, selectedExamType, selectedExam });
    }
  };

  const isFormComplete = selectedGrade && (selectedExamType === "school" || selectedExam);

  return (
    <section id="resources" className="py-24">
      <div className="container">
        <div className="max-w-2xl mx-auto">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Select Your Learning Path</CardTitle>
              <CardDescription className="text-base">
                Choose your grade and target exam to get personalized resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Grade</label>
                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your grade" />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((grade) => (
                      <SelectItem key={grade} value={grade}>
                        {grade}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Exam Type</label>
                <Select value={selectedExamType} onValueChange={setSelectedExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exam type" />
                  </SelectTrigger>
                  <SelectContent>
                    {examTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedExamType === "competitive" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Exam</label>
                  <Select value={selectedExam} onValueChange={setSelectedExam}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your target exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {competitiveExams.map((exam) => (
                        <SelectItem key={exam} value={exam}>
                          {exam}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                disabled={!isFormComplete}
                onClick={handleGetStarted}
              >
                Get Started
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
