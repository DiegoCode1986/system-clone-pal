DROP INDEX IF EXISTS public.sellers_user_equipment_serial_key;
CREATE UNIQUE INDEX sellers_user_equipment_serial_active_key
  ON public.sellers (user_id, equipment_serial)
  WHERE equipment_serial IS NOT NULL AND status <> 'inativo';