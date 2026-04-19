-- =============================================
-- Medijski partneri 2025 — seed
-- =============================================

-- PART 1: Insert media sponsor entries

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Telegram', 'Medijski', 'pending', 'petra.velijevic@telegram.hr', 'Petra Velijevic'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Telegram');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Index', 'Medijski', 'pending', 'daria.zalovic@index.hr', 'Daria Zalovic'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Index');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Večernji list', 'Medijski', 'pending', 'antonela.radman@vecernji.net', 'Antonela Radman'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Večernji%' OR name ILIKE 'Vecernji%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Jutarnji list', 'Medijski', 'pending', 'jozo.vrdoljak@hanzamedia.hr', 'Jozo Vrdoljak'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Jutarnji%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Poslovni dnevnik', 'Medijski', 'pending', 'marko.sorsa@poslovni.hr', 'Marko Sorsa'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Poslovni dnevnik');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Lider', 'Medijski', 'pending', 'kresimir.grgic@lidermedia.hr', 'Krešimir Grgić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Lider');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT '24sata', 'Medijski', 'pending', 'nensi.tomac@24sata.hr', 'Nensi Tomac'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '24sata');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Zimo', 'Medijski', 'pending', 'martina.cizmic@gmail.com', 'Martina Čizmić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Zimo');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'RTL', 'Medijski', 'pending', 'nino.stambuk@rtl.hr', 'Nino Štambuk'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'RTL');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'tportal', 'Medijski', 'pending', 'lucija.spiljak@t.ht.hr', 'Lucija Spiljak'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'tportal');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'klik.hr', 'Medijski', 'pending', 'andreja@morgangreyagency.com', 'Andreja'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'klik.hr');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Nacional', 'Medijski', 'pending', 'sanja.pljesa@nacional.hr', 'Sanja Plješa'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Nacional');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Bug', 'Medijski', 'pending', 'vinko.kristic@bug.hr', 'Vinko Krištić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Bug');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Vidi', 'Medijski', 'pending', 'tkotnik@vidi.hr', 'Tomislav Kotnik'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Vidi');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'IT Biz Crunch', 'Medijski', 'pending', 'vidi@vidi.hr', 'IT Biz Crunch redakcija'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'IT Biz Crunch');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Women in Adria', 'Medijski', 'pending', 'ivana@womeninadria.com', 'Ivana'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Women%Adria' OR name ILIKE 'Womeninadria');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Moj Novac', 'Medijski', 'pending', 'kristina@zaokret.com', 'Kristina Ercegović'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Moj Novac');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Ja TRGOVAC', 'Medijski', 'pending', 'maroje@jatrgovac.hr', 'Maroje Sabljić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Ja TRGOVAC' OR name ILIKE 'jatrgovac');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Znatko', 'Medijski', 'pending', 'desk@znatko.com', 'Željka Barišić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Znatko');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Netokracija', 'Medijski', 'pending', 'nikolina@netokracija.com', 'Nikolina Oršulić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Netokracija');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Glas Poduzetnika', 'Medijski', 'pending', 'branka@glaspoduzetnika.hr', 'Branka Prišlić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Glas Poduzetnika');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'InStore', 'Medijski', 'pending', 'jelena@b2bmedia.org', 'Jelena'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'InStore' OR name ILIKE 'Instore');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Progressive magazin', 'Medijski', 'pending', 'marija@crier.hr', 'Marija'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Progressive%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'eCommerce News EU', 'Medijski', 'pending', 'pleuni@ecommercenews.eu', 'Pleuni'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'ecommercenews%' OR name ILIKE 'eCommerce News%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'CroPC.net', 'Medijski', 'pending', 'info@cropc.net', 'CroPC redakcija'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'CroPC%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'After5', 'Medijski', 'pending', 'matea@after5.hr', 'Matea Salopek-Koncul'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'After5');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Zagreb.info', 'Medijski', 'pending', 'marija.dekanic@motus-media.hr', 'Marija Dekanić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Zagreb.info');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Dnevno.hr', 'Medijski', 'pending', 'sanja.kvastek@motus-media.hr', 'Sanja Kvastek'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Dnevno.hr');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Direktno.hr', 'Medijski', 'pending', 'daniela@direktno.hr', 'Daniela Klujbert'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Direktno%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'N1', 'Medijski', 'pending', 'miroslav.filipovic@n1info.com', 'Miroslav Filipović'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'N1');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Forbes Hrvatska', 'Medijski', 'pending', 'bojan.bajgoricsantic@novatv.hr', 'Bojan Bajgorić Šantić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Forbes%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Mamager', 'Medijski', 'pending', 'blanka.kovacec@mamager.hr', 'Blanka Kovačec'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Mamager');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Yammat', 'Medijski', 'pending', 'marketing@yammat.fm', 'Yammat marketing'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Yammat');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Otvoreni Radio', 'Medijski', 'pending', 'dario.topic@otvoreni.hr', 'Dario Topić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Otvoreni Radio');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Top Radio', 'Medijski', 'pending', 'urednistvo@topradio.hr', 'Top Radio uredništvo'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Top Radio');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Novi Milenij', 'Medijski', 'pending', 'bozidar.zitnik@novimilenij.eu', 'Božidar Žitnik'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Novi Milenij');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'eMedjimurje / Varaždinski', 'Medijski', 'pending', 'ksenija@inpromocija.hr', 'Ksenija'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'eMedjimurje%' OR name ILIKE 'Varazdinski%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Nabava.net', 'Medijski', 'pending', 'petra.starzik@nabava.net', 'Petra Staržik'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Nabava.net');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Zagorje International', 'Medijski', 'pending', 'antonio@zagorje-international.hr', 'Antonio Poslon'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Zagorje International');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Kajkavske kronike', 'Medijski', 'pending', '', 'Dorotea Sedlar'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Kajkavske kronike');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Bloomberg Adria', 'Medijski', 'pending', 'marta.premuzak@bloombergadria.com', 'Marta Premužak'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Bloomberg%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'HRT', 'Medijski', 'pending', 'novimediji@hrt.hr', 'Ivana Božanić'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'HRT');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Novi List', 'Medijski', 'pending', 'marketing@novilist.hr', 'Novi List marketing'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Novi List');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Dalmatinski portal', 'Medijski', 'pending', 'info@dalmatinskiportal.hr', 'Dalmatinski portal'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Dalmatinski portal');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Narod.hr', 'Medijski', 'pending', 'marketing@narod.hr', 'Narod.hr marketing'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Narod.hr');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Glas Istre', 'Medijski', 'pending', 'marketing@glasistre.hr', 'Glas Istre marketing'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Glas Istre');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Novo.hr', 'Medijski', 'pending', 'novo@novo.hr', 'Dragan Bacinger'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Novo.hr');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Profitiraj.hr', 'Medijski', 'pending', 'ljubica.juric@mms.hr', 'Ljubica Jurič'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Profitiraj%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Poslovni turizam', 'Medijski', 'pending', 'daniela@poslovniturizam.com', 'Daniela Kos'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Poslovni turizam');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Navidiku.rs', 'Medijski', 'pending', 'office@navidiku.rs', 'Milan Mijatović'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Navidiku%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Hrvatski radio', 'Medijski', 'pending', 'ivica.kristo@hrt.hr', 'Ivica Krišto'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Hrvatski radio');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Mirakul Edukacijski centar', 'Medijski', 'pending', 'kresimir.simac@mirakul.hr', 'Krešimir Šimac'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Mirakul%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'ICTbusiness.info', 'Medijski', 'pending', 'info@ictbusiness.info', 'ICTbusiness redakcija'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'ICTbusiness%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'eCommerce Bridge Europe', 'Medijski', 'pending', 'simcikova@ecommercebridge.com', 'Katarína Šimčíková'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'eCommerce Bridge%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Prava klima', 'Medijski', 'pending', 'ivan.blaskovic@frigo-ve.hr', 'Ivan Blašković'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Prava klima');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'eCommerce asocijacija BiH', 'Medijski', 'pending', 'belma@e-comm.ba', 'Belma'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'eCommerce asocijacija BiH');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'eCommerce Asocijacija Srbije', 'Medijski', 'pending', 'ivan.tanaskovic@ecommserbia.org', 'Ivan Tanasković'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'eCommerce Asocijacija Srbije');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Macedonian eCommerce Association', 'Medijski', 'pending', 'viktor@ecommerce.mk', 'Viktor Stojkoski'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Macedonian%eCommerce%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Poslovni FM', 'Medijski', 'pending', 'darko@poslovnifm.com', 'Darko Buković'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Poslovni FM');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Jeftinije.hr', 'Medijski', 'pending', 'tilen.terbuc@heureka.group', 'Tilen Terbuc'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Jeftinije%');

