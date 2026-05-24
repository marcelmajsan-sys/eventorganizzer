-- migration_036_contract_accepted_notification.sql
-- Postgres trigger: salje notifikaciju u inbox kada partner prihvati ugovor

CREATE OR REPLACE FUNCTION notify_contract_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sponsor_name TEXT;
BEGIN
  -- Okini se samo kad contract_accepted_at prijelazi iz NULL u vrijednost
  IF (NEW.contract_accepted_at IS NOT NULL) AND (OLD.contract_accepted_at IS NULL) THEN

    SELECT name INTO v_sponsor_name
    FROM sponsors
    WHERE id = NEW.sponsor_id;

    INSERT INTO notifications (sponsor_id, title, message)
    VALUES (
      NEW.sponsor_id,
      'Ugovor prihvaćen',
      COALESCE(v_sponsor_name, 'Partner') || ' je prihvatio/la ugovor o suradnji.'
        || CASE
             WHEN NEW.contract_accepted_by IS NOT NULL
             THEN ' Prihvatio/la: ' || NEW.contract_accepted_by
             ELSE ''
           END
    );

  END IF;
  RETURN NEW;
END;
$$;

-- Makni stari trigger ako postoji
DROP TRIGGER IF EXISTS trigger_contract_accepted ON sponsor_users;

CREATE TRIGGER trigger_contract_accepted
AFTER UPDATE ON sponsor_users
FOR EACH ROW
EXECUTE FUNCTION notify_contract_accepted();
