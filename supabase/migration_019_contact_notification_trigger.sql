-- Trigger: automatski kreira notifikaciju u admin inboxu kad se doda
-- nova kontakt osoba ili osoba za ulaznice (bez obzira tko to dodaje).
-- SECURITY DEFINER = izvršava se s privilegijama vlasnika funkcije → zaobilazi RLS.
-- EXCEPTION blok = greška pri insertu u notifications NE rollbacka insert u sponsor_contacts.

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
      WHEN NEW.type = 'contact' THEN 'Nova kontakt osoba'
      ELSE 'Nova osoba za ulaznice'
    END;

    v_message := v_sponsor_name || ': dodana ' ||
      CASE WHEN NEW.type = 'contact' THEN 'kontakt osoba' ELSE 'osoba za ulaznice' END ||
      ' — ' || NEW.name;

    INSERT INTO notifications (sponsor_id, title, message)
    VALUES (NEW.sponsor_id, v_title, v_message);
  EXCEPTION WHEN OTHERS THEN
    NULL; -- Ne blokiraj insert kontakta ako notifikacija ne uspije
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_contact_insert ON sponsor_contacts;
CREATE TRIGGER trg_notify_on_contact_insert
  AFTER INSERT ON sponsor_contacts
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_contact_insert();
