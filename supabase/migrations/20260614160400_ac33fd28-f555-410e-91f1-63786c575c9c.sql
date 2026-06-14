
-- 1. Enum filial
CREATE TYPE public.filial AS ENUM ('MARINGA','VALPARAISO','RECIFE','FORTALEZA','GOIANIA','SAO_LUIS','ARACAJU');

-- 2. Profiles table
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  filial public.filial NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. Add filial to sellers
ALTER TABLE public.sellers ADD COLUMN filial public.filial;
UPDATE public.sellers SET filial = 'MARINGA' WHERE filial IS NULL;
ALTER TABLE public.sellers ALTER COLUMN filial SET NOT NULL;
ALTER TABLE public.sellers ALTER COLUMN filial SET DEFAULT 'MARINGA';

-- 4. Trigger to autofill filial from profile on insert
CREATE OR REPLACE FUNCTION public.set_seller_filial()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.filial IS NULL THEN
    SELECT filial INTO NEW.filial FROM public.profiles WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER sellers_set_filial BEFORE INSERT ON public.sellers
  FOR EACH ROW EXECUTE FUNCTION public.set_seller_filial();