INSERT INTO sponsors (name, package_type, payment_status, contact_email, contact_name)
SELECT 'Kontra', 'Medijski', 'pending', 'ilija.brajkovic@kontra.agency', 'Ilija Brajković'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'Kontra');

-- =============================================
-- PART 2: Insert sponsor_contacts
-- Pattern: link by sponsor name ILIKE
-- =============================================

-- Telegram
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Petra Velijevic', 'petra.velijevic@telegram.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Telegram'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'petra.velijevic@telegram.hr');

-- Index
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Daria Zalović', 'daria.zalovic@index.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Index'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'daria.zalovic@index.hr');

-- Večernji list
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Antonela Radman', 'antonela.radman@vecernji.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'Večernji%' OR s.name ILIKE 'Vecernji%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'antonela.radman@vecernji.net');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dražen Novak', 'drazen.novak@vecernji.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'Večernji%' OR s.name ILIKE 'Vecernji%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'drazen.novak@vecernji.net');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dario Markas', 'dario.markas@vecernji.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'Večernji%' OR s.name ILIKE 'Vecernji%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'dario.markas@vecernji.net');

-- Jutarnji list
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Jozo Vrdoljak', 'jozo.vrdoljak@hanzamedia.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Jutarnji%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'jozo.vrdoljak@hanzamedia.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Karla Zupičić', 'karla.zupicic@hanzamedia.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Jutarnji%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'karla.zupicic@hanzamedia.hr');

