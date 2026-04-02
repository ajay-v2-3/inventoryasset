
-- Create locations table
CREATE TABLE public.locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

-- RLS policies for locations
CREATE POLICY "Users can view own locations" ON public.locations FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own locations" ON public.locations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own locations" ON public.locations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own locations" ON public.locations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all locations" ON public.locations FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage all locations" ON public.locations FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Add location_id to products (nullable for backward compat)
ALTER TABLE public.products ADD COLUMN location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL;
