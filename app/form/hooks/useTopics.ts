import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";


export function useTopics(domainId: string) {
  const [topics, setTopics] = useState<any[]>([]);
  

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
