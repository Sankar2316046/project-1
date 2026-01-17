"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@lib/supabase";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  options: string[];
  topic: string;
  correct_answer?: string;
}

export default function TestPage() {
  const params = useParams();
  const testId = params.id as string;
  const supabase = createClient();
  const { toast } = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(0);
  const [resultView, setResultView] = useState<any>(null);



  const current = questions[index];

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from("questions")
        .select("id, question_text, options, topic, correct_answer")
        .eq("test_id", testId);

      if (error || !data) {
        toast({ title: "Error", description: "Failed to load questions.", variant: "destructive" });
      } else {
        setQuestions(data);
      }

      setLoading(false);
    };

    fetchQuestions();
  }, [testId, supabase, toast]);

  // TIMER EFFECT
 
  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (auto = false) => {
    setSubmitting(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Auth Error", description: "Please log in.", variant: "destructive" });
      setSubmitting(false);
      return;
    }

    // INSERT USER ANSWERS
    await supabase.from("user_answers").insert(
      questions.map((q) => ({
        test_id: testId,
        question_id: q.id,
        user_answer: answers[q.id] || "",
      }))
    );

    // FETCH CORRECT ANSWERS
    const { data: correctData } = await supabase
      .from("questions")
      .select("id, correct_answer, topic")
      .eq("test_id", testId);

    const correctMap: Record<string, string> = {};
    correctData?.forEach((q) => (correctMap[q.id] = q.correct_answer));

    let correctCount = 0;
    const topicStats: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const isCorrect = answers[q.id] === correctMap[q.id];
      if (isCorrect) correctCount++;

      if (!topicStats[q.topic]) topicStats[q.topic] = { correct: 0, total: 0 };
      topicStats[q.topic].total++;
      if (isCorrect) topicStats[q.topic].correct++;
    });

    const score = Number(((correctCount / questions.length) * 100).toFixed(2));

    const { data: testRow } = await supabase
      .from("test")
      .select("domain")
      .eq("id", testId)
      .single();

    const domain = testRow?.domain ?? "";

    const raw = {
      test_id: testId,
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
    };

    await supabase.from("test_results").insert({
      test_id: raw.test_id,
      domain,
      total_questions: raw.total_questions,
      correct_answers: raw.correct_answers,
      score_percentage: raw.score_percentage,
      topic_breakdown: raw.topic_breakdown,
    });

    const aiJSON = {
      domain,
      overall_score: raw.score_percentage,
      total_questions: raw.total_questions,
      topic_scores: raw.topic_breakdown,
    };

    console.log("=== RAW RESULT ===", raw);
    console.log("=== AI JSON FOR VARUN ===", aiJSON);

    if (!auto) {
      toast({ title: "Test Submitted!", description: `Score: ${score}%` });
    }

    setResultView({ raw, aiJSON });
    setSubmitting(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  if (resultView) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Test Results</h2>

        <p>You answered {resultView.raw.correct_answers} out of {resultView.raw.total_questions} questions correctly.</p>

        <p>Score: {resultView.raw.score_percentage.toFixed(2)}%</p>

        <h3 className="font-semibold">Topic-wise Scores:</h3>

        {Object.entries(resultView.raw.topic_breakdown).map(([topic, score]: any) => (
          <p key={topic}>{topic}: {score.correct}/{score.total} ({score.percentage.toFixed(2)}%)</p>
        ))}
      </div>
    );
  }


  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">

      <div className="flex justify-between items-center">
        <span className="text-gray-600">Question {index + 1}/{questions.length}</span>
      </div>

      <p className="font-medium">{current.question_text}</p>

      <RadioGroup value={answers[current.id] || ""} onValueChange={(v) => handleAnswerChange(current.id, v)}>
        {current.options.map((opt, i) => (
          <div key={i} className="flex items-center space-x-2">
            <RadioGroupItem id={`opt-${i}`} value={opt} />
            <Label htmlFor={`opt-${i}`}>{opt}</Label>
          </div>
        ))}
      </RadioGroup>

      <div className="flex justify-between">
        <Button onClick={() => setIndex(index - 1)} disabled={index === 0}>Prev</Button>
        {index < questions.length - 1 ?
          <Button onClick={() => setIndex(index + 1)}>Next</Button> :
          <Button onClick={() => handleSubmit()} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        }
      </div>
    </div>
  );
}
