"use client"
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
  const [results, setResults] = useState<{ correct: number; total: number; topicScores: Record<string, { correct: number; total: number }> } | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('id, question_text, options, topic')
        .eq('test_id', testId);
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load questions.",
          variant: "destructive",
        });
      } else {
        setQuestions(data || []);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, [testId, supabase, toast]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "Please log in to submit answers.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Insert answers
    const answersToInsert = questions.map((q) => ({
      test_id: testId,
      question_id: q.id,
      user_answer: answers[q.id] || '',
    }));

    const { error: insertError } = await supabase
      .from('user_answers')
      .insert(answersToInsert);

    if (insertError) {
      toast({
        title: "Error",
        description: "Failed to submit answers.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Evaluate answers
    const { data: questionsWithCorrect, error: fetchError } = await supabase
      .from('questions')
      .select('id, correct_answer')
      .eq('test_id', testId);

    if (fetchError) {
      toast({
        title: "Error",
        description: "Failed to evaluate answers.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const correctMap = questionsWithCorrect?.reduce((acc, q) => {
      acc[q.id] = q.correct_answer;
      return acc;
    }, {} as Record<string, string>) || {};

    const updates = questions.map(async (q) => {
      const isCorrect = answers[q.id] === correctMap[q.id];
      return supabase
        .from('user_answers')
        .update({ is_correct: isCorrect })
        .eq('test_id', testId)
        .eq('question_id', q.id);
    });

    const updatePromises = updates;
    const updateResults = await Promise.all(updatePromises);

    const updateError = updateResults.find(result => result.error)?.error;

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to update answers.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Update test status
    const { error: statusError } = await supabase
      .from('test')
      .update({ status: 'completed' })
      .eq('id', testId);

    if (statusError) {
      toast({
        title: "Error",
        description: "Failed to complete test.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    // Calculate results
    const correctCount = questions.filter((q) => answers[q.id] === correctMap[q.id]).length;

    const topicScores: Record<string, { correct: number, total: number }> = {};
    questions.forEach((q) => {
      if (!topicScores[q.topic]) {
        topicScores[q.topic] = { correct: 0, total: 0 };
      }
      topicScores[q.topic].total++;
      if (answers[q.id] === correctMap[q.id]) {
        topicScores[q.topic].correct++;
      }
    });

    setResults({ correct: correctCount, total: questions.length, topicScores });

    toast({
      title: "Test Completed!",
      description: `You got ${correctCount} out of ${questions.length} correct.`,
    });

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (results) {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h2 className="text-2xl font-semibold">Test Results</h2>
        <p>You answered {results.correct} out of {results.total} questions correctly.</p>
        <p>Score: {((results.correct / results.total) * 100).toFixed(2)}%</p>
        <h3>Topic-wise Scores:</h3>
        {Object.entries(results.topicScores).map(([topic, score]) => (
          <p key={topic}>{topic}: {score.correct}/{score.total} ({((score.correct / score.total) * 100).toFixed(2)}%)</p>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Take Test</h2>
      {questions.map((q, index) => (
        <div key={q.id} className="space-y-4">
          <p className="font-medium">{index + 1}. {q.question_text}</p>
          <RadioGroup
            value={answers[q.id] || ""}
            onValueChange={(value: string) => handleAnswerChange(q.id, value)}
          >
            {q.options.map((option, i) => (
              <div key={i} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${q.id}-${i}`} />
                <Label htmlFor={`${q.id}-${i}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      ))}
      <Button onClick={handleSubmit} disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
          </>
        ) : (
          "Submit Test"
        )}
      </Button>
    </div>
  );
}
