-- Create custom types
CREATE TYPE user_role AS ENUM ('super_admin', 'pic');

-- Lomba Table
CREATE TABLE public.lomba (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role user_role NOT NULL DEFAULT 'pic',
  lomba_id UUID REFERENCES public.lomba(id) ON DELETE SET NULL, -- Only used if role is pic
  nama VARCHAR(255),
  username VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peserta Table
CREATE TABLE public.peserta (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nama VARCHAR(255) NOT NULL,
  kelas VARCHAR(50) NOT NULL,
  sekolah VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Peserta Lomba Mapping & Status ACC
CREATE TABLE public.peserta_lomba (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  peserta_id UUID REFERENCES public.peserta(id) ON DELETE CASCADE,
  lomba_id UUID REFERENCES public.lomba(id) ON DELETE CASCADE,
  sub_kategori VARCHAR(100),
  level VARCHAR(50),
  status_acc BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(peserta_id, lomba_id)
);

-- Audit Logs Table
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.lomba ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peserta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.peserta_lomba ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Setup RLS Policies

-- Audit Logs Policies
CREATE POLICY "Anyone can view audit logs"
  ON public.audit_logs FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Profiles
CREATE POLICY "Profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Super admin can view and modify everything
CREATE POLICY "Super Admins have full access to lomba"
  ON public.lomba FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins have full access to peserta"
  ON public.peserta FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

CREATE POLICY "Super Admins have full access to peserta_lomba"
  ON public.peserta_lomba FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- PIC Policies
-- PICs can view all lomba
CREATE POLICY "PIC can view all lomba"
  ON public.lomba FOR SELECT
  USING (true);

-- PICs can only view and update peserta that are in their assigned lomba
-- For peserta:
CREATE POLICY "PIC can view peserta in their lomba"
  ON public.peserta FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.peserta_lomba pl
      JOIN public.profiles p ON pl.lomba_id = p.lomba_id
      WHERE pl.peserta_id = public.peserta.id AND p.id = auth.uid() AND p.role = 'pic'
    )
  );

-- For peserta_lomba:
CREATE POLICY "PIC can view their assigned peserta_lomba"
  ON public.peserta_lomba FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.lomba_id = public.peserta_lomba.lomba_id AND p.id = auth.uid() AND p.role = 'pic'
    )
  );

CREATE POLICY "PIC can update their assigned peserta_lomba"
  ON public.peserta_lomba FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.lomba_id = public.peserta_lomba.lomba_id AND p.id = auth.uid() AND p.role = 'pic'
    )
  );

-- Allow PIC to insert into peserta
CREATE POLICY "PIC can insert peserta"
  ON public.peserta FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'pic')
  );

-- Allow PIC to insert into peserta_lomba only for their assigned lomba
CREATE POLICY "PIC can insert their assigned peserta_lomba"
  ON public.peserta_lomba FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.lomba_id = public.peserta_lomba.lomba_id AND p.id = auth.uid() AND p.role = 'pic'
    )
  );

-- Allow PIC to delete their assigned peserta_lomba
CREATE POLICY "PIC can delete their assigned peserta_lomba"
  ON public.peserta_lomba FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.lomba_id = public.peserta_lomba.lomba_id AND p.id = auth.uid() AND p.role = 'pic'
    )
  );

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nama, role)
  VALUES (new.id, new.raw_user_meta_data->>'nama', COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'pic'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Realtime Publication setup
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lomba, public.peserta, public.peserta_lomba, public.audit_logs;

-- Seed some initial Lomba data
INSERT INTO public.lomba (nama) VALUES
('Kinder Mission'),
('Brickspeed'),
('2 On 2 Soccer'),
('Coding Mission'),
('AI Animation'),
('Creative'),
('Game Maker Kit'),
('Drone Soccer'),
('Item Recycle'),
('Robot Teather');
