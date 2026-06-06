# Migrar sellers para Supabase

A tabela `sellers` já existe com RLS por `auth.uid() = user_id`. Para gravar/ler no banco é obrigatório ter um usuário autenticado — hoje o app não tem login. Plano em duas frentes:

## 1. Autenticação (pré-requisito)

- Criar `src/routes/auth.tsx` — página pública com login e cadastro por e-mail/senha (Supabase `signInWithPassword` / `signUp` com `emailRedirectTo: window.location.origin`).
- Criar `src/routes/_authenticated/route.tsx` (layout gerenciado, `ssr: false`, redireciona para `/auth` se não houver sessão).
- Mover `src/routes/index.tsx` → `src/routes/_authenticated/index.tsx` para proteger a tela de vendedores.
- No `__root.tsx`: registrar `supabase.auth.onAuthStateChange` para invalidar o router em SIGNED_IN/SIGNED_OUT e adicionar botão "Sair" no header da tela de vendedores.
- Recomendar desativar "Confirm email" no painel do Supabase durante o desenvolvimento para login imediato.

## 2. Migração do store

Reescrever `src/lib/sellers-store.ts` para usar Supabase via TanStack Query (sem localStorage, sem seed):

- `useSellers()` retorna `{ sellers, ready, addSeller, updateSeller, removeSeller }` — mesma API que `index.tsx` já consome (nenhuma mudança no componente).
- `useQuery(['sellers'], …)` faz `supabase.from('sellers').select('*').order('created_at', { ascending: false })`.
- Mapear colunas snake_case do banco ↔ camelCase do tipo `Seller` (`equipment_serial` ↔ `equipmentSerial`, `admission_date` ↔ `admissionDate`, `exit_date` ↔ `exitDate`, `created_at` ↔ `createdAt`).
- Mutations (`insert`, `update`, `delete`) preenchem `user_id` com `(await supabase.auth.getUser()).data.user.id` e invalidam a query no sucesso.
- Tratar erros com `toast` (sonner já instalado) — exibir mensagem amigável em violações de unicidade (cpf/matrícula/serial duplicados por usuário).

## Detalhes técnicos

- Cliente: `import { supabase } from "@/integrations/supabase/client"` (browser, respeita RLS).
- Não usar `createServerFn` aqui — leitura/escrita client-side com RLS é suficiente e mais simples.
- Os dados antigos do localStorage ficam ignorados (sem migração automática); a tabela começa vazia por usuário.

## Aviso

Como a tela passa a exigir login, na primeira vez você precisará criar uma conta em `/auth` e re-cadastrar os vendedores (ou eu posso adicionar um botão "Importar do localStorage" se quiser preservar o que já está salvo no navegador).