-- Poslovni dnevnik
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Marko Sorsa', 'marko.sorsa@poslovni.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Poslovni dnevnik'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marko.sorsa@poslovni.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Mladen Miletić', 'mladen.miletic@poslovni.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Poslovni dnevnik'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'mladen.miletic@poslovni.hr');

-- Lider
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Krešimir Grgić', 'kresimir.grgic@lidermedia.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Lider'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'kresimir.grgic@lidermedia.hr');

-- 24sata
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Nensi Tomac', 'nensi.tomac@24sata.hr', 'contact' FROM sponsors s WHERE s.name ILIKE '24sata'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'nensi.tomac@24sata.hr');

-- Zimo
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Martina Čizmić', 'martina.cizmic@gmail.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Zimo'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'martina.cizmic@gmail.com');

-- RTL
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Nino Štambuk', 'nino.stambuk@rtl.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'RTL'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'nino.stambuk@rtl.hr');

-- tportal
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Lucija Spiljak', 'lucija.spiljak@t.ht.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'tportal'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'lucija.spiljak@t.ht.hr');

-- klik.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Andreja', 'andreja@morgangreyagency.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'klik.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'andreja@morgangreyagency.com');

-- Nacional
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Nacional redakcija', 'nacional@nacional.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Nacional'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'nacional@nacional.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Tamara Borić', 'tamara.boric@nacional.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Nacional'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'tamara.boric@nacional.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Sanja Plješa', 'sanja.pljesa@nacional.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Nacional'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'sanja.pljesa@nacional.hr');

-- Bug
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Vinko Krištić', 'vinko.kristic@bug.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Bug'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'vinko.kristic@bug.hr');

-- Vidi
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Tomislav Kotnik', 'tkotnik@vidi.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Vidi'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'tkotnik@vidi.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Sanja Kapetanović', 'skapetanovic@vidi.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Vidi'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'skapetanovic@vidi.hr');

-- IT Biz Crunch
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'IT Biz Crunch redakcija', 'vidi@vidi.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'IT Biz Crunch'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'vidi@vidi.hr');

-- Women in Adria
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivana', 'ivana@womeninadria.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Women%Adria' OR s.name ILIKE 'Womeninadria'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivana@womeninadria.com');

-- Moj Novac
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Kristina Ercegović', 'kristina@zaokret.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Moj Novac'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'kristina@zaokret.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Lucija', 'lucija@zaokret.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Moj Novac'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'lucija@zaokret.com');

-- Ja TRGOVAC
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Maroje Sabljić', 'maroje@jatrgovac.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Ja TRGOVAC'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'maroje@jatrgovac.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Marija', 'marija@jatrgovac.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Ja TRGOVAC'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marija@jatrgovac.hr');

-- Znatko
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Željka Barišić', 'desk@znatko.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Znatko'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'desk@znatko.com');

-- Netokracija
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Nikolina Oršulić', 'nikolina@netokracija.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Netokracija'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'nikolina@netokracija.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Mia Biberović', 'mia@netokracija.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Netokracija'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'mia@netokracija.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Liliana Božić', 'liliana@netokracija.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Netokracija'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'liliana@netokracija.com');

-- Glas Poduzetnika
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Branka Prišlić', 'branka@glaspoduzetnika.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Glas Poduzetnika'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'branka@glaspoduzetnika.hr');

-- InStore
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Jelena', 'jelena@b2bmedia.org', 'contact' FROM sponsors s WHERE s.name ILIKE 'InStore'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'jelena@b2bmedia.org');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Veronika', 'veronika@b2bmedia.org', 'contact' FROM sponsors s WHERE s.name ILIKE 'InStore'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'veronika@b2bmedia.org');

