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
  History,
  ClipboardList,
  Search,
  Pencil,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import {
  useSellers,
  statusLabel,
  validateContractFile,
  getContractUrl,
  type SellerStatus,
  type Seller,
} from "@/lib/sellers-store";
import { toast } from "sonner";
import { useProfile } from "@/lib/profile-store";
import { filialLabel } from "@/lib/filiais";


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
import { Checkbox } from "@/components/ui/checkbox";
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
  const navigate = useNavigate();
  const { sellers, ready, addSeller, updateSeller, removeSeller } = useSellers();
  const { filial } = useProfile();
  const filialName = filial ? filialLabel[filial] : "";

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }



  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [editing, setEditing] = useState<Seller | null>(null);
  const [creating, setCreating] = useState(false);
  const [toDelete, setToDelete] = useState<Seller | null>(null);
  const [printOpen, setPrintOpen] = useState(false);

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
              {filialName && <> · Filial <strong>{filialName}</strong></>}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setCreating(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Novo Vendedor
            </Button>
            <Button variant="outline" onClick={() => setPrintOpen(true)}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/historico-mobile" })}>
              <History className="mr-2 h-4 w-4" /> Histórico Mobile
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/controle-entrega" })}>
              <ClipboardList className="mr-2 h-4 w-4" /> Controle de Entrega
            </Button>
            <Button variant="outline" onClick={() => navigate({ to: "/termo-mobile" })}>
              <FileText className="mr-2 h-4 w-4" /> Termo Mobile
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" /> Sair
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

      <Dialog open={printOpen} onOpenChange={setPrintOpen}>
        <PrintReportDialog
          sellers={sellers}
          filialName={filialName}
          onClose={() => setPrintOpen(false)}
        />
      </Dialog>

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

        <div className="grid gap-2">
          <Label>Contrato Assinado (imagem)</Label>
          {previewUrl ? (
            <div className="flex items-center gap-3 rounded-md border p-2">
              <img
                src={previewUrl}
                alt="Prévia do contrato assinado"
                className="h-16 w-16 rounded object-cover"
              />
              <div className="flex flex-1 flex-col gap-1 text-sm">
                <span className="text-muted-foreground">
                  {contractFile ? contractFile.name : "Contrato anexado"}
                </span>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(previewUrl, "_blank", "noopener")}
                  >
                    Ver
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => {
                      setContractFile(null);
                      setRemoveContract(true);
                      setPreviewUrl(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const err = validateContractFile(file);
                if (err) {
                  toast.error(err);
                  e.target.value = "";
                  return;
                }
                setContractFile(file);
                setRemoveContract(false);
                setPreviewUrl(URL.createObjectURL(file));
              }}
            />
          )}
          <p className="text-xs text-muted-foreground">JPG, PNG ou WEBP — até 10 MB.</p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          disabled={!valid}
          onClick={() =>
            onSubmit(
              {
                name: name.trim(),
                cpf: cpf.trim(),
                matricula: matricula.trim(),
                role: role.trim(),
                equipmentSerial: equipmentSerial.trim() || undefined,
                status,
                admissionDate: admissionDate || undefined,
                exitDate: exitDate || undefined,
                notes: notes.trim() || undefined,
              },
              { contractFile, removeContract },
            )
          }
        >
          {mode === "edit" ? "Salvar Alterações" : "Cadastrar"}
        </Button>
      </DialogFooter>

    </DialogContent>
  );
}

function PrintReportDialog({
  sellers,
  filialName,
  onClose,
}: {
  sellers: Seller[];
  filialName: string;
  onClose: () => void;
}) {

  const [includeAtivo, setIncludeAtivo] = useState(true);
  const [includeAviso, setIncludeAviso] = useState(true);
  const [includeInativo, setIncludeInativo] = useState(true);

  const counts = useMemo(
    () => ({
      ativo: sellers.filter((s) => s.status === "ativo").length,
      aviso: sellers.filter((s) => s.status === "aviso").length,
      inativo: sellers.filter((s) => s.status === "inativo").length,
    }),
    [sellers],
  );

  const selected = useMemo(() => {
    return sellers.filter((s) => {
      if (s.status === "ativo") return includeAtivo;
      if (s.status === "aviso") return includeAviso;
      if (s.status === "inativo") return includeInativo;
      return false;
    });
  }, [sellers, includeAtivo, includeAviso, includeInativo]);

  function escapeHtml(s: string) {
    return s.replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
    );
  }

  function handlePrint() {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
    const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const rows = selected
      .map(
        (s) => `
          <tr>
            <td>${escapeHtml(s.name)}</td>
            <td>${escapeHtml(s.matricula)}</td>
            <td>${escapeHtml(s.cpf)}</td>
            <td>${escapeHtml(s.role)}</td>
            <td>${escapeHtml(s.equipmentSerial ?? "")}</td>
            <td>${escapeHtml(statusLabel[s.status])}</td>
          </tr>`,
      )
      .join("");

    const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>Relatório de Vendedores</title>
<style>
  *{box-sizing:border-box}
  body{font-family:Arial,sans-serif;color:#111;margin:32px;}
  h1{text-align:center;margin:0 0 4px;font-size:22px}
  .sub{text-align:center;color:#555;margin-bottom:24px;font-size:13px}
  table{width:100%;border-collapse:collapse;font-size:12px}
  thead th{text-align:left;border-bottom:2px solid #333;padding:8px 6px;font-weight:600}
  tbody td{padding:10px 6px;border-bottom:1px solid #e5e5e5}
  tbody tr:nth-child(even){background:#fafafa}
  @media print{body{margin:12mm}}
</style></head><body>
  <h1>Relatório de Vendedores</h1>
  ${filialName ? `<div class="sub"><strong>Filial: ${escapeHtml(filialName)}</strong></div>` : ""}
  <div class="sub">Gerado em ${dateStr} às ${timeStr}</div>

  <table>
    <thead><tr>
      <th>Nome</th><th>Matrícula</th><th>CPF</th><th>Função/Setor</th><th>Nº Série</th><th>Status</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <script>window.onload=()=>{window.focus();window.print();}</script>
</body></html>`;

    const w = window.open("", "_blank", "width=900,height=700");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    onClose();
  }

  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Imprimir Relatório</DialogTitle>
      </DialogHeader>
      <div className="grid gap-3">
        <p className="text-sm font-medium">Selecione os status para incluir:</p>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={includeAtivo} onCheckedChange={(v) => setIncludeAtivo(!!v)} />
          <span className="h-2 w-2 rounded-full bg-success" />
          Ativos ({counts.ativo})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={includeAviso} onCheckedChange={(v) => setIncludeAviso(!!v)} />
          <span className="h-2 w-2 rounded-full bg-warning" />
          Em Aviso ({counts.aviso})
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={includeInativo} onCheckedChange={(v) => setIncludeInativo(!!v)} />
          <span className="h-2 w-2 rounded-full bg-destructive" />
          Inativos ({counts.inativo})
        </label>
        <div className="rounded-md bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
          <strong className="text-foreground">{selected.length}</strong> vendedor(es) serão incluídos no relatório
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button onClick={handlePrint} disabled={selected.length === 0}>
          <Printer className="mr-2 h-4 w-4" /> Imprimir
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
