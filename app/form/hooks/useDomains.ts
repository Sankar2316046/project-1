import { useEffect, useState } from "react";
import { supabase } from "@lib/supabase";

export function useDomains() {
  const [domains, setDomains] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("domains").select("*").then(({ data }) => {
      if (data) setDomains(data);
    });
  }, []);

  return domains;
}
