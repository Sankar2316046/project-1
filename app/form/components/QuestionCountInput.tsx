import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function QuestionCountInput({ control }: { control: any }) {
  return (
    <FormField
      control={control}
      name="question_count_per_topic"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-zinc-300 text-sm">
            Questions per Topic
          </FormLabel>

          <FormControl>
            <Input
              type="number"
              min={1}
              {...field}
              onChange={(e) =>
                field.onChange(Number(e.target.value))
              }
              className="bg-slate-700 border-slate-600 focus:border-slate-500 text-slate-200"
            />
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
