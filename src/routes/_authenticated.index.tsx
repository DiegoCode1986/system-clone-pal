import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogOut } from "lucide-react";
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserX,
  UserPlus,
  Printer,
  FileText,
  Search,
  Pencil,
  Trash2,
  User as UserIcon,
} from "lucide-react";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Gestor de Vendedores" },
      {
        name: "description",
        content:
          "Sistema para gerenciar vendedores, status e equipamentos de venda.",
      },
    ],
  }),
  component: Index,
});

const statusBorder: Record<SellerStatus, string> = {
  ativo: "border-success/60",
  aviso: "border-warning/70",
  inativo: "border-destructive/60",
};

const statusBadge: Record<SellerStatus, string> = {
  ativo: "bg-success/15 text-success",
  aviso: "bg-warning/25 text-warning-foreground",
  inativo: "bg-destructive/15 text-destructive",
};

const statusDot: Record<SellerStatus, string> = {
  ativo: "bg-success",
  aviso: "bg-warning",
  inativo: "bg-destructive",
};

type Filter = "todos" | SellerStatus;

function Index() {
  const { sellers, ready, addSeller, updateSeller, removeSeller } = useSellers();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [editing, setEditing] = useState<Seller | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Seller | null>(null);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      if (filter !== "todos" && s.status !== filter) return false;
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.matricula.toLowerCase().includes(q)
      );
    });
  }, [sellers, query, filter]);

  const counts = useMemo(
    () => ({
      total: sellers.length,
      ativo: sellers.filter((s) => s.status === "ativo").length,
      aviso: sellers.filter((s) => s.status === "aviso").length,
      inativo: sellers.filter((s) => s.status === "inativo").length,
    }),
    [sellers],
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendedores</h1>
            <p className="text-sm text-muted-foreground">
              Gestão de vendedores e equipamentos
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreating(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Novo Vendedor
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" /> Termo Mobile
            </Button>
          </div>
        </header>

        <section className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={<Users className="h-5 w-5" />} label="Total" value={counts.total} />
          <StatCard
            icon={<UserCheck className="h-5 w-5 text-success" />}
            label="Ativos"
            value={counts.ativo}
            valueClass="text-success"
            iconBg="bg-success/15"
          />
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-warning-foreground" />}
            label="Em Aviso"
            value={counts.aviso}
            valueClass="text-warning-foreground"
            iconBg="bg-warning/25"
          />
          <StatCard
            icon={<UserX className="h-5 w-5 text-destructive" />}
            label="Inativos"
            value={counts.inativo}
            valueClass="text-destructive"
            iconBg="bg-destructive/15"
          />
        </section>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Pesquise por Matrícula ou Nome do usuário"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
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
              <p className="text-sm text-muted-foreground">
                Nenhum vendedor encontrado.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s) => (
              <SellerCard
                key={s.id}
                seller={s}
                onEdit={() => setEditing(s)}
                onDelete={() => setToDelete(s)}
              />
            ))}
          </div>
        )}
      </main>

      <Dialog open={creating} onOpenChange={setCreating}>
        <SellerFormDialog
          mode="create"
          onSubmit={(data) => {
            addSeller(data);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        {editing && (
          <SellerFormDialog
            mode="edit"
            seller={editing}
            onSubmit={(data) => {
              updateSeller(editing.id, data);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir vendedor?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. {toDelete?.name} será removido(a)
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toDelete) removeSeller(toDelete.id);
                setToDelete(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  valueClass,
  iconBg = "bg-muted",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  valueClass?: string;
  iconBg?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", iconBg)}>
          {icon}
        </div>
        <div>
          <p className={cn("text-2xl font-bold leading-none", valueClass)}>{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function SellerCard({
  seller,
  onEdit,
  onDelete,
}: {
  seller: Seller;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card className={cn("relative border-2", statusBorder[seller.status])}>
      <button
        type="button"
        onClick={onEdit}
        aria-label="Editar"
        className="absolute left-2 top-2 rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Excluir"
        className="absolute right-2 top-2 rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      <CardContent className="flex flex-col items-center gap-2 px-4 pb-5 pt-8 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UserIcon className="h-10 w-10" />
        </div>
        <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-tight">
          {seller.name}
        </h3>
        <p className="text-sm text-muted-foreground">{seller.matricula}</p>
        <p className="text-sm text-muted-foreground">{seller.role}</p>
        <span
          className={cn(
            "mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium",
            statusBadge[seller.status],
          )}
        >
          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot[seller.status])} />
          {statusLabel[seller.status]}
        </span>
      </CardContent>
    </Card>
  );
}

type FormData = Omit<Seller, "id" | "createdAt">;

function SellerFormDialog({
  mode,
  seller,
  onSubmit,
  onCancel,
}: {
  mode: "create" | "edit";
  seller?: Seller;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(seller?.name ?? "");
  const [cpf, setCpf] = useState(seller?.cpf ?? "");
  const [matricula, setMatricula] = useState(seller?.matricula ?? "");
  const [role, setRole] = useState(seller?.role ?? "Vendedor(a) Interno");
  const [equipmentSerial, setEquipmentSerial] = useState(seller?.equipmentSerial ?? "");
  const [status, setStatus] = useState<SellerStatus>(seller?.status ?? "ativo");
  const [admissionDate, setAdmissionDate] = useState(seller?.admissionDate ?? "");
  const [exitDate, setExitDate] = useState(seller?.exitDate ?? "");
  const [notes, setNotes] = useState(seller?.notes ?? "");

  const valid = name.trim() && cpf.trim() && matricula.trim() && role.trim();

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>{mode === "edit" ? "Editar Vendedor" : "Novo Vendedor"}</DialogTitle>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Nome Completo *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>CPF *</Label>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Matrícula *</Label>
            <Input value={matricula} onChange={(e) => setMatricula(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Função/Setor *</Label>
          <Input value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label>Número de Série (Equipamento)</Label>
          <Input
            value={equipmentSerial}
            onChange={(e) => setEquipmentSerial(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as SellerStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" /> Ativo
                </span>
              </SelectItem>
              <SelectItem value="aviso">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-warning" /> Aviso
                </span>
              </SelectItem>
              <SelectItem value="inativo">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-destructive" /> Inativo
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-2">
            <Label>Data de Admissão</Label>
            <Input
              type="date"
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Data de Saída</Label>
            <Input
              type="date"
              value={exitDate}
              onChange={(e) => setExitDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>Observações</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onSubmit({
              name: name.trim(),
              cpf: cpf.trim(),
              matricula: matricula.trim(),
              role: role.trim(),
              equipmentSerial: equipmentSerial.trim() || undefined,
              status,
              admissionDate: admissionDate || undefined,
              exitDate: exitDate || undefined,
              notes: notes.trim() || undefined,
            })
          }
        >
          {mode === "edit" ? "Salvar Alterações" : "Cadastrar"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
