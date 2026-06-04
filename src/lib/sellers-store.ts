import { useEffect, useState, useCallback } from "react";

export type SellerStatus = "ativo" | "aviso" | "inativo";

export interface Equipment {
  id: string;
  name: string;
  serial?: string;
}

export interface Seller {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  status: SellerStatus;
  notes?: string;
  equipments: Equipment[];
  createdAt: number;
}

const KEY = "gestor-vendedores-v1";

function load(): Seller[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return seed();
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function seed(): Seller[] {
  const data: Seller[] = [
    {
      id: crypto.randomUUID(),
      name: "Carlos Silva",
      phone: "(11) 98888-1111",
      email: "carlos@empresa.com",
      status: "ativo",
      notes: "Top performer região sul.",
      equipments: [
        { id: crypto.randomUUID(), name: "Maquininha SumUp", serial: "SU-1023" },
        { id: crypto.randomUUID(), name: "Tablet Samsung", serial: "TB-552" },
      ],
      createdAt: Date.now() - 86400000 * 30,
    },
    {
      id: crypto.randomUUID(),
      name: "Mariana Costa",
      phone: "(21) 97777-2222",
      email: "mariana@empresa.com",
      status: "aviso",
      notes: "Atraso em prestação de contas.",
      equipments: [{ id: crypto.randomUUID(), name: "Maquininha Stone", serial: "ST-887" }],
      createdAt: Date.now() - 86400000 * 12,
    },
    {
      id: crypto.randomUUID(),
      name: "João Pereira",
      phone: "(31) 96666-3333",
      status: "inativo",
      notes: "Desligado em 03/2026.",
      equipments: [],
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

  const addSeller = (s: Omit<Seller, "id" | "createdAt" | "equipments"> & { equipments?: Equipment[] }) => {
    const seller: Seller = {
      ...s,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      equipments: s.equipments ?? [],
    };
    persist([seller, ...sellers]);
  };

  const updateSeller = (id: string, patch: Partial<Seller>) => {
    persist(sellers.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const removeSeller = (id: string) => persist(sellers.filter((s) => s.id !== id));

  const addEquipment = (sellerId: string, eq: Omit<Equipment, "id">) => {
    persist(
      sellers.map((s) =>
        s.id === sellerId
          ? { ...s, equipments: [...s.equipments, { ...eq, id: crypto.randomUUID() }] }
          : s,
      ),
    );
  };

  const removeEquipment = (sellerId: string, eqId: string) => {
    persist(
      sellers.map((s) =>
        s.id === sellerId ? { ...s, equipments: s.equipments.filter((e) => e.id !== eqId) } : s,
      ),
    );
  };

  return { sellers, ready, addSeller, updateSeller, removeSeller, addEquipment, removeEquipment };
}

export const statusLabel: Record<SellerStatus, string> = {
  ativo: "Ativo",
  aviso: "Aviso",
  inativo: "Inativo",
};
