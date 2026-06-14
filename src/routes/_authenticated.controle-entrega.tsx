import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSellers, type Seller } from "@/lib/sellers-store";
import { useProfile } from "@/lib/profile-store";
import { filialLabel } from "@/lib/filiais";


export const Route = createFileRoute("/_authenticated/controle-entrega")({
  head: () => ({
    meta: [
      { title: "Controle de Entrega" },
      {
        name: "description",
        content:
          "Termo de responsabilidade e uso de equipamento coletor de dados.",
      },
    ],
  }),
  component: ControleEntregaPage,
});

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function buildPrintHtml(active: Seller[], filialName: string) {
  const rows = active
    .map(
      (s) => `
        <tr>
          <td class="name">${escapeHtml(s.name.toUpperCase())}</td>
          <td>${escapeHtml(s.matricula)}</td>
          <td>${escapeHtml(s.equipmentSerial ?? "")}</td>
          <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
        </tr>`,
    )
    .join("");

  const header = `
    <tr>
      <th>NOME VENDEDOR</th>
      <th>MATRÍCULA</th>
      <th>Nº COLETOR</th>
      <th>HORA QUE PEGOU</th>
      <th>ASSINATURA</th>
      <th>HORA QUE DEVOLVEU</th>
      <th>TELA / COM DEFEITO</th>
      <th>DATA / ${new Date().getFullYear()}</th>
      <th>ASSINATURA</th>
      <th>FISCAL DE PREVENÇÃO</th>
    </tr>`;

  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Controle de Entrega</title>
<style>
  @page { size: A4 landscape; margin: 10mm; }
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;color:#000;margin:0;padding:8px;font-size:10px}
  h1{text-align:center;margin:0;font-size:14px;font-weight:bold}
  h2{text-align:center;margin:0 0 8px;font-size:12px;font-weight:bold}
  table{width:100%;border-collapse:collapse;table-layout:fixed}
  th,td{border:1px solid #000;padding:4px 3px;text-align:center;vertical-align:middle;word-wrap:break-word}
  th{background:#e8e8e8;font-size:9px;font-weight:bold}
  td.name{text-align:left;font-size:9px}
  tr{height:34px}
  .footer{margin-top:8px}
  .footer table tr{height:42px}
  .footer td{text-align:left;padding:6px;font-weight:bold}
</style></head><body>
  <h1>TERMO DE RESPONSABILIDADE E USO DE EQUIPAMENTO</h1>
  <h2>COLETOR DE DADOS ZEBRA TC 22${filialName ? ` — FILIAL ${escapeHtml(filialName)}` : ""}</h2>

  <table>
    <thead>${header}</thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    <table>
      <tr><td style="width:50%">Gerente:</td><td style="width:50%">Observação:</td></tr>
      <tr><td>Líder de Prevenção:</td><td></td></tr>
    </table>
  </div>
  <script>window.onload=()=>{window.focus();window.print();}</script>
</body></html>`;
}

function ControleEntregaPage() {
  const navigate = useNavigate();
  const { sellers, ready } = useSellers();
  const { filial } = useProfile();
  const filialName = filial ? filialLabel[filial] : "";

  const active = useMemo(
    () =>
      sellers
        .filter((s) => s.status === "ativo")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [sellers],
  );

  function handlePrint() {
    const w = window.open("", "_blank", "width=1100,height=800");
    if (!w) return;
    w.document.open();
    w.document.write(buildPrintHtml(active, filialName));
    w.document.close();
  }


  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/" })}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Controle de Entrega</h1>
              <p className="text-sm text-muted-foreground">
                Termo de uso diário do coletor — apenas vendedores ativos
                {filialName && <> · Filial <strong>{filialName}</strong></>}
              </p>
            </div>

          </div>
          <Button onClick={handlePrint} disabled={!ready || active.length === 0}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
        </header>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-3 text-left font-semibold">Nome Vendedor</th>
                    <th className="p-3 text-left font-semibold">Matrícula</th>
                    <th className="p-3 text-left font-semibold">Nº Coletor</th>
                  </tr>
                </thead>
                <tbody>
                  {active.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-3">{s.name}</td>
                      <td className="p-3">{s.matricula}</td>
                      <td className="p-3 font-mono text-xs">
                        {s.equipmentSerial ?? "—"}
                      </td>
                    </tr>
                  ))}
                  {ready && active.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-muted-foreground">
                        Nenhum vendedor ativo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="mt-4 text-xs text-muted-foreground">
          {active.length} vendedor(es) ativo(s). A lista é atualizada automaticamente conforme o status dos vendedores.
        </p>
      </main>
    </div>
  );
}
