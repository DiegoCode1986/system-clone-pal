# Suporte a múltiplas filiais

## Filiais

MARINGÁ, VALPARAÍSO, RECIFE, FORTALEZA, GOIÂNIA, SÃO LUÍS, ARACAJU.

## Banco de dados

- Novo enum `filial` com as 7 opções.
- Nova tabela `profiles(user_id, filial)` — guarda a filial escolhida pelo usuário no cadastro.
- Coluna `filial` na tabela `sellers` (NOT NULL).
- Trigger `before insert` em `sellers`: se `filial` não vier preenchida, preenche automaticamente com a filial do `profiles` do usuário logado.
- Índice único `(filial, equipment_serial)` em vez do escopo atual — assim o mesmo serial pode existir em filiais diferentes, mas não duplicado dentro da mesma filial entre vendedores ativos. (Mantém a regra "serial em uso" só por filial.)
- RLS continua por `user_id`, sem mudança de policy.

## Tela de cadastro (`/auth`)

- Adicionar campo **Filial** (select) na aba **Cadastrar** — obrigatório.
- Após `signUp`, inserir linha em `profiles` com a filial escolhida.
- Login não muda (continua só matrícula + senha).

## Vendedores

- `useSellers()` passa a filtrar pela filial do usuário logado (via `profiles`) — cada login só enxerga seus próprios vendedores da sua filial.
- Form de cadastro de vendedor não pede filial (herda do perfil).

## Documentos impressos

- Cabeçalho do **Relatório de Vendedores**, **Histórico Mobile**, **Termo Mobile** e **Controle de Entrega** passa a exibir `Filial: <NOME>` ao lado da data.

## Detalhes técnicos

- Migration cria enum + tabela `profiles` + coluna `filial` em `sellers` + trigger de auto-preenchimento + drop do unique antigo de `equipment_serial` e criação do novo composto.
- Para vendedores existentes sem filial: preencher com `MARINGA` como default (o usuário pode editar depois).
- Hook novo `useProfile()` retorna a filial atual (cacheada via React Query) e é consumido pelas páginas de impressão.

Sem outras mudanças funcionais.
