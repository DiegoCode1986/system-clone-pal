ALTER TABLE public.sellers ADD COLUMN IF NOT EXISTS contract_path text;

CREATE POLICY "Users can view own contracts"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'contratos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own contracts"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'contratos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own contracts"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'contratos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'contratos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own contracts"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'contratos' AND auth.uid()::text = (storage.foldername(name))[1]);