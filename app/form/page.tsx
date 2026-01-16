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
  domain_id: z.string().min(1, "Select a domain"),
  difficulty: z.string().min(1, "Select difficulty"),
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

  // fetch domain list
  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => {
      if (data) setDomains(data);
    });
  }, []);

  // fetch topics on domain change
  useEffect(() => {
    const dom = form.watch("domain_id");
    if (!dom) return;

    supabase
      .from("topics")
      .select("*")
      .eq("domain_id", dom)
      .then(({ data }) => {
        if (data) setTopics(data);
        setSelectedTopics([]); // reset topics on domain change
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

    const payload = {
      domain_id: values.domain_id,
      topic_ids: selectedTopics,
      difficulty: values.difficulty,
      question_count_per_topic: values.question_count_per_topic,
    };

    setLoading(true);

    const { error } = await supabase
      .from("test_configs")
      .insert(payload)
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to store config!",
        variant: "destructive",
      });
      console.error(error);
      return;
    }

    console.log("Payload:", payload);

    toast({
      title: "Submitted Successfully 🎉",
      description: "Test configuration saved!",
    });

    // reset form
    form.reset();
    setTopics([]);
    setSelectedTopics([]);
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

          {/* TOPICS BADGE UI */}
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

          {/* QUESTIONS PER TOPIC */}
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

          {/* SUBMIT BUTTON */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" /> Submitting...
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
