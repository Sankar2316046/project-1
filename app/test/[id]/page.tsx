"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@lib/supabase";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

import { Loader2, Clock, CheckCircle } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  topic: string;
  correct_answer?: string;
}

const QUESTION_TIME = 10; // seconds

export default function TestPage() {
  const params = useParams();
  const testId = params.id as string;
  const supabase = createClient();
  const { toast } = useToast();
const autoNextLocked = useRef(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [resultView, setResultView] = useState<any>(null);

  const current = questions[index] ?? null;

  /* ================= FETCH QUESTIONS ================= */
  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_text, options, topic, correct_answer")
        .eq("test_id", testId);

      if (error || !data || data.length === 0) {
        toast({
          title: "Error",
          description: "No questions found for this test.",
          variant: "destructive",
        });
      } else {
        setQuestions(data);
      }

      setLoading(false);
    };

    fetchQuestions();
  }, [testId, supabase, toast]);

  /* ================= TIMER (FIXED & SAFE) ================= */
useEffect(() => {
  if (resultView) return;
  if (!questions.length) return;
  if (!current) return;

  autoNextLocked.current = false;
  setTimeLeft(QUESTION_TIME);

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);

        // 🔒 LOCK prevents double execution
        if (!autoNextLocked.current) {
          autoNextLocked.current = true;
          handleNext(true);
        }

        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [index, questions.length, resultView]);


  /* ================= ANSWER HANDLING ================= */
  const handleAnswerChange = (value: string) => {
    if (!current) return;

    setAnswers((prev) => ({
      ...prev,
      [current.id]: value,
    }));
  };

  /* ================= NEXT / AUTO NEXT ================= */
