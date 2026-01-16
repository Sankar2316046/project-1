"use client";

import { useEffect, useState } from "react";
import { createClient } from "@lib/supabase";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  domain_id: z.string().min(1),
  difficulty: z.string().min(1),
  question_count_per_topic: z.number().min(1),
});

export default function FormPage() {
  const supabase = createClient();
  const { toast } = useToast();

  const [domains, setDomains] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      domain_id: "",
      difficulty: "",
      question_count_per_topic: 10,
    },
  });

  // fetch domains
  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => {
      if (data) setDomains(data);
    });
  }, []);

  // fetch topics based on domain
  useEffect(() => {
    const domainId = form.watch("domain_id");
    if (!domainId) return;

    supabase
      .from("topics")
      .select("*")
      .eq("domain_id", domainId)
      .then(({ data }) => {
        if (data) setTopics(data);
        setSelectedTopics([]);
      });
  }, [form.watch("domain_id")]);

  const toggleTopic = (id: string) => {
    setSelectedTopics((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (selectedTopics.length === 0) {
      toast({
        title: "Select Topics",
        description: "Please choose at least one topic.",
        variant: "destructive",
      });
      return;
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

    toast({
      title: "Successfully Submitted!",
      description: "Your configuration has been processed.",
    });

    // reset form
    form.reset();
    setTopics([]);
    setSelectedTopics([]);
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <h2 className="text-2xl font-semibold">Registration Form</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* DOMAIN */}
          <FormField
            control={form.control}
            name="domain_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Domain</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* TOPICS */}
          {form.watch("domain_id") && (
            <div className="space-y-2">
              <FormLabel>Select Topics</FormLabel>
              <div className="flex flex-wrap gap-2">
                {topics.map((t) => (
                  <Badge
                    key={t.id}
                    variant={selectedTopics.includes(t.id) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTopic(t.id)}
                  >
                    {t.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* DIFFICULTY */}
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Difficulty</FormLabel>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* QUESTIONS */}
          <FormField
            control={form.control}
            name="question_count_per_topic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question Count Per Topic</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
              </FormItem>
            )}
          />

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
