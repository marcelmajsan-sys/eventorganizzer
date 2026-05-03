-- Migration 015: Enable RLS on sponsor_contacts + partner write access

ALTER TABLE sponsor_contacts ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "contacts_admin_all" ON sponsor_contacts
  FOR ALL USING (is_admin());

-- Partners can read their own sponsor's contacts
CREATE POLICY "contacts_sponsor_select" ON sponsor_contacts
  FOR SELECT USING (sponsor_id = get_my_sponsor_id());

-- Partners can add contacts to their own sponsor
CREATE POLICY "contacts_sponsor_insert" ON sponsor_contacts
  FOR INSERT WITH CHECK (sponsor_id = get_my_sponsor_id());

-- Partners can update their own sponsor's contacts
CREATE POLICY "contacts_sponsor_update" ON sponsor_contacts
  FOR UPDATE
  USING (sponsor_id = get_my_sponsor_id())
  WITH CHECK (sponsor_id = get_my_sponsor_id());

-- Partners can delete their own sponsor's contacts
CREATE POLICY "contacts_sponsor_delete" ON sponsor_contacts
  FOR DELETE USING (sponsor_id = get_my_sponsor_id());
