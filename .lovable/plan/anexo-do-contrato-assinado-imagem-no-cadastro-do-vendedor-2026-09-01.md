# Anexo do contrato assinado (imagem) no cadastro do vendedor

Adicionar, no formulário "Editar vendedor", logo abaixo do campo **Observações**, um campo para anexar a imagem do contrato assinado, guardado com segurança e disponível para consulta futura.

## Como vai funcionar

- Campo "Contrato assinado" com botão para enviar uma imagem (JPG, PNG ou WEBP, até 10 MB).
- Ao selecionar, a imagem é enviada e aparece uma miniatura com opções **Ver** (abre em nova aba) e **Remover**.
- Se o vendedor já tiver contrato anexado, a miniatura aparece ao abrir a edição.
- O anexo também fica disponível no cadastro de um novo vendedor (enviado após salvar).
- Cada usuário só enxerga e gerencia os contratos dos próprios vendedores.

## Detalhes técnicos

1. **Armazenamento**: criar bucket privado `contratos` (limite de 10 MB) com políticas em `storage.objects` restringindo leitura/escrita/exclusão ao dono, usando o caminho `<user_id>/<seller_id>.<ext>`.
2. **Banco**: migration adicionando `contract_path text` (nullable) em `public.sellers`.
3. **Store** (`src/lib/sellers-store.ts`): mapear `contract_path` → `contractPath` no `fromRow`/`toRow`; adicionar helpers `uploadContract(sellerId, file)` (upload + update da coluna), `removeContract(seller)` e `getContractUrl(path)` via URL assinada.
4. **UI** (`src/routes/_authenticated.index.tsx`): no `SellerForm`, abaixo de Observações, incluir input de arquivo com validação de tipo/tamanho, estado de envio, pré-visualização por URL assinada e ação de remover; toasts de sucesso/erro em português.
