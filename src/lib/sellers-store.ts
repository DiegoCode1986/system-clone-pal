import { useEffect, useState, useCallback } from "react";

export type SellerStatus = "ativo" | "aviso" | "inativo";

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

const KEY = "gestor-vendedores-v2";

function load(): Seller[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    const parsed = JSON.parse(raw) as Seller[];
    return parsed.map((s) => ({
      cpf: "",
      matricula: "",
      role: "Vendedor(a) Interno",
      ...s,
    })) as Seller[];
  } catch {
    return [];
  }
}

function seed(): Seller[] {
  const data: Seller[] = [
    {
      id: crypto.randomUUID(),
      name: "Lilia Maria De Souza Guimaraes",
      cpf: "123.456.789-00",
      matricula: "22161",
      role: "Vendedor(a) Interno",
      equipmentSerial: "25039524702301",
      status: "ativo",
      admissionDate: "2025-04-10",
      notes: "",
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: crypto.randomUUID(),
      name: "Johaby Pereira Dos Santos Menezes",
      cpf: "031.032.011-92",
      matricula: "22160",
      role: "Vendedor(a) Interno",
      equipmentSerial: "25039524702375",
      status: "ativo",
      admissionDate: "2025-05-01",
      notes: "mobile entregue dia 25/05/2026",
      createdAt: Date.now() - 86400000 * 20,
    },
    {
      id: crypto.randomUUID(),
      name: "Marilia Eduarda Duraes Da Silva",
      cpf: "222.333.444-55",
      matricula: "22162",
      role: "Vendedor(a) Interno",
      status: "aviso",
      notes: "Atraso em prestação de contas.",
      createdAt: Date.now() - 86400000 * 12,
    },
    {
      id: crypto.randomUUID(),
      name: "SIMONE TAVARES DE SOUZA",
      cpf: "555.666.777-88",
      matricula: "21622",
      role: "Vendedor(a) Interno",
      status: "inativo",
      exitDate: "2026-03-01",
      notes: "Desligada em 03/2026.",
      createdAt: Date.now() - 86400000 * 90,
    },
  ];
  localStorage.setItem(KEY, JSON.stringify(data));
  return data;
}

export function useSellers() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSellers(load());
    setReady(true);
  }, []);

  const persist = useCallback((next: Seller[]) => {
    setSellers(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }, []);

  const addSeller = (s: Omit<Seller, "id" | "createdAt">) => {
    const seller: Seller = { ...s, id: crypto.randomUUID(), createdAt: Date.now() };
    persist([seller, ...sellers]);
  };

  const updateSeller = (id: string, patch: Partial<Seller>) => {
    persist(sellers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSeller = (id: string) => persist(sellers.filter((s) => s.id !== id));

  return { sellers, ready, addSeller, updateSeller, removeSeller };
}

export const statusLabel: Record<SellerStatus, string> = {
  ativo: "Ativo",
  aviso: "Aviso",
  inativo: "Inativo",
};
