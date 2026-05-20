-- migration_025: ažuriranje poruke notifikacije za novi zadatak
-- Novi format: "Dodijeljen je novi zadatak: [email] - [naziv zadatka]"

CREATE OR REPLACE FUNCTION notify_admin_on_task_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to LIKE '%@%' THEN
    BEGIN
      INSERT INTO notifications (task_id, title, message)
      VALUES (
        NEW.id,
        'Novi zadatak',
        'Dodijeljen je novi zadatak: ' || NEW.assigned_to || ' - ' || NEW.title
      );
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