-- Progressive magazin
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Marija', 'marija@crier.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Progressive%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marija@crier.hr');

-- eCommerce News EU
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Pleuni', 'pleuni@ecommercenews.eu', 'contact' FROM sponsors s WHERE s.name ILIKE 'eCommerce News%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'pleuni@ecommercenews.eu');

-- CroPC.net
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'CroPC redakcija', 'info@cropc.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'CroPC%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'info@cropc.net');

-- After5
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Matea Salopek-Koncul', 'matea@after5.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'After5'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'matea@after5.hr');

-- Zagreb.info
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Marija Dekanić', 'marija.dekanic@motus-media.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Zagreb.info'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marija.dekanic@motus-media.hr');

-- Dnevno.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Sanja Kvastek', 'sanja.kvastek@motus-media.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Dnevno.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'sanja.kvastek@motus-media.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Motus marketing', 'marketing@motus-media.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Dnevno.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@motus-media.hr');

-- Direktno.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Daniela Klujbert', 'daniela@direktno.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Direktno%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'daniela@direktno.hr');

-- N1
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Miroslav Filipović', 'miroslav.filipovic@n1info.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'N1'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'miroslav.filipovic@n1info.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivan Gale', 'ivan.gale@n1info.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'N1'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivan.gale@n1info.com');

-- Forbes Hrvatska
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Bojan Bajgorić Šantić', 'bojan.bajgoricsantic@novatv.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Forbes%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'bojan.bajgoricsantic@novatv.hr');

-- Mamager
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dora Sertić', 'redakcija@mamager.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Mamager'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'redakcija@mamager.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Blanka Kovačec', 'blanka.kovacec@mamager.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Mamager'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'blanka.kovacec@mamager.hr');

-- Yammat
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Yammat marketing', 'marketing@yammat.fm', 'contact' FROM sponsors s WHERE s.name ILIKE 'Yammat'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@yammat.fm');

-- Otvoreni Radio
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Otvoreni marketing', 'marketing@otvoreni.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Otvoreni Radio'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@otvoreni.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dario Topić', 'dario.topic@otvoreni.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Otvoreni Radio'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'dario.topic@otvoreni.hr');

-- Top Radio
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Top Radio uredništvo', 'urednistvo@topradio.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Top Radio'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'urednistvo@topradio.hr');

-- Novi Milenij
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Božidar Žitnik', 'bozidar.zitnik@novimilenij.eu', 'contact' FROM sponsors s WHERE s.name ILIKE 'Novi Milenij'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'bozidar.zitnik@novimilenij.eu');

-- eMedjimurje / Varaždinski
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ksenija', 'ksenija@inpromocija.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'eMedjimurje%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ksenija@inpromocija.hr');

-- Nabava.net
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Petra Staržik', 'petra.starzik@nabava.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'Nabava.net'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'petra.starzik@nabava.net');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Šime Essert', 'sime.essert@nabava.net', 'contact' FROM sponsors s WHERE s.name ILIKE 'Nabava.net'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'sime.essert@nabava.net');

-- Zagorje International
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Antonio Poslon', 'antonio@zagorje-international.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Zagorje International'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'antonio@zagorje-international.hr');

-- Bloomberg Adria
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Marta Premužak', 'marta.premuzak@bloombergadria.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Bloomberg%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marta.premuzak@bloombergadria.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Aida Šehović', 'aida.sehovic@bloombergadria.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Bloomberg%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'aida.sehovic@bloombergadria.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivana Lacković', 'ivana.lackovic@bloombergadria.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Bloomberg%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivana.lackovic@bloombergadria.com');

-- HRT
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'HRT novi mediji', 'novimediji@hrt.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'HRT'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'novimediji@hrt.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'HRT komunikacije', 'komunikacije@hrt.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'HRT'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'komunikacije@hrt.hr');

-- Novi List
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Novi List marketing', 'marketing@novilist.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Novi List'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@novilist.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Novi List portal', 'portal@novilist.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Novi List'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'portal@novilist.hr');

-- Dalmatinski portal
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dalmatinski portal', 'info@dalmatinskiportal.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Dalmatinski portal'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'info@dalmatinskiportal.hr');

-- Narod.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Narod.hr marketing', 'marketing@narod.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Narod.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@narod.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Narod.hr info', 'info@narod.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Narod.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'info@narod.hr');

