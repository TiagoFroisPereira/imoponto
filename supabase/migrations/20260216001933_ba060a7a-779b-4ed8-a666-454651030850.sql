
-- Drop all existing RESTRICTIVE policies on vault_buyer_access
DROP POLICY IF EXISTS "Buyers can create own access requests" ON vault_buyer_access;
DROP POLICY IF EXISTS "Buyers can update own requests" ON vault_buyer_access;
DROP POLICY IF EXISTS "Buyers can view own access requests" ON vault_buyer_access;
DROP POLICY IF EXISTS "Owners can update requests for their properties" ON vault_buyer_access;
DROP POLICY IF EXISTS "Owners can view requests for their properties" ON vault_buyer_access;

-- Recreate as PERMISSIVE policies (default)
CREATE POLICY "Buyers can create own access requests"
ON vault_buyer_access FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can view own access requests"
ON vault_buyer_access FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Owners can view requests for their properties"
ON vault_buyer_access FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Buyers can update own requests"
ON vault_buyer_access FOR UPDATE
USING (auth.uid() = buyer_id);

CREATE POLICY "Owners can update requests for their properties"
ON vault_buyer_access FOR UPDATE
USING (auth.uid() = owner_id);
