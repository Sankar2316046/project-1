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
    question_count_per_topic: values.question_count_per_topic*3,
  };

  const expectedQuestions = selectedTopics.length * values.question_count_per_topic;
  console.log('Expected questions:', expectedQuestions);

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.body) throw new Error('No stream');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let questions: Question[] = [];
    let seen = new Set<string>();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';  // Keep incomplete line

      for (const line of lines) {
        if (line.trim()) {
          try {
            const obj = JSON.parse(line);
            if (obj.done) {
              console.log('Stream done');
              break;
            } else {
              if (obj.question && !seen.has(obj.question)) {
                seen.add(obj.question);
                questions.push(obj as Question);
                console.log('Questions so far:', questions.length);
                
              }
            }
          } catch (e) {
            console.warn('Parse error:', line);
          }
        }
      }
      console.log(questions);
    }
    
    // Insert into database
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

    const { data: testData, error: testError } = await supabase
      .from('test')
      .insert({
        user_id: user.id,
        domain: domainName,
        difficulty: values.difficulty,
        questions_per_student: values.question_count_per_topic,
        status: 'created'
      })
      .select('id')
      .single();

    if (testError) {
      console.error('Test insert error:', testError);
      toast({
        title: "Error",
        description: "Failed to create test.",
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }

    const testId = testData.id;

    const questionInserts = questions.map(q => ({
      test_id: testId,
      question: q.question,
      options: q.options,
      correct_answer: q.correct_answer,
      topic: q.topic,
      difficulty: q.difficulty
    }));

    const { error: poolError } = await supabase
      .from('question_pool')
      .insert(questionInserts);

    if (poolError) {
      console.error('Question pool insert error:', poolError);
      toast({
        title: "Error",
        description: "Failed to save questions.",
        variant: "destructive",
      });
      setLoading(false);
      return null;
    }

    setLoading(false);
    return testId;
  } catch (err) {
    setLoading(false);
   
    
    return null;
  }
};

  return { submitForm, loading };
}
