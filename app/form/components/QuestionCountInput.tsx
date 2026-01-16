import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface QuestionCountInputProps {
  control: Control<any>;
}

export function QuestionCountInput({ control }: QuestionCountInputProps) {
  return (
    <FormField
      control={control}
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
          <FormItem />
        </FormItem>
      )}
    />
  );
}
