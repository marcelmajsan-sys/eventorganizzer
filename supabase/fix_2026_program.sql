-- =====================================================================
-- Ispravak programa CRO Commerce 2026 (project_id = '2026')
-- Izvor istine: https://conference.ecommerce.hr (dohvaceno 10.09.2026.)
--
-- Sto je bilo krivo u bazi prije ovog skripta:
--   1) Cijeli "expert" track bio je upisan na stage 'wonderland'
--      umjesto na 'action' (Manago AI Stage).
--   2) Dvije sesije s Blackwall (Main) pozornice (11:00 ManagoAI i
--      11:30 panel "Kako izgraditi brend...") bile su na stage 'action'
--      umjesto na 'future' (Blackwall Stage).
--   3) Cijeli Wonderland Stage (talks) - 4 predavanja - nedostajao je.
--   4) Dario Begonja imao je krivi naslov ("Koji je ROI povjerenja?").
--
-- Mapiranje stage kljuceva -> UI labela:
--   future     = Blackwall Stage (Main)
--   action     = Manago AI Stage (expert)
--   wonderland = Wonderland Stage (talks)
--   all        = zajednicke stavke (registracija, pauze, afterparty)
--
-- POKRENUTI U OBA Supabase projekta (2025 i 2026):
--   Supabase Dashboard -> SQL Editor -> New query -> Run
-- =====================================================================

BEGIN;

DELETE FROM program_sessions WHERE project_id = '2026';

INSERT INTO program_sessions
  (time_start, time_end, stage, speaker_name, topic, session_type, sort_order, project_id)
VALUES
-- ---------- Zajednicko (all) ----------
('08:00', '09:15', 'all', NULL,
 'Registracija i uvodno obraćanje', 'networking', 0, '2026'),
('10:45', '11:00', 'all', NULL,
 'Pauza za kavu', 'break', 40, '2026'),
('13:00', '13:45', 'all', NULL,
 'Ručak', 'break', 90, '2026'),
('17:00', '00:00', 'all', NULL,
 'Afterparty u Mozaiku (powered by Shipshape)', 'networking', 160, '2026'),

-- ---------- Blackwall Stage / Main (future) ----------
('09:15', '09:45', 'future', 'Dario Begonja',
 'Povrat na investiciju u povjerenje: Zašto je domaćim kupcima potreban „Safe Shop” da bi kliknuli „Kupi”',
 'talk', 10, '2026'),
('09:45', '10:15', 'future', 'Ernest Antolović (Shipshape)',
 'Trgovina 2030: Što će stvarati konkurentsku prednost kada svi imaju AI?',
 'talk', 20, '2026'),
('10:15', '10:45', 'future', 'Francisco Carvalho (Blackwall) i Ivan Čačija (Fastserver)',
 'Clicks Without Customers: The Hidden Cost of Bot Traffic',
 'panel', 30, '2026'),
('11:00', '11:30', 'future', NULL,
 'Moderni marketing treba biti jednostavan: pretvorite podatke o kupcima u prihod pomoću umjetne inteligencije (Manago AI)',
 'talk', 50, '2026'),
('11:30', '12:00', 'future', 'Josip Vrban (Lesnina, Mall.hr)',
 'Panel: Kako izgraditi brend kojem ljudi vjeruju (čak i u doba AI-a)',
 'panel', 60, '2026'),
('12:00', '12:30', 'future', 'Goran Tintor',
 'NE KUPUJEMO NAJBOLJE. KUPUJEMO NAJLAKŠE. Kako ukloniti skrivene prepreke između „želim” i „kupujem”',
 'talk', 70, '2026'),
('12:30', '13:00', 'future', 'Ante Mihaljević',
 'Vaš webshop ima prodajni razgovor s kupcem. Samo ga vi ne čujete.',
 'talk', 80, '2026'),
('13:45', '14:15', 'future', 'Hrvoje Rapić',
 'Od rasta do vrijednosti: Kako skalirati eCommerce biznis i izgraditi kompaniju koja vrijedi više',
 'talk', 100, '2026'),
('14:15', '15:00', 'future', 'Melita Buljan (Carina) i Ivana Radan Ban (Ministarstvo gospodarstva)',
 'Panel: Nove pravne i porezne regulative',
 'panel', 110, '2026'),
('15:00', '15:30', 'future', NULL,
 'Kako nam AI pomaže da radimo „lošije” web shopove? (Marker)',
 'talk', 120, '2026'),
('15:30', '16:00', 'future', NULL,
 'Više informacija uskoro (Sirvis)',
 'talk', 130, '2026'),
('16:00', '16:15', 'future', NULL,
 'Izvlačenje tombole',
 'networking', 140, '2026'),
('16:30', '17:00', 'future', 'Andrija Čolak',
 'KEYNOTE: Kako se kupuju i prodaju eCommerce poslovanja – proces, valuacija i uloga business brokera',
 'keynote', 150, '2026'),

-- ---------- Manago AI Stage / expert (action) ----------
('10:15', '10:45', 'action', 'Valetino Mrazović (Shipshape)',
 'Pametno širenje asortimana: automatizacija uvoza proizvoda od dobavljača 2.0 + AI',
 'talk', 30, '2026'),
('11:00', '12:00', 'action', NULL,
 'Panel: Trendovi u paymentu (Monri)',
 'panel', 50, '2026'),
('12:00', '12:30', 'action', 'Petar Šimunić (euShipments)',
 'Web shop vam raste. Može li ga logistika pratiti?',
 'talk', 70, '2026'),
('12:30', '13:00', 'action', NULL,
 'Od kampanje do rezultata: Što stoji iza uspješnih automatizacija? (Sales Snap)',
 'talk', 80, '2026'),
('13:45', '14:15', 'action', 'Krešo Ćorluka',
 'Najveća SEO meta studija na svijetu, ispričana u 30 minuta (i kako iste podatke iskoristiti za svoj organski promet)',
 'talk', 100, '2026'),
('14:15', '15:00', 'action', NULL,
 'Panel: Black Friday',
 'panel', 110, '2026'),
('15:00', '15:30', 'action', NULL,
 '15% + veća konverzija: Agentski AI u webshopovima iz regije. Uvidi iz prakse: što stvarno radi, što ne radi i koliko to košta? (Meraxes)',
 'talk', 120, '2026'),
('15:30', '16:00', 'action', 'Dora Vukić',
 'Skriveni znakovi na putu do prodaje',
 'talk', 130, '2026'),
('16:00', '16:15', 'action', NULL,
 'Pauza za kavu',
 'break', 140, '2026'),

-- ---------- Wonderland Stage / talks (wonderland) ----------
('10:15', '10:45', 'wonderland', 'Miro Antonijević, Slaven Mišak',
 'Imaju li smisla AI Agenti na web shopu?',
 'talk', 30, '2026'),
('11:00', '11:30', 'wonderland', 'Davor Španić, Ivica Kruhek i Tomislav Bilić',
 'Webshopovi i platforme. Evergreen tema.',
 'panel', 50, '2026'),
('12:00', '12:30', 'wonderland', 'Ivan Tanasković i Aleksandar Ašković',
 'I kako da (trgovci) uspiju na ovom užasnom internetu?',
 'talk', 70, '2026'),
('12:30', '13:00', 'wonderland', 'Marko Barović',
 'Kako transformirati HoReCa biznis u 2026. godini?',
 'talk', 80, '2026');

COMMIT;

-- Provjera nakon pokretanja:
-- SELECT stage, time_start, time_end, speaker_name, topic
-- FROM program_sessions WHERE project_id = '2026'
-- ORDER BY stage, sort_order;
