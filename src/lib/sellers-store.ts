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
  contractPath?: string;
  createdAt: number;
}

type Row = Database["public"]["Tables"]["sellers"]["Row"];

export const CONTRACT_BUCKET = "contratos";
export const CONTRACT_MAX_BYTES = 10 * 1024 * 1024;
export const CONTRACT_TYPES = ["image/jpeg", "image/png", "image/webp"];

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
    contractPath: r.contract_path ?? undefined,
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

export function validateContractFile(file: File): string | null {
  if (!CONTRACT_TYPES.includes(file.type)) return "Envie uma imagem JPG, PNG ou WEBP.";
  if (file.size > CONTRACT_MAX_BYTES) return "A imagem deve ter no máximo 10 MB.";
  return null;
}

export async function getContractUrl(path: string): Promise<string | null> {
  const { data, error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (error) return null;
  return data?.signedUrl ?? null;
}

async function uploadContract(sellerId: string, file: File): Promise<string> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Você precisa estar logado.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${userData.user.id}/${sellerId}.${ext}`;
  const { error } = await supabase.storage
    .from(CONTRACT_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return path;
}

async function deleteContract(path: string) {
  await supabase.storage.from(CONTRACT_BUCKET).remove([path]);
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
    mutationFn: async ({
      seller: s,
      contractFile,
    }: {
      seller: Omit<Seller, "id" | "createdAt">;
      contractFile?: File | null;
    }) => {
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData.user) throw new Error("Você precisa estar logado.");
      const { data, error } = await supabase
        .from("sellers")
        .insert({ ...toRow(s), user_id: userData.user.id } as Database["public"]["Tables"]["sellers"]["Insert"])
        .select("id")
        .single();
      if (error) throw error;
      if (contractFile && data) {
        const path = await uploadContract(data.id, contractFile);
        const { error: upErr } = await supabase
          .from("sellers")
          .update({ contract_path: path })
          .eq("id", data.id);
        if (upErr) throw upErr;
      }
    },
    onSuccess: () => {
      toast.success("Vendedor cadastrado.");
      invalidate();
    },
    onError: (e) => toast.error(friendlyError(e, "Erro ao cadastrar.")),
  });

  const updateMut = useMutation({
    mutationFn: async ({
      id,
      patch,
      contractFile,
      removeContract,
      currentContractPath,
    }: {
      id: string;
      patch: Partial<Seller>;
      contractFile?: File | null;
      removeContract?: boolean;
      currentContractPath?: string;
    }) => {
      const row = toRow(patch);
      if (contractFile) {
        row.contract_path = await uploadContract(id, contractFile);
        if (currentContractPath && currentContractPath !== row.contract_path) {
          await deleteContract(currentContractPath);
        }
      } else if (removeContract) {
        row.contract_path = null;
        if (currentContractPath) await deleteContract(currentContractPath);
      }
      const { error } = await supabase.from("sellers").update(row).eq("id", id);
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
    (s: Omit<Seller, "id" | "createdAt">, contractFile?: File | null) =>
      addMut.mutate({ seller: s, contractFile }),
    [addMut],
  );
  const updateSeller = useCallback(
    (
      id: string,
      patch: Partial<Seller>,
      opts?: { contractFile?: File | null; removeContract?: boolean; currentContractPath?: string },
    ) => updateMut.mutate({ id, patch, ...opts }),
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
