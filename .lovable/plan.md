# Relatório de Vendedores em PDF com filtro

## O que será feito

Ao clicar em **Imprimir** no `_authenticated.index.tsx`, abrir um modal "Imprimir Relatório" com checkboxes:
- Ativos (N)
- Em Aviso (N)
- Inativos (N)

Mostrando "X vendedor(es) serão incluídos no relatório" e botões Cancelar / Imprimir.

Ao clicar Imprimir, abrir uma janela com layout idêntico ao PDF modelo (cabeçalho "Relatório de Vendedores", "Gerado em DD/MM/AAAA às HH:MM:SS", tabela com colunas: Nome, Matrícula, CPF, Função/Setor, Nº Série, Status) e disparar `window.print()` para o usuário salvar como PDF.

## Detalhes técnicos

- Novo `Dialog` no `_authenticated.index.tsx` controlado por estado `printOpen`.
- Estado com 3 booleanos (ativo/aviso/inativo) — todos marcados por padrão.
- Contagem dinâmica a partir de `sellers`.
- Geração do relatório: abrir `window.open()` com HTML inline (tabela + estilos de impressão) e chamar `print()` — isso evita imprimir a UI atual e funciona como "Salvar como PDF" no diálogo do navegador.
- O botão "Imprimir" existente passa a abrir o modal em vez de `window.print()` direto.

Sem mudanças de schema/backend.