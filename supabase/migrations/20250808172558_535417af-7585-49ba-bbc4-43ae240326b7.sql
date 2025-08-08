-- Organizations & Secure Pet Transfer (Phase 1)
-- 1) Helper functions for RLS
CREATE OR REPLACE FUNCTION public.is_org_member(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = _org_id AND o.owner_id = _user_id)
    OR EXISTS (
      SELECT 1 FROM public.organization_members m 
      WHERE m.organization_id = _org_id AND m.user_id = _user_id
    )
  );
$$;

CREATE OR REPLACE FUNCTION public.is_org_admin(_user_id uuid, _org_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    EXISTS (SELECT 1 FROM public.organizations o WHERE o.id = _org_id AND o.owner_id = _user_id)
    OR EXISTS (
      SELECT 1 FROM public.organization_members m 
      WHERE m.organization_id = _org_id AND m.user_id = _user_id AND m.role IN ('admin','owner')
    )
  );
$$;

-- 2) Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL,
  type text DEFAULT 'rescue',
  is_verified boolean NOT NULL DEFAULT false,
  website text,
  email text,
  phone text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Policies for organizations
DO $$ BEGIN
  -- Select: members and owners can view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Organizations are viewable by members'
  ) THEN
    CREATE POLICY "Organizations are viewable by members"
    ON public.organizations
    FOR SELECT
    USING (public.is_org_member(auth.uid(), id));
  END IF;

  -- Insert: owner must be the current user
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Users can create organizations they own'
  ) THEN
    CREATE POLICY "Users can create organizations they own"
    ON public.organizations
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());
  END IF;

  -- Update: only admins (owner or admin members)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Admins can update their organizations'
  ) THEN
    CREATE POLICY "Admins can update their organizations"
    ON public.organizations
    FOR UPDATE
    USING (public.is_org_admin(auth.uid(), id));
  END IF;

  -- Delete: only admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Admins can delete their organizations'
  ) THEN
    CREATE POLICY "Admins can delete their organizations"
    ON public.organizations
    FOR DELETE
    USING (public.is_org_admin(auth.uid(), id));
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_organizations_updated_at'
  ) THEN
    CREATE TRIGGER trg_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Organization Members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members (user_id);

ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- Policies for organization_members
DO $$ BEGIN
  -- Select: any member of the org can view membership
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organization_members' AND policyname = 'Members can view org memberships'
  ) THEN
    CREATE POLICY "Members can view org memberships"
    ON public.organization_members
    FOR SELECT
    USING (public.is_org_member(auth.uid(), organization_id));
  END IF;

  -- Insert: only org admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organization_members' AND policyname = 'Admins can add members'
  ) THEN
    CREATE POLICY "Admins can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (public.is_org_admin(auth.uid(), organization_id));
  END IF;

  -- Update: only org admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organization_members' AND policyname = 'Admins can update members'
  ) THEN
    CREATE POLICY "Admins can update members"
    ON public.organization_members
    FOR UPDATE
    USING (public.is_org_admin(auth.uid(), organization_id));
  END IF;

  -- Delete: only org admins (members can leave themselves could be added later)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'organization_members' AND policyname = 'Admins can remove members'
  ) THEN
    CREATE POLICY "Admins can remove members"
    ON public.organization_members
    FOR DELETE
    USING (public.is_org_admin(auth.uid(), organization_id));
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_org_members_updated_at'
  ) THEN
    CREATE TRIGGER trg_org_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) Transfer Requests table
CREATE TABLE IF NOT EXISTS public.transfer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  from_user_id uuid NOT NULL,
  to_email text NOT NULL,
  to_user_id uuid,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transfer_requests_token ON public.transfer_requests (token);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_to_email ON public.transfer_requests (to_email);

ALTER TABLE public.transfer_requests ENABLE ROW LEVEL SECURITY;

-- Policies for transfer_requests
DO $$ BEGIN
  -- Select: org admins for their org OR the invited recipient by email
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transfer_requests' AND policyname = 'Org admins or recipient can view transfer requests'
  ) THEN
    CREATE POLICY "Org admins or recipient can view transfer requests"
    ON public.transfer_requests
    FOR SELECT
    USING (public.is_org_admin(auth.uid(), organization_id) OR to_email = auth.email());
  END IF;

  -- Insert: only org admins, and the creator must be the current user
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transfer_requests' AND policyname = 'Org admins can create transfer requests'
  ) THEN
    CREATE POLICY "Org admins can create transfer requests"
    ON public.transfer_requests
    FOR INSERT
    WITH CHECK (public.is_org_admin(auth.uid(), organization_id) AND from_user_id = auth.uid());
  END IF;

  -- Update/Delete: only org admins
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transfer_requests' AND policyname = 'Org admins can update transfer requests'
  ) THEN
    CREATE POLICY "Org admins can update transfer requests"
    ON public.transfer_requests
    FOR UPDATE
    USING (public.is_org_admin(auth.uid(), organization_id));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'transfer_requests' AND policyname = 'Org admins can delete transfer requests'
  ) THEN
    CREATE POLICY "Org admins can delete transfer requests"
    ON public.transfer_requests
    FOR DELETE
    USING (public.is_org_admin(auth.uid(), organization_id));
  END IF;
END $$;

-- Trigger for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_transfer_requests_updated_at'
  ) THEN
    CREATE TRIGGER trg_transfer_requests_updated_at
    BEFORE UPDATE ON public.transfer_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
