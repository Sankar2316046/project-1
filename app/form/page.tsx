"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Brain } from "lucide-react";

import { useDomains } from "./hooks/useDomains";
import { useTopics } from "./hooks/useTopics";
import { useFormSubmit } from "./hooks/useFormSubmit";
import { DomainSelect } from "./components/DomainSelect";
import { TopicSelector } from "./components/TopicSelector";
import { DifficultySelect } from "./components/DifficultySelect";
import { QuestionCountInput } from "./components/QuestionCountInput";

const formSchema = z.object({
  domain_id: z.string().min(1),
  difficulty: z.string().min(1),
  question_count_per_topic: z.number().min(1),
});

export default function FormPage() {
  const router = useRouter();
  const domains = useDomains();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const { submitForm, loading } = useFormSubmit();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain_id: "",
      difficulty: "",
      question_count_per_topic: 10,
    },
  });

  const domainId = form.watch("domain_id");
  const topics = useTopics(domainId);

  // Reset topics when domain changes
  useEffect(() => {
    setSelectedTopics([]);
  }, [domainId]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id)
        ? prev.filter((t) => t !== id)
        : [...prev, id]
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const testId = await submitForm(
      values,
      domains,
      topics,
      selectedTopics
    );

    if (testId) {
      router.push(`/`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-indigo-950 flex items-center justify-center px-4">
      <Card className="w-full max-w-3xl bg-zinc-950/80 backdrop-blur border border-zinc-800 shadow-2xl">
        <CardHeader className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-400">
            <Brain className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-wide">
              Skill Assessment
            </span>
          </div>

          <CardTitle className="text-2xl md:text-3xl font-semibold text-white">
            Student Skill Analyzer
          </CardTitle>

          <p className="text-zinc-400 text-sm max-w-xl">
            Configure a personalized assessment by selecting domain,
            topics, difficulty level, and number of questions.
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-8"
            >
              {/* Domain */}
              <DomainSelect
                control={form.control}
                domains={domains}
              />

              {/* Topics */}
              <TopicSelector
                domainId={domainId}
                topics={topics}
                selectedTopics={selectedTopics}
                toggleTopic={toggleTopic}
              />

              {/* Difficulty & Question Count */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DifficultySelect control={form.control} />
                <QuestionCountInput control={form.control} />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="
                  w-full h-12 text-base font-medium
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  transition-all shadow-lg shadow-indigo-600/30
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Generating Test...
                  </>
                ) : (
                  "Start Skill Assessment"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
