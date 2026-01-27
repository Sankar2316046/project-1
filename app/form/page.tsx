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
import { Loader2, Brain, ArrowLeft, Info } from "lucide-react";

import { useDomains } from "./hooks/useDomains";
import { useTopics } from "./hooks/useTopics";
import { useFormSubmit } from "./hooks/useFormSubmit";
import { DomainSelect } from "./components/DomainSelect";
import { TopicSelector } from "./components/TopicSelector";
import { DifficultySelect } from "./components/DifficultySelect";
import { QuestionCountInput } from "./components/QuestionCountInput";
import AppLoader from "@/app/components/Loading";

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

  if (domains.length === 0) {
    return <AppLoader text="Loading Form Data" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl md:text-3xl font-semibold text-white">
              Create New Test
            </CardTitle>
            <p className="text-slate-400 mt-2">Configure AI-generated assessment parameters</p>
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

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex gap-3">
                <Info className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-indigo-400 mb-1">AI Fairness Mode</p>
                  <p>The system will generate extra questions to ensure each student receives a unique test, preventing answer sharing and promoting academic integrity.</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="
                  w-full text-base font-medium
                  bg-gradient-to-r from-indigo-600 to-violet-600
                  hover:from-indigo-500 hover:to-violet-500
                  transition-all shadow-lg shadow-indigo-600/30
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  "Create Test"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
