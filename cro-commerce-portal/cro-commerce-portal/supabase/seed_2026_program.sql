-- Seed: CRO Commerce 2026 - Program sesije
-- Izvor: conference.ecommerce.hr (program, 13.10.2026.)
-- POKRENUTI SAMO ZA 2026 PROJEKT (Supabase Dashboard -> SQL Editor -> 2026 instanca)!
--
-- Mapiranje pozornica: Blackwall Stage = 'future', ManagoAI Stage = 'action',
--                      Wonderland Stage = 'wonderland', zajednicko = 'all'.
--
-- Idempotentno: brise postojeci 2026 program prije unosa (2026 je trenutno prazan).

DELETE FROM program_sessions WHERE project_id = '2026';

INSERT INTO program_sessions (time_start, time_end, stage, speaker_name, topic, session_type, sort_order, project_id) VALUES
-- Otvaranje
('08:00', '09:15', 'all',        NULL,                              'Registracija i uvodno obraćanje',                                                                              'networking',   0, '2026'),

-- 09:15 - 10:15 (Blackwall)
('09:15', '09:45', 'future',     'Dario Begonja',                   'Koji je ROI povjerenja?',                                                                                      'talk',         10, '2026'),
('09:45', '10:15', 'future',     'Ernest Antolović (Shipshape)',    'Trgovina 2030: Što će stvarati konkurentsku prednost kada svi imaju AI?',                                       'talk',         20, '2026'),

-- 10:15 - 10:45 (paralelno)
('10:15', '10:45', 'future',     'Francisco Carvalho i Ivan Čačija','Clicks Without Customers: The Hidden Cost of Bot Traffic',                                                      'panel',        30, '2026'),
('10:15', '10:45', 'wonderland', 'Valetino Mrazović (Shipshape)',   'Pametno širenje asortimana: automatizacija uvoza proizvoda od dobavljača 2.0 + AI',                             'talk',         30, '2026'),

-- Pauza
('10:45', '11:00', 'all',        NULL,                              'Pauza za kavu',                                                                                                'break',        40, '2026'),

-- 11:00 - 12:00 (paralelno)
('11:00', '11:30', 'action',     NULL,                              'Moderni marketing treba biti jednostavan: pretvorite podatke o kupcima u prihod pomoću umjetne inteligencije (Manago AI)', 'talk',   50, '2026'),
('11:00', '12:00', 'wonderland', NULL,                              'Trendovi u paymentu (Monri)',                                                                                  'panel',        50, '2026'),
('11:30', '12:00', 'action',     'Josip Vrban (Lesnina, Mall.hr)',  'Kako izgraditi brend kojem ljudi vjeruju (čak i u doba AI-a)',                                                  'panel',        60, '2026'),

-- 12:00 - 13:00 (paralelno)
('12:00', '12:30', 'future',     'Goran Tintor (Direct Media)',     'NE KUPUJEMO NAJBOLJE. KUPUJEMO NAJLAKŠE. Kako ukloniti skrivene prepreke između „želim" i „kupujem"',           'talk',         70, '2026'),
('12:00', '12:30', 'wonderland', 'Petar Šimunić (euShipments)',     'Web shop vam raste. Može li ga logistika pratiti?',                                                            'talk',         70, '2026'),
('12:30', '13:00', 'future',     'Ante Mihaljević',                 'Vaš webshop ima prodajni razgovor s kupcem. Samo ga vi ne čujete.',                                             'talk',         80, '2026'),
('12:30', '13:00', 'wonderland', NULL,                              'Od kampanje do rezultata: Što stoji iza uspješnih automatizacija? (Sales Snap)',                                'talk',         80, '2026'),

-- Ručak
('13:00', '13:45', 'all',        NULL,                              'Ručak',                                                                                                        'break',        90, '2026'),

-- 13:45 - 14:15 (paralelno)
('13:45', '14:15', 'future',     'Hrvoje Rapić',                    'Od rasta do vrijednosti: Kako skalirati eCommerce biznis i izgraditi kompaniju koja vrijedi više',              'talk',        100, '2026'),
('13:45', '14:15', 'wonderland', 'Krešo Ćorluka',                   'Najveća SEO meta studija na svijetu, ispričana u 30 minuta (i kako iste podatke iskoristiti za svoj organski promet)', 'talk', 100, '2026'),

-- 14:15 - 15:00 (paralelno)
('14:15', '15:00', 'future',     'Melita Buljan i Ivana Radan Ban', 'Panel: Nove pravne i porezne regulative',                                                                      'panel',       110, '2026'),
('14:15', '15:00', 'wonderland', NULL,                              'Panel: Black Friday',                                                                                          'panel',       110, '2026'),

-- 15:00 - 15:30 (paralelno)
('15:00', '15:30', 'future',     NULL,                              'Kako nam AI pomaže da radimo „lošije" web shopove? (Marker)',                                                   'talk',        120, '2026'),
('15:00', '15:30', 'wonderland', NULL,                              '15% + veća konverzija: Agentski AI u webshopovima iz regije — što stvarno radi, što ne, i koliko to košta? (Meraxes)', 'talk', 120, '2026'),

-- 15:30 - 16:00 (paralelno)
('15:30', '16:00', 'future',     NULL,                              'Više informacija uskoro (Sirvis)',                                                                             'talk',        130, '2026'),
('15:30', '16:00', 'wonderland', 'Dora Vukić',                      'Skriveni znakovi na putu do prodaje',                                                                          'talk',        130, '2026'),

-- 16:00 - 16:15
('16:00', '16:15', 'future',     NULL,                              'Izvlačenje nagrada (EXPO Awards tombola)',                                                                     'networking',  140, '2026'),
('16:00', '16:15', 'wonderland', NULL,                              'Pauza za kavu',                                                                                                'break',       140, '2026'),

-- Keynote
('16:30', '17:00', 'future',     'Andrija Čolak',                   'KEYNOTE: Kako se kupuju i prodaju eCommerce poslovanja – proces, valuacija i uloga business brokera',           'keynote',     150, '2026'),

-- Afterparty
('17:00', '00:00', 'all',        NULL,                              'Afterparty (powered by Shipshape)',                                                                            'networking',  160, '2026');
