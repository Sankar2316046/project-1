import { useEffect, useState } from "react";
import { createClient } from "@lib/supabase";

export function useDomains() {
  const [domains, setDomains] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => {
      if (data) setDomains(data);
    });
  }, []);

  return domains;
}
