import { Badge } from "@/components/ui/badge";
import { FormLabel } from "@/components/ui/form";

interface TopicSelectorProps {
  domainId: string;
  topics: any[];
  selectedTopics: string[];
  toggleTopic: (id: string) => void;
}

export function TopicSelector({ domainId, topics, selectedTopics, toggleTopic }: TopicSelectorProps) {
  if (!domainId) return null;

  return (
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
  );
}
