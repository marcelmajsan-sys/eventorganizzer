-- migration_035: SECURITY DEFINER funkcija za bilježenje prijave partnera
-- Pokrenuti u OBJE baze (2025 i 2026)

CREATE OR REPLACE FUNCTION record_partner_login_notification(
  p_sponsor_id  UUID,
  p_sponsor_name TEXT,
  p_email       TEXT
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notifications (sponsor_id, title, message)
  VALUES (
    p_sponsor_id,
    'Prijava partnera',
    p_sponsor_name || ' (' || p_email || ') se prijavio/la u portal'
  );
END;
$$;

-- Dozvoli pozivu za authenticated korisnike (server action poziva kao service role, ali radi i s anon)
GRANT EXECUTE ON FUNCTION record_partner_login_notification(UUID, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_partner_login_notification(UUID, TEXT, TEXT) TO service_role;
