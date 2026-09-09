import type { Filial } from "./filiais";

export type FilialEmpresa = {
  cnpj: string;
  endereco: string;
  cep: string;
  cidade: string;
};

export const FILIAL_EMPRESA: Record<Filial, FilialEmpresa> = {
  VALPARAISO: {
    cnpj: "17.359.233/0026-36",
    endereco: "Rua 03, S/N, Quadra 01, Chácara Saia Velha",
    cep: "72876-715",
    cidade: "Valparaíso de Goiás / GO",
  },
  GOIANIA: {
    cnpj: "17.359.233/0033-65",
    endereco: "Eurico Viana, 4605 - Ch Guarema",
    cep: "74573-418",
    cidade: "Goiânia / GO",
  },
  MARINGA: {
    cnpj: "17.359.233/0025-55",
    endereco: "Colombo, 9322 - Lote 001B - Gleba Patrimônio Maringá",
    cep: "87070-000",
    cidade: "Maringá / PR",
  },
  SAO_LUIS: {
    cnpj: "17.359.233/0024-74",
    endereco: "Av. Guajajaras, 41 - Tirirical",
    cep: "65046-660",
    cidade: "São Luís / MA",
  },
  RECIFE: {
    cnpj: "17.359.233/0029-89",
    endereco: "Da Recuperação, 4889 - Guabiraba",
    cep: "52490-570",
    cidade: "Recife / PE",
  },
  FORTALEZA: {
    cnpj: "17.359.233/0032-84",
    endereco: "Av. Washington Soares, 10226 - Coaçu",
    cep: "60843-278",
    cidade: "Fortaleza / CE",
  },
  ARACAJU: {
    cnpj: "17.359.233/0029-89",
    endereco: "Avenida Pres. Tancredo Neves, 8110 - Novo Paraíso",
    cep: "",
    cidade: "Aracaju / SE",
  },
};
