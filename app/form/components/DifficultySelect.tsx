import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";

export function DifficultySelect({ control }: { control: Control<any> }) {
  return (
    <FormField
      control={control}
      name="difficulty"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel className="text-zinc-300 text-sm">
            Difficulty Level
          </FormLabel>

          <FormControl>
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="bg-zinc-900 border-zinc-700">
                <SelectValue placeholder="Choose difficulty" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="easy">🟢 Easy</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="hard">🔴 Hard</SelectItem>
              </SelectContent>
            </Select>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
