"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

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

  // Reset selected topics when domain changes
  useEffect(() => {
    setSelectedTopics([]);
  }, [domainId]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const testId = await submitForm(values, domains, topics, selectedTopics);
    if (testId) {
      router.push(`/test/${testId}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Registration Form</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <DomainSelect control={form.control} domains={domains} />

          <TopicSelector
            domainId={domainId}
            topics={topics}
            selectedTopics={selectedTopics}
            toggleTopic={toggleTopic}
          />

          <DifficultySelect control={form.control} />

          <QuestionCountInput control={form.control} />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
