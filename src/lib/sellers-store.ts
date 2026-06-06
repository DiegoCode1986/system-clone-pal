import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type SellerStatus = Database["public"]["Enums"]["seller_status"];

export interface Seller {
  id: string;
  name: string;
  cpf: string;
  matricula: string;
  role: string;
  equipmentSerial?: string;
  status: SellerStatus;
  admissionDate?: string;
  exitDate?: string;
  notes?: string;
  createdAt: number;
}

type Row = Database["public"]["Tables"]["sellers"]["Row"];

function fromRow(r: Row): Seller {
  return {
    id: r.id,
    name: r.name,
    cpf: r.cpf,
    matricula: r.matricula,
    role: r.role,
    equipmentSerial: r.equipment_serial ?? undefined,
    status: r.status,
    admissionDate: r.admission_date ?? undefined,
    exitDate: r.exit_date ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: new Date(r.created_at).getTime(),
  };
}

function toRow(s: Partial<Omit<Seller, "id" | "createdAt">>): Database["public"]["Tables"]["sellers"]["Update"] {
  const row: Database["public"]["Tables"]["sellers"]["Update"] = {};
  if (s.name !== undefined) row.name = s.name;
  if (s.cpf !== undefined) row.cpf = s.cpf;
  if (s.matricula !== undefined) row.matricula = s.matricula;
  if (s.role !== undefined) row.role = s.role;
  if ("equipmentSerial" in s) row.equipment_serial = s.equipmentSerial ?? null;
  if (s.status !== undefined) row.status = s.status;
  if ("admissionDate" in s) row.admission_date = s.admissionDate || null;
  if ("exitDate" in s) row.exit_date = s.exitDate || null;
  if ("notes" in s) row.notes = s.notes ?? null;
  return row;
}

function friendlyError(err: unknown, fallback: string) {
  const msg = (err as { message?: string } | null)?.message ?? "";
  if (/duplicate key|unique/i.test(msg)) {
    if (/cpf/i.test(msg)) return "Já existe um vendedor com este CPF.";
    if (/matricula/i.test(msg)) return "Já existe um vendedor com esta matrícula.";
    if (/equipment/i.test(msg)) return "Este número de série já está em uso.";
    return "Registro duplicado.";
  }
  return msg || fallback;
}

export function useSellers() {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["sellers"],
    queryFn: async (): Promise<Seller[]> => {
      const { data, error } = await supabase
        .from("sellers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map(fromRow);
    },
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["sellers"] });

  const addMut = useMutation({
    mutationFn: async (s: Omit<Seller, "id" | "createdAt">) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error("Você precisa estar logado.");
      const { error } = await supabase
        .from("sellers")
        .insert({ ...toRow(s), user_id: userData.user.id } as Database["public"]["Tables"]["sellers"]["Insert"]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vendedor cadastrado.");
      invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Erro ao cadastrar.")),
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Seller> }) => {
      const { error } = await supabase.from("sellers").update(toRow(patch)).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vendedor atualizado.");
      invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Erro ao atualizar.")),
  });

  const removeMut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sellers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Vendedor excluído.");
      invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Erro ao excluir.")),
  });

  const addSeller = useCallback(
    (s: Omit<Seller, "id" | "createdAt">) => addMut.mutate(s),
    [addMut],
  );
  const updateSeller = useCallback(
    (id: string, patch: Partial<Seller>) => updateMut.mutate({ id, patch }),
    [updateMut],
  );
  const removeSeller = useCallback((id: string) => removeMut.mutate(id), [removeMut]);

  return {
    sellers: query.data ?? [],
    ready: !query.isLoading,
    addSeller,
    updateSeller,
    removeSeller,
  };
}

export const statusLabel: Record<SellerStatus, string> = {
  ativo: "Ativo",
  aviso: "Aviso",
  inativo: "Inativo",
};
