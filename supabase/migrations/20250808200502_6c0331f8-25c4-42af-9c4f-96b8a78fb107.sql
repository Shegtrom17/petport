-- Make organization_id optional for transfer requests to support independent fosters
ALTER TABLE public.transfer_requests
  ALTER COLUMN organization_id DROP NOT NULL;

-- Update RLS policies to allow owner-initiated transfers without an organization
ALTER POLICY "Org admins can create transfer requests"
ON public.transfer_requests
WITH CHECK (
  (organization_id IS NOT NULL AND is_org_admin(auth.uid(), organization_id) AND from_user_id = auth.uid())
  OR (organization_id IS NULL AND from_user_id = auth.uid())
);

ALTER POLICY "Org admins can update transfer requests"
ON public.transfer_requests
USING (
  (organization_id IS NOT NULL AND is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND from_user_id = auth.uid())
);

ALTER POLICY "Org admins can delete transfer requests"
ON public.transfer_requests
USING (
  (organization_id IS NOT NULL AND is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND from_user_id = auth.uid())
);

ALTER POLICY "Org admins or recipient can view transfer requests"
ON public.transfer_requests
USING (
  (organization_id IS NOT NULL AND is_org_admin(auth.uid(), organization_id))
  OR (organization_id IS NULL AND from_user_id = auth.uid())
  OR (to_email = auth.email())
);