-- Glas Istre
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Glas Istre marketing', 'marketing@glasistre.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Glas Istre'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'marketing@glasistre.hr');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Glas Istre uredništvo', 'urednistvo@glasistre.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Glas Istre'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'urednistvo@glasistre.hr');

-- Novo.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Dragan Bacinger', 'novo@novo.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Novo.hr'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'novo@novo.hr');

-- Profitiraj.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ljubica Jurič', 'ljubica.juric@mms.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Profitiraj%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ljubica.juric@mms.hr');

-- Poslovni turizam
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Daniela Kos', 'daniela@poslovniturizam.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Poslovni turizam'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'daniela@poslovniturizam.com');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ana Remenar', 'ana@poslovniturizam.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Poslovni turizam'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ana@poslovniturizam.com');

-- Navidiku.rs
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Navidiku redakcija', 'office@navidiku.rs', 'contact' FROM sponsors s WHERE s.name ILIKE 'Navidiku%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'office@navidiku.rs');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Milan Mijatović', 'milan.mijatovic@nr.rs', 'contact' FROM sponsors s WHERE s.name ILIKE 'Navidiku%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'milan.mijatovic@nr.rs');

-- Hrvatski radio
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivica Krišto', 'ivica.kristo@hrt.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Hrvatski radio'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivica.kristo@hrt.hr');

-- Mirakul
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Krešimir Šimac', 'kresimir.simac@mirakul.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Mirakul%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'kresimir.simac@mirakul.hr');

-- ICTbusiness.info
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'ICTbusiness info', 'info@ictbusiness.info', 'contact' FROM sponsors s WHERE s.name ILIKE 'ICTbusiness%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'info@ictbusiness.info');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'ICTbusiness uredništvo', 'urednistvo@ictbusiness.info', 'contact' FROM sponsors s WHERE s.name ILIKE 'ICTbusiness%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'urednistvo@ictbusiness.info');

-- eCommerce Bridge Europe
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Katarína Šimčíková', 'simcikova@ecommercebridge.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'eCommerce Bridge%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'simcikova@ecommercebridge.com');

-- Prava klima
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivan Blašković', 'ivan.blaskovic@frigo-ve.hr', 'contact' FROM sponsors s WHERE s.name ILIKE 'Prava klima'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivan.blaskovic@frigo-ve.hr');

-- eCommerce asocijacija BiH
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Belma', 'belma@e-comm.ba', 'contact' FROM sponsors s WHERE s.name ILIKE 'eCommerce asocijacija BiH'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'belma@e-comm.ba');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ajla Kapetanović', 'ajla.kapetanovic@e-comm.ba', 'contact' FROM sponsors s WHERE s.name ILIKE 'eCommerce asocijacija BiH'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ajla.kapetanovic@e-comm.ba');

-- eCommerce Asocijacija Srbije
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ivan Tanasković', 'ivan.tanaskovic@ecommserbia.org', 'contact' FROM sponsors s WHERE s.name ILIKE 'eCommerce Asocijacija Srbije'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ivan.tanaskovic@ecommserbia.org');

-- Macedonian eCommerce Association
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Viktor Stojkoski', 'viktor@ecommerce.mk', 'contact' FROM sponsors s WHERE s.name ILIKE 'Macedonian%eCommerce%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'viktor@ecommerce.mk');

INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Bojana Gjorgjieva', 'bojana@ecommerce.mk', 'contact' FROM sponsors s WHERE s.name ILIKE 'Macedonian%eCommerce%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'bojana@ecommerce.mk');

-- Poslovni FM
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Darko Buković', 'darko@poslovnifm.com', 'contact' FROM sponsors s WHERE s.name ILIKE 'Poslovni FM'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'darko@poslovnifm.com');

-- Jeftinije.hr
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Tilen Terbuc', 'tilen.terbuc@heureka.group', 'contact' FROM sponsors s WHERE s.name ILIKE 'Jeftinije%'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'tilen.terbuc@heureka.group');

-- Kontra
INSERT INTO sponsor_contacts (sponsor_id, name, email, type)
SELECT s.id, 'Ilija Brajković', 'ilija.brajkovic@kontra.agency', 'contact' FROM sponsors s WHERE s.name ILIKE 'Kontra'
AND NOT EXISTS (SELECT 1 FROM sponsor_contacts sc WHERE sc.sponsor_id = s.id AND sc.email ILIKE 'ilija.brajkovic@kontra.agency');

-- Diagnostic
SELECT s.name, COUNT(sc.id) AS contacts
FROM sponsors s
LEFT JOIN sponsor_contacts sc ON sc.sponsor_id = s.id
WHERE s.package_type = 'Medijski'
GROUP BY s.name
ORDER BY s.name;
