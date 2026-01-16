import { useState } from "react";
import { createClient } from "@lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Question } from "../types";

export function useFormSubmit() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  const submitForm = async (
    values: { domain_id: string; difficulty: string; question_count_per_topic: number },
    domains: any[],
    topics: any[],
    selectedTopics: string[]
  ): Promise<string | null> => {
    if (selectedTopics.length === 0) {
      toast({
        title: "Select Topics",
        description: "Please choose at least one topic.",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);

    // convert id values to actual names
    const domainName = domains.find((d) => d.id === values.domain_id)?.name || "";
    const topicNames = selectedTopics
      .map((id) => topics.find((t) => t.id === id)?.name)
      .filter(Boolean);

    const payload = {
      domain: domainName,
      topics: topicNames,
      difficulty: values.difficulty,
      question_count_per_topic: values.question_count_per_topic,
    };

    console.log("Submitted Payload:", payload);

    try {
      const response = await fetch('http://localhost:5000/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const jsonStart = data.output.indexOf('{');
      const jsonEnd = data.output.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = data.output.substring(jsonStart, jsonEnd + 1);
        try {
          const parsedOutput = JSON.parse(jsonString);
          if (parsedOutput.questions) {
            const questions = parsedOutput.questions;
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
              toast({
                title: "Authentication Error",
                description: "Please log in to create a test.",
                variant: "destructive",
              });
              setLoading(false);
              return null;
            }
            const total_questions = questions.length;
            const { data: testData, error: testError } = await supabase
              .from('test')
              .insert({
                user_id: user.id,
                domain: domainName,
                difficulty: values.difficulty,
                total_questions,
                status: 'created',
              })
              .select()
              .single();
            if (testError) {
              toast({
                title: "Failed to create test",
                description: testError.message,
                variant: "destructive",
              });
              setLoading(false);
              return null;
            }
            const test_id = testData.id;
            const questionsToInsert = questions.map((q: Question) => ({
              test_id,
              question_text: q.question,
              options: q.options,
              correct_answer: q.correct_answer,
              topic: q.topic,
              difficulty: q.difficulty,
            }));
            const { error: questionsError } = await supabase
              .from('questions')
              .insert(questionsToInsert);
            if (questionsError) {
              toast({
                title: "Failed to insert questions",
                description: questionsError.message,
                variant: "destructive",
              });
              setLoading(false);
              return null;
            }
            toast({
              title: "Test Created Successfully!",
              description: "Your exam questions have been saved.",
            });
            setLoading(false);
            return test_id;
          } else {
            toast({
              title: "AI Error",
              description: `Error from AI: ${JSON.stringify(parsedOutput)}`,
              variant: "destructive",
            });
            setLoading(false);
            return null;
          }
        } catch (parseError) {
          toast({
            title: "Parsing Error",
            description: `Failed to parse JSON: ${jsonString}`,
            variant: "destructive",
          });
          setLoading(false);
          return null;
        }
      } else {
        toast({
          title: "Response Error",
          description: `No JSON found in response: ${data.output}`,
          variant: "destructive",
        });
        setLoading(false);
        return null;
      }
    } catch (err) {
      toast({
        title: "Connection Error",
        description: 'Error: Could not connect to Python server',
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }
  };

  return { submitForm, loading };
}
