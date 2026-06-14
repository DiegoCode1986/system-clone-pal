import type { Database } from "@/integrations/supabase/types";

export type Filial = Database["public"]["Enums"]["filial"];

export const FILIAIS: Filial[] = [
  "MARINGA",
  "VALPARAISO",
  "RECIFE",
  "FORTALEZA",
  "GOIANIA",
  "SAO_LUIS",
  "ARACAJU",
];

export const filialLabel: Record<Filial, string> = {
  MARINGA: "MARINGÁ",
  VALPARAISO: "VALPARAÍSO",
  RECIFE: "RECIFE",
  FORTALEZA: "FORTALEZA",
  GOIANIA: "GOIÂNIA",
  SAO_LUIS: "SÃO LUÍS",
  ARACAJU: "ARACAJU",
};
