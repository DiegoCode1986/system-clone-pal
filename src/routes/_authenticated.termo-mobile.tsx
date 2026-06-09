import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSellers } from "@/lib/sellers-store";

export const Route = createFileRoute("/_authenticated/termo-mobile")({
  head: () => ({
    meta: [{ title: "Termo Mobile - Autorização de Uso de Equipamento" }],
  }),
  component: TermoMobile,
});

function TermoMobile() {
  const navigate = useNavigate();
  const { sellers } = useSellers();
  const [sellerId, setSellerId] = useState<string>("");
  const [serial, setSerial] = useState<string>("");

  const seller = useMemo(
    () => sellers.find((s) => s.id === sellerId),
    [sellers, sellerId],
  );

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Controls (hidden when printing) */}
        <div className="print:hidden mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <div className="flex-1 grid gap-2">
              <Label>Selecionar Vendedor</Label>
              <Select value={sellerId} onValueChange={setSellerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um vendedor..." />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.matricula}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 grid gap-2">
              <Label>Número de Série</Label>
              <Input
                placeholder="Ex: ABC123456"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
              />
            </div>
            <Button onClick={() => window.print()} className="sm:w-auto">
              <Printer className="mr-2 h-4 w-4" /> Imprimir ou Salvar como PDF
            </Button>
          </div>
        </div>

        {/* Document */}
        <div className="rounded-lg border bg-white p-8 text-black shadow-sm print:border-0 print:shadow-none print:p-0">
          <div className="mb-6 flex justify-center">
            <div className="rounded bg-muted px-6 py-3 text-sm text-muted-foreground">
              Logo Indisponível
            </div>
          </div>

          <h1 className="mb-6 text-center text-xl font-bold">
            TERMO DE AUTORIZAÇÃO DE USO DE EQUIPAMENTO
          </h1>

          <p className="mb-6 text-sm leading-relaxed">
            A <strong>TECIDOS E ARMARINHOS MIGUEL BARTOLOMEU S/A</strong>,
            estabelecida na Rua 03, S/N, Quadra 01, Chácara Saia Velha,
            Valparaíso de Goiás, CEP: 72876-715, inscrita no CNPJ sob nº
            17.359.233/0026-36, doravante denominada <strong>"EMPRESA"</strong>
            , autoriza:
          </p>

          <div className="mb-6 grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2">
            <Field label="Nome do Usuário:" value={seller?.name} />
            <Field label="CPF:" value={seller?.cpf} />
            <Field label="Função/Setor:" value={seller?.role} />
            <Field label="Matrícula:" value={seller?.matricula} />
          </div>

          <p className="mb-6 text-sm leading-relaxed">
            ...doravante denominado <strong>"USUÁRIO"</strong>, a utilizar o
            seguinte equipamento e acessórios de propriedade da{" "}
            <strong>EMPRESA</strong>:
          </p>

          <div className="mb-6 rounded-lg border p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Equipamento:</p>
                <p className="font-semibold">Coletor Zebra modelo TC 22</p>
              </div>
              <Field label="Número de Série:" value={serial} />
            </div>
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">
                Acessórios Inclusos:
              </p>
              <ul className="space-y-1 text-sm">
                <li>☑ Cabo de força da fonte</li>
                <li>☑ Fonte de alimentação</li>
              </ul>
            </div>
          </div>

          <h2 className="mb-3 text-base font-bold">CONDIÇÕES DE USO</h2>
          <div className="mb-6 space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Finalidade:</strong> A utilização do equipamento deverá
              restringir-se exclusivamente às necessidades de execução das
              atividades laborais do USUÁRIO.
            </p>
            <p>
              <strong>Responsabilidade por Conservação:</strong> O USUÁRIO
              compromete-se a zelar pelo equipamento como se próprio fosse,
              mantendo-o em perfeito estado de funcionamento e conservação.
            </p>
            <p>
              <strong>Uso por Terceiros:</strong> É vedado ao USUÁRIO permitir,
              sob qualquer hipótese, que terceiros utilizem o equipamento,
              salvo mediante prévia e expressa autorização por escrito da
              EMPRESA.
            </p>
            <p>
              <strong>Comunicação de Ocorrências:</strong> Em caso de furto,
              roubo, perda, dano significativo ou mau funcionamento, o USUÁRIO
              obriga-se a comunicar o fato imediatamente à EMPRESA.
            </p>
            <p>
              <strong>Devolução:</strong> O USUÁRIO compromete-se a devolver
              prontamente o equipamento e seus acessórios à EMPRESA, sempre
              que solicitado ou no término do vínculo empregatício/funcional.
            </p>
          </div>

          <h2 className="mb-3 text-base font-bold">
            DECLARAÇÃO E CIÊNCIA DO USUÁRIO
          </h2>
          <p className="mb-4 text-sm leading-relaxed">
            Eu, <strong>{seller?.name || "___________________"}</strong>,
            portador do CPF nº{" "}
            <strong>{seller?.cpf || "___________________"}</strong>, declaro
            para os devidos fins que:
          </p>
          <ol className="mb-6 list-decimal space-y-2 pl-6 text-sm leading-relaxed">
            <li>
              Li, compreendi e concordo integralmente com todas as cláusulas e
              condições deste Termo de Autorização.
            </li>
            <li>
              Recebi na data de hoje, em perfeitas condições de uso, o
              equipamento e acessórios acima especificados.
            </li>
            <li>
              Comprometo-me a cumprir rigorosamente as obrigações de uso,
              guarda, conservação e devolução aqui estabelecidas.
            </li>
          </ol>

          <p className="mb-12 text-sm">
            Valparaíso de Goiás, ____ de ______________ de ______.
          </p>

          <div className="grid grid-cols-1 gap-12 pt-8 sm:grid-cols-2">
            <div className="text-center">
              <div className="mb-2 border-t border-black pt-2 text-sm">
                Assinatura do Usuário
              </div>
            </div>
            <div className="text-center">
              <div className="mb-2 border-t border-black pt-2 text-sm">
                Assinatura do Representante Legal
                <br />
                <span className="text-xs">
                  (TECIDOS E ARMARINHOS MIGUEL BARTOLOMEU S/A)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="min-h-[1.5rem] border-b border-dotted border-gray-400 font-medium">
        {value || "\u00A0"}
      </p>
    </div>
  );
}
