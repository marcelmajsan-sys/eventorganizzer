-- Popravak triggera: samo type = 'ticket' daje "Nova osoba za ulaznice".
-- Svi ostali tipovi (contact, partner, visitor, speaker, itd.) daju "Dodan novi kontakt".

CREATE OR REPLACE FUNCTION notify_admin_on_contact_insert()
RETURNS trigger AS $$
DECLARE
  v_sponsor_name TEXT;
  v_title        TEXT;
  v_message      TEXT;
BEGIN
  BEGIN
    SELECT name INTO v_sponsor_name FROM sponsors WHERE id = NEW.sponsor_id LIMIT 1;
    v_sponsor_name := COALESCE(v_sponsor_name, 'Nepoznati sponzor');

    v_title := CASE
      WHEN NEW.type = 'ticket' THEN 'Nova osoba za ulaznice'
      ELSE 'Dodan novi kontakt'
    END;

    v_message := v_sponsor_name || ': ' ||
      CASE WHEN NEW.type = 'ticket' THEN 'dodana osoba za ulaznice' ELSE 'dodan novi kontakt' END ||
      ' — ' || NEW.name;

    INSERT INTO notifications (sponsor_id, title, message)
    VALUES (NEW.sponsor_id, v_title, v_message);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
