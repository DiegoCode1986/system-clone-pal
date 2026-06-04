CREATE TYPE public.seller_status AS ENUM ('ativo', 'aviso', 'inativo');

CREATE TABLE public.sellers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  matricula TEXT NOT NULL,
  role TEXT NOT NULL,
  equipment_serial TEXT,
  status public.seller_status NOT NULL DEFAULT 'ativo',
  admission_date DATE,
  exit_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX sellers_user_cpf_key ON public.sellers (user_id, cpf);
CREATE UNIQUE INDEX sellers_user_matricula_key ON public.sellers (user_id, matricula);
CREATE UNIQUE INDEX sellers_user_equipment_serial_key ON public.sellers (user_id, equipment_serial) WHERE equipment_serial IS NOT NULL;
CREATE INDEX sellers_user_id_idx ON public.sellers (user_id);
CREATE INDEX sellers_status_idx ON public.sellers (user_id, status);
CREATE INDEX sellers_matricula_idx ON public.sellers (matricula);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sellers TO authenticated;
GRANT ALL ON public.sellers TO service_role;

ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sellers" ON public.sellers
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sellers" ON public.sellers
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sellers" ON public.sellers
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own sellers" ON public.sellers
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_sellers_updated_at
  BEFORE UPDATE ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();