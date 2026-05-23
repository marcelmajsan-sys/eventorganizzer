-- Migration 028: Poruka notifikacije za zadatak uključuje email odgovorne osobe

CREATE OR REPLACE FUNCTION notify_admin_on_task_insert()
RETURNS trigger AS $$
BEGIN
  IF NEW.assigned_to IS NOT NULL AND NEW.assigned_to LIKE '%@%' THEN
    BEGIN
      INSERT INTO notifications (task_id, title, message)
      VALUES (
        NEW.id,
        'Novi zadatak',
        'Zadatak dodijeljen ' || NEW.assigned_to || ': ' || NEW.title
      );
    EXCEPTION WHEN OTHERS THEN
      NULL; -- Ne blokiraj insert zadatka ako notifikacija ne uspije
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
