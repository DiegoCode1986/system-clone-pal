import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Users, UserPlus, Search, Trash2, Plus, Phone, Mail, Package, X } from "lucide-react";
import {
  useSellers,
  statusLabel,
  type SellerStatus,
  type Seller,
} from "@/lib/sellers-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gestor de Vendedores" },
      {
        name: "description",
        content:
          "Sistema para gerenciar vendedores, status (ativo, aviso, inativo) e equipamentos de venda.",
      },
    ],
  }),
  component: Index,
});

const statusStyles: Record<SellerStatus, string> = {
  ativo: "bg-success/15 text-success border-success/30",
  aviso: "bg-warning/20 text-warning-foreground border-warning/40",
  inativo: "bg-destructive/15 text-destructive border-destructive/30",
};

function Index() {
  const {
    sellers,
    ready,
    addSeller,
    updateSeller,
    removeSeller,
    addEquipment,
    removeEquipment,
  } = useSellers();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"todos" | SellerStatus>("todos");
  const [openNew, setOpenNew] = useState(false);
  const [detail, setDetail] = useState<Seller | null>(null);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      if (filter !== "todos" && s.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.toLowerCase().includes(q)
      );
    });
  }, [sellers, query, filter]);

  const counts = useMemo(
    () => ({
      total: sellers.length,
      ativo: sellers.filter((s) => s.status === "ativo").length,
      aviso: sellers.filter((s) => s.status === "aviso").length,
      inativo: sellers.filter((s) => s.status === "inativo").length,
      equipamentos: sellers.reduce((acc, s) => acc + s.equipments.length, 0),
    }),
    [sellers],
  );

  const current = detail ? sellers.find((s) => s.id === detail.id) ?? null : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight">Gestor de Vendedores</h1>
              <p className="text-xs text-muted-foreground">Vendedores e equipamentos</p>
            </div>
          </div>
          <Dialog open={openNew} onOpenChange={setOpenNew}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" /> Novo vendedor
              </Button>
            </DialogTrigger>
            <NewSellerDialog
              onSubmit={(data) => {
                addSeller(data);
                setOpenNew(false);
              }}
            />
          </Dialog>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Total" value={counts.total} />
          <StatCard label="Ativos" value={counts.ativo} tone="success" />
          <StatCard label="Em aviso" value={counts.aviso} tone="warning" />
          <StatCard label="Equipamentos" value={counts.equipamentos} tone="muted" />
        </section>

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="ativo">Ativos</TabsTrigger>
              <TabsTrigger value="aviso">Aviso</TabsTrigger>
              <TabsTrigger value="inativo">Inativos</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {!ready ? null : filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <CardContent className="space-y-2">
              <Users className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhum vendedor encontrado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setDetail(s)}
                className="text-left transition hover:-translate-y-0.5"
              >
                <Card className="h-full">
                  <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0">
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      {s.email && (
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      )}
                    </div>
                    <Badge variant="outline" className={cn("capitalize", statusStyles[s.status])}>
                      {statusLabel[s.status]}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {s.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" /> {s.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Package className="h-3.5 w-3.5" /> {s.equipments.length} equipamento(s)
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))}
          </div>
        )}
      </main>

      <Dialog open={!!current} onOpenChange={(o) => !o && setDetail(null)}>
        {current && (
          <SellerDetailDialog
            seller={current}
            onUpdate={(patch) => updateSeller(current.id, patch)}
            onRemove={() => {
              removeSeller(current.id);
              setDetail(null);
            }}
            onAddEquipment={(eq) => addEquipment(current.id, eq)}
            onRemoveEquipment={(eqId) => removeEquipment(current.id, eqId)}
          />
        )}
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning" | "muted";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning-foreground"
        : tone === "muted"
          ? "text-muted-foreground"
          : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-1 text-2xl font-semibold", toneCls)}>{value}</p>
      </CardContent>
    </Card>
  );
}

function NewSellerDialog({
  onSubmit,
}: {
  onSubmit: (s: {
    name: string;
    phone?: string;
    email?: string;
    status: SellerStatus;
    notes?: string;
  }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SellerStatus>("ativo");
  const [notes, setNotes] = useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Novo vendedor</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Nome *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Telefone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as SellerStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="aviso">Aviso</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Observações</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button
          disabled={!name.trim()}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              phone: phone.trim() || undefined,
              email: email.trim() || undefined,
              status,
              notes: notes.trim() || undefined,
            })
          }
        >
          Cadastrar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

function SellerDetailDialog({
  seller,
  onUpdate,
  onRemove,
  onAddEquipment,
  onRemoveEquipment,
}: {
  seller: Seller;
  onUpdate: (patch: Partial<Seller>) => void;
  onRemove: () => void;
  onAddEquipment: (eq: { name: string; serial?: string }) => void;
  onRemoveEquipment: (id: string) => void;
}) {
  const [eqName, setEqName] = useState("");
  const [eqSerial, setEqSerial] = useState("");

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          {seller.name}
          <Badge variant="outline" className={cn(statusStyles[seller.status])}>
            {statusLabel[seller.status]}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={seller.status}
              onValueChange={(v) => onUpdate({ status: v as SellerStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="aviso">Aviso</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Telefone</Label>
            <Input
              value={seller.phone ?? ""}
              onChange={(e) => onUpdate({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Email</Label>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <Input
              value={seller.email ?? ""}
              onChange={(e) => onUpdate({ email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Observações</Label>
          <Textarea
            value={seller.notes ?? ""}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            rows={3}
          />
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-semibold">
              <Package className="h-4 w-4" /> Equipamentos ({seller.equipments.length})
            </h4>
          </div>

          <div className="mb-3 space-y-2">
            {seller.equipments.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum equipamento associado.</p>
            )}
            {seller.equipments.map((eq) => (
              <div
                key={eq.id}
                className="flex items-center justify-between rounded-md bg-card px-3 py-2 text-sm shadow-sm"
              >
                <div>
                  <p className="font-medium">{eq.name}</p>
                  {eq.serial && (
                    <p className="text-xs text-muted-foreground">Série: {eq.serial}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onRemoveEquipment(eq.id)}
                  aria-label="Remover"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <Input
              placeholder="Nome do equipamento"
              value={eqName}
              onChange={(e) => setEqName(e.target.value)}
            />
            <Input
              placeholder="Nº de série (opcional)"
              value={eqSerial}
              onChange={(e) => setEqSerial(e.target.value)}
            />
            <Button
              disabled={!eqName.trim()}
              onClick={() => {
                onAddEquipment({ name: eqName.trim(), serial: eqSerial.trim() || undefined });
                setEqName("");
                setEqSerial("");
              }}
            >
              <Plus className="mr-1 h-4 w-4" /> Adicionar
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter className="sm:justify-between">
        <Button variant="destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" /> Excluir vendedor
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
