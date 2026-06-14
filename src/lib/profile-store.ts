import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Filial } from "./filiais";

export function useProfile() {
  const query = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<{ filial: Filial } | null> => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("filial")
        .eq("user_id", userData.user.id)
        .maybeSingle();
      if (error) throw error;
      return data ? { filial: data.filial } : null;
    },
  });

  return {
    profile: query.data ?? null,
    filial: query.data?.filial ?? null,
    ready: !query.isLoading,
  };
}
