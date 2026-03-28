
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS invoice_number text DEFAULT '',
  ADD COLUMN IF NOT EXISTS vendor_gst text DEFAULT '',
  ADD COLUMN IF NOT EXISTS bill_amount numeric DEFAULT 0;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number text DEFAULT '';
