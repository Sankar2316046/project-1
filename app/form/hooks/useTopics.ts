import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase";


export function useTopics(domainId: string) {
  const [topics, setTopics] = useState<any[]>([]);
  const supabase = createSupabaseClient();

  useEffect(() => {
    if (!domainId) {
      setTopics([]);
      return;
    }

    supabase
      .from("topics")
      .select("*")
      .eq("domain_id", domainId)
      .then(({ data }) => {
        if (data) setTopics(data);
      });
  }, [domainId]);

  return topics;
}
