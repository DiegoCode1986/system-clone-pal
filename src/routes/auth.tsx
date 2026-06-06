import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({ meta: [{ title: "Entrar — Gestor de Vendedores" }] }),
  component: AuthPage,
});

const MATRICULA_DOMAIN = "vendedores.local";

function matriculaToEmail(matricula: string) {
  return `${matricula}@${MATRICULA_DOMAIN}`;
}

function isValidMatricula(m: string) {
  return /^\d{5}$/.test(m);
}

function AuthPage() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/" });
    });
  }, [navigate]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMatricula(matricula)) {
      return toast.error("A matrícula deve ter 5 dígitos.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: matriculaToEmail(matricula),
      password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bem-vindo!");
    navigate({ to: "/" });
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidMatricula(matricula)) {
      return toast.error("A matrícula deve ter 5 dígitos.");
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: matriculaToEmail(matricula),
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Conta criada. Faça login.");
  }

  function handleMatriculaChange(value: string) {
    setMatricula(value.replace(/\D/g, "").slice(0, 5));
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6">
          <h1 className="mb-1 text-2xl font-bold">Gestor de Vendedores</h1>
          <p className="mb-6 text-sm text-muted-foreground">Entre com sua matrícula para continuar.</p>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="grid gap-3 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="mat-l">Matrícula</Label>
                  <Input
                    id="mat-l"
                    inputMode="numeric"
                    pattern="\d{5}"
                    maxLength={5}
                    placeholder="00000"
                    value={matricula}
                    onChange={(e) => handleMatriculaChange(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pw-l">Senha</Label>
                  <Input id="pw-l" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <Button type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</Button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="grid gap-3 pt-4">
                <div className="grid gap-2">
                  <Label htmlFor="mat-s">Matrícula</Label>
                  <Input
                    id="mat-s"
                    inputMode="numeric"
                    pattern="\d{5}"
                    maxLength={5}
                    placeholder="00000"
                    value={matricula}
                    onChange={(e) => handleMatriculaChange(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="pw-s">Senha</Label>
                  <Input id="pw-s" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                </div>
                <Button type="submit" disabled={loading}>{loading ? "Criando..." : "Criar conta"}</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