const handleNext = (auto = false) => {
  if (submitting || resultView) return;

  if (index === questions.length - 1) {
    handleSubmit(auto);
    return;
  }

  setIndex((prev) => prev + 1);
};


  /* ================= SUBMIT ================= */
  const handleSubmit = async (auto = false) => {
    setSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please login again.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    await supabase.from("user_answers").insert(
      questions.map((q) => ({
        test_id: testId,
        question_id: q.id,
        user_answer: answers[q.id] || "",
      }))
    );

    const { data: correctData } = await supabase
      .from("questions")
      .select("id, correct_answer, topic")
      .eq("test_id", testId);

    const correctMap: Record<string, string> = {};
    correctData?.forEach((q) => {
      if (q.correct_answer) correctMap[q.id] = q.correct_answer;
    });

    let correctCount = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === correctMap[q.id];
      if (isCorrect) correctCount++;

      if (!topicStats[q.topic]) {
        topicStats[q.topic] = { correct: 0, total: 0 };
      }

      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;
    });

    const score = Number(
      ((correctCount / questions.length) * 100).toFixed(2)
    );

    const { data: testRow } = await supabase
      .from("test")
      .select("domain")
      .eq("id", testId)
      .single();

    await supabase.from("test_results").insert({
      test_id: testId,
      domain: testRow?.domain ?? "",
      total_questions: questions.length,
      correct_answers: correctCount,
      score_percentage: score,
      topic_breakdown: Object.fromEntries(
        Object.entries(topicStats).map(([topic, t]) => [
          topic,
          {
            correct: t.correct,
            total: t.total,
            percentage: Number(((t.correct / t.total) * 100).toFixed(2)),
          },
        ])
      ),
    });

    const aiJSON = {
      domain: testRow?.domain ?? "",
      overall_score: score,
      total_questions: questions.length,
      topic_scores: Object.fromEntries(
        Object.entries(topicStats).map(([topic, t]) => [
          topic,
          {
            correct: t.correct,
            total: t.total,
            percentage: Number(((t.correct / t.total) * 100).toFixed(2)),
          },
        ])
      ),
    };

    console.log("=== AI JSON FOR VARUN ===", aiJSON);

    // Fetch AI analysis
    let aiAnalysis = null;
    try {
      const response = await fetch("http://localhost:5000/skill-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          total_questions: aiJSON.total_questions,
          topic_scores: aiJSON.topic_scores,
        }),
      });
      aiAnalysis = await response.json();
      console.log("=== AI ANALYSIS RESULT ===", aiAnalysis);
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
    }

    if (!auto) {
      toast({
        title: "Test Submitted",
        description: `Score: ${score}%`,
      });
    }

    setResultView({ score, topicStats, aiAnalysis });
    setSubmitting(false);
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  /* ================= RESULT VIEW ================= */
if (resultView) {
  const ai = resultView.aiAnalysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl bg-zinc-950 border-zinc-800 shadow-2xl">
        
        {/* ================= HEADER ================= */}
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">
                🎓 Assessment Report
              </h2>
              <p className="text-zinc-400 text-sm">
                Detailed skill evaluation & AI insights
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-zinc-400">Final Score</p>
              <p className="text-3xl font-bold text-indigo-400">
                {resultView.score}%
              </p>
            </div>
          </div>

          {ai?.overall_level && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Overall Level:</span>
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {ai.overall_level}
              </span>
            </div>
          )}
        </CardHeader>

        {/* ================= CONTENT ================= */}
        <CardContent className="space-y-8">

          {/* ================= TOPIC PERFORMANCE ================= */}
          <section className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Topic-wise Performance
            </h3>

            {Object.entries(resultView.topicStats).map(
              ([topic, t]: any) => (
                <div key={topic} className="space-y-1">
                  <div className="flex justify-between text-sm text-zinc-300">
                    <span>{topic}</span>
                    <span>{t.correct}/{t.total}</span>
                  </div>
                  <Progress value={(t.correct / t.total) * 100} />
                </div>
              )
            )}
          </section>

          {/* ================= AI ANALYSIS ================= */}
          {ai && (
            <section className="space-y-6">
              <h3 className="text-lg font-semibold text-white">
                AI Skill Analysis
              </h3>

              {/* Strengths */}
              {ai.strengths?.length > 0 && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                  <h4 className="text-green-400 font-medium mb-2">
                    ✅ Strengths
                  </h4>
                  <ul className="space-y-2">
                    {ai.strengths.map((s: any, i: number) => (
                      <li key={i} className="text-sm text-zinc-300">
                        <span className="font-medium text-white">
                          {s.topic}:
                        </span>{" "}
                        {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {ai.weaknesses?.length > 0 && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">
                    ⚠️ Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {ai.weaknesses.map((w: any, i: number) => (
                      <li key={i} className="text-sm text-zinc-300">
                        <span className="font-medium text-white">
                          {w.topic}:
                        </span>{" "}
                        {w.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {ai.recommendations?.length > 0 && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                  <h4 className="text-blue-400 font-medium mb-2">
                    📘 Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {ai.recommendations.map((r: any, i: number) => (
                      <li key={i} className="text-sm text-zinc-300">
                        <span className="font-medium text-white">
                          {r.topic}:
                        </span>{" "}
                        {r.suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Steps */}
              {ai.next_topics?.length > 0 && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                  <h4 className="text-purple-400 font-medium mb-2">
                    🚀 Next Steps
                  </h4>
                  <ul className="space-y-1">
                    {ai.next_topics.map((n: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-300">
                        • {n}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

  /* ================= SAFETY GUARD ================= */
  if (!current) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  /* ================= QUESTION VIEW ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 flex items-center justify-center px-4">
      <Card className="max-w-3xl w-full bg-zinc-950 border-zinc-800 shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex justify-between items-center text-sm text-zinc-400">
            <span>
              Question {index + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-2 text-indigo-400">
              <Clock className="h-4 w-4" />
              <span>{timeLeft}s</span>
            </div>
          </div>

          <Progress value={((index + 1) / questions.length) * 100} />

          <p className="text-lg font-medium text-white">
            {current.question_text}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup
            value={answers[current.id] || ""}
            onValueChange={handleAnswerChange}
            className="space-y-3"
          >
            {current.options.map((opt, i) => {
              const selected = answers[current.id] === opt;

              return (
                <div
                  key={i}
                  className={`
                    flex items-center space-x-3 rounded-lg border p-4 cursor-pointer
                    transition-all
                    ${
                      selected
                        ? "border-indigo-500 bg-indigo-500/10 shadow-md"
                        : "border-zinc-800 hover:border-indigo-400"
                    }
                  `}
                >
                  <RadioGroupItem value={opt} id={`opt-${i}`} />
                  <Label
                    htmlFor={`opt-${i}`}
                    className="text-zinc-200 cursor-pointer"
                  >
                    {opt}
                  </Label>
                </div>
              );
            })}
          </RadioGroup>

          <Button
            className="w-full bg-indigo-600 hover:bg-indigo-500"
            onClick={() => handleNext(false)}
            disabled={submitting}
          >
            {index === questions.length - 1
              ? "Submit Test"
              : "Next Question"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
