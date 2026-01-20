import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Control } from "react-hook-form";

export function DomainSelect({ control, domains }: { control: Control<any>; domains: any[] }) {
  return (
    <FormField
      control={control}
      name="domain_id"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel className="text-zinc-300 text-sm">
            Select Domain
          </FormLabel>

          <FormControl>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {domains.map((d) => {
                const active = field.value === d.id;

                return (
                  <Badge
                    key={d.id}
                    onClick={() => field.onChange(d.id)}
                    className={`
                      cursor-pointer px-5 py-2 text-sm rounded-xl
                      transition-all duration-200
                      ${
                        active
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105"
                          : "border border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                      }
                    `}
                  >
                    {d.name}
                  </Badge>
                );
              })}
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
