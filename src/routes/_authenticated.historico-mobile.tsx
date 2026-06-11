import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Search, Smartphone, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useSellers, statusLabel, type Seller } from "@/lib/sellers-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/historico-mobile")({
  head: () => ({
    meta: [{ title: "Histórico de Mobile" }],
  }),
  component: HistoricoMobile,
});

const statusBadge: Record<Seller["status"], string> = {
  ativo: "bg-success/15 text-success",
  aviso: "bg-warning/25 text-warning-foreground",
  inativo: "bg-destructive/15 text-destructive",
};

function HistoricoMobile() {
  const navigate = useNavigate();
  const { sellers } = useSellers();
  const [serial, setSerial] = useState("");
  const [searched, setSearched] = useState<string | null>(null);

  const matches = searched
    ? sellers
        .filter((s) => (s.equipmentSerial ?? "").trim() === searched.trim())
        .sort((a, b) => b.createdAt - a.createdAt)
    : [];

  const current = matches.find((s) => s.status !== "inativo");
  const previous = matches.filter((s) => s.id !== current?.id);

  function handleSearch() {
    setSearched(serial.trim());
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-6 flex items-start gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Histórico de Mobile</h1>
            <p className="text-sm text-muted-foreground">
              Digite o serial para ver quem usou o equipamento
            </p>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Input
            placeholder="Digite o número de série"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch}>
            <Search className="mr-2 h-4 w-4" /> Buscar
          </Button>
        </div>

        {searched && (
          <>
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Smartphone className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-muted-foreground">
                  Serial
                </p>
                <p className="text-lg font-bold">{searched}</p>
              </div>
            </div>

            {matches.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Nenhum vendedor encontrado para este serial.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {current && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-success">
                      Responsável Atual
                    </p>
                    <SellerRow seller={current} highlight />
                  </section>
                )}
                {previous.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Histórico Anterior
                    </p>
                    <div className="space-y-2">
                      {previous.map((s) => (
                        <SellerRow key={s.id} seller={s} />
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function SellerRow({ seller, highlight }: { seller: Seller; highlight?: boolean }) {
  return (
    <Card className={cn(highlight && "border-success/60")}>
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            highlight ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
          )}
        >
          <UserIcon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold">{seller.name}</p>
          <p className="text-sm text-muted-foreground">
            {seller.matricula} · {seller.role}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium",
            statusBadge[seller.status],
          )}
        >
          {statusLabel[seller.status]}
        </span>
      </CardContent>
    </Card>
  );
}
