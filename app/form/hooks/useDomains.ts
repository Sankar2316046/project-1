import { useEffect, useState } from "react";
import { createSupabaseClient } from "@lib/supabase";

export function useDomains() {
  const [domains, setDomains] = useState<any[]>([]);
const supabase = createSupabaseClient();
  useEffect(() => {
    
    supabase.from("domains").select("*").then(({ data }) => {
      if (data) setDomains(data);
    });
  }, []);

  return domains;
}

