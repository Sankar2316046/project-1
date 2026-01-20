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

    if (!auto) {
      toast({
        title: "Test Submitted",
        description: `Score: ${score}%`,
      });
    }

    setResultView({ score, topicStats });
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-indigo-950 flex items-center justify-center p-6">
        <Card className="max-w-xl w-full bg-zinc-950 border-zinc-800">
          <CardHeader className="text-center space-y-2">
            <CheckCircle className="mx-auto h-10 w-10 text-green-500" />
            <h2 className="text-2xl font-semibold text-white">
              Test Completed
            </h2>
            <p className="text-zinc-400">
              Score: {resultView.score}%
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {Object.entries(resultView.topicStats).map(
              ([topic, t]: any) => (
                <div key={topic}>
                  <div className="flex justify-between text-sm text-zinc-300">
                    <span>{topic}</span>
                    <span>
                      {t.correct}/{t.total}
                    </span>
                  </div>
                  <Progress value={(t.correct / t.total) * 100} />
                </div>
              )
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
