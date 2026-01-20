import { Badge } from "@/components/ui/badge";
import { FormLabel } from "@/components/ui/form";

export function TopicSelector({
  domainId,
  topics,
  selectedTopics,
  toggleTopic,
}: {
  domainId: string;
  topics: any[];
  selectedTopics: string[];
  toggleTopic: (id: string) => void;
}) {
  if (!domainId) return null;

  return (
    <div className="space-y-3">
      <FormLabel className="text-zinc-300 text-sm">
        Select Topics
      </FormLabel>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {topics.map((t) => {
          const active = selectedTopics.includes(t.id);

          return (
            <div
              key={t.id}
              onClick={() => toggleTopic(t.id)}
              className={`
                cursor-pointer rounded-xl border p-4 text-center
                transition-all duration-200
                ${
                  active
                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent shadow-lg scale-[1.02]"
                    : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-indigo-500"
                }
              `}
            >
              <p className="font-medium">{t.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
