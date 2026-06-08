-- ============================================================
-- Čišćenje duplih kontakata (isti email)
-- Logika: za svaku grupu jednakih emailova zadržava se
--   1. onaj koji ima sponsor_id (vezan uz partnera/sponzora)
--   2. ako oba imaju sponsor_id → onaj s dužim/punijim imenom
--   3. ako je neriješeno → stariji zapis (created_at ASC)
-- ============================================================

-- ── KORAK 1: Pregled — što će biti zadržano, što obrisano ───────────────────
WITH ranked AS (
  SELECT
    id,
    name,
    email,
    type,
    sponsor_id,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(email))
      ORDER BY
        -- 1. Ima sponsor_id → prioritetno zadrži
        (CASE WHEN sponsor_id IS NOT NULL THEN 0 ELSE 1 END),
        -- 2. Dulje (potpunije) ime → zadrži
        length(coalesce(name, '')) DESC,
        -- 3. Više popunjenih polja → zadrži
        (
          (CASE WHEN name    IS NOT NULL AND name    != '' THEN 1 ELSE 0 END) +
          (CASE WHEN email   IS NOT NULL AND email   != '' THEN 1 ELSE 0 END) +
          (CASE WHEN phone   IS NOT NULL AND phone   != '' THEN 1 ELSE 0 END) +
          (CASE WHEN company IS NOT NULL AND company != '' THEN 1 ELSE 0 END) +
          (CASE WHEN role    IS NOT NULL AND role    != '' THEN 1 ELSE 0 END)
        ) DESC,
        -- 4. Stariji zapis → zadrži (originalni unos)
        created_at ASC
    ) AS rn
  FROM sponsor_contacts
  WHERE email IS NOT NULL AND trim(email) != ''
)
SELECT
  CASE rn WHEN 1 THEN '✓ ZADRŽI' ELSE '✗ OBRIŠI' END AS akcija,
  name,
  email,
  type,
  CASE WHEN sponsor_id IS NOT NULL THEN 'DA' ELSE 'NE' END AS ima_sponzora,
  created_at::date AS kreiran,
  id
FROM ranked
WHERE lower(trim(email)) IN (
  SELECT lower(trim(email))
  FROM sponsor_contacts
  WHERE email IS NOT NULL AND trim(email) != ''
  GROUP BY lower(trim(email))
  HAVING COUNT(*) > 1
)
ORDER BY lower(trim(email)), rn;


-- ── KORAK 2: Stvarno brisanje — odkomentiraj tek nakon što provjeriš KORAK 1 ─
/*
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY lower(trim(email))
      ORDER BY
        (CASE WHEN sponsor_id IS NOT NULL THEN 0 ELSE 1 END),
        length(coalesce(name, '')) DESC,
        (
          (CASE WHEN name    IS NOT NULL AND name    != '' THEN 1 ELSE 0 END) +
          (CASE WHEN email   IS NOT NULL AND email   != '' THEN 1 ELSE 0 END) +
          (CASE WHEN phone   IS NOT NULL AND phone   != '' THEN 1 ELSE 0 END) +
          (CASE WHEN company IS NOT NULL AND company != '' THEN 1 ELSE 0 END) +
          (CASE WHEN role    IS NOT NULL AND role    != '' THEN 1 ELSE 0 END)
        ) DESC,
        created_at ASC
    ) AS rn
  FROM sponsor_contacts
  WHERE email IS NOT NULL AND trim(email) != ''
)
DELETE FROM sponsor_contacts
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
*/
