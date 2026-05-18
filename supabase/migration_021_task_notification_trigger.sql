-- Trigger: automatski kreira notifikaciju u admin inboxu kad se kreira
-- novi zadatak s popunjenim assigned_to emailom.
-- SECURITY DEFINER = izvršava se s privilegijama vlasnika funkcije → zaobilazi RLS.
-- EXCEPTION blok = greška pri insertu u notifications NE rollbacka insert u tasks.

CREATE OR REPLACE FUNCTION notify_admin_on_task_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to LIKE '%@%' THEN
    BEGIN
      INSERT INTO notifications (task_id, title, message)
      VALUES (
        NEW.id,
        'Novi zadatak',
        'Dodijeljen vam je zadatak: ' || NEW.title
      );
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ne blokiraj insert zadatka ako notifikacija ne uspije
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_notify_on_task_insert ON tasks;
CREATE TRIGGER trg_notify_on_task_insert
  AFTER INSERT ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_on_task_insert();
