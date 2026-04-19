-- Seed: kontakti sponzora iz taba "Obećano sponzorima 2025"
-- Pokreni samo na 2025 projektu!
-- Briše postojeće i insertira sve ispočetka s ispravcima.

DELETE FROM sponsor_contacts;

INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ana Vuksanovic', 'ana.vuksanovic@monri.com', 'contact' FROM sponsors WHERE name ILIKE '%monri%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marina Kostkova', 'marina.kostkova@vivnetworks.com', 'contact' FROM sponsors WHERE name ILIKE '%vivnetworks%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Arpad Neveri', 'arpad.neveri@decta.com', 'contact' FROM sponsors WHERE name ILIKE '%decta%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ivica', 'ivica@marker.hr', 'contact' FROM sponsors WHERE name ILIKE '%marker%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Xdu', 'xdu@xxxlesnina.hr', 'contact' FROM sponsors WHERE name ILIKE '%lesnina%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ivan Bozic', 'ivan.bozic@humananova.org', 'contact' FROM sponsors WHERE name ILIKE '%humana%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Igor Roth', 'Igor.Roth@cewe.hr', 'contact' FROM sponsors WHERE name ILIKE '%cewe%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Dino Schatzl', 'dino.schatzl@coreline.agency', 'contact' FROM sponsors WHERE name ILIKE '%hero%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Jelena Kukret', 'jelena.kukret@seyfor.hr', 'contact' FROM sponsors WHERE name ILIKE '%seyfor%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Domagoj', 'domagoj@lloyds-digital.com', 'contact' FROM sponsors WHERE name ILIKE '%lloyd%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Matej', 'Matej@pickpack.hr', 'contact' FROM sponsors WHERE name ILIKE '%pickpack%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marija Vujovic', 'marija.vujovic@favi.hr', 'contact' FROM sponsors WHERE name ILIKE '%favi%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Miroslav Mares', 'Miroslav.Mares@boxnow.hr', 'contact' FROM sponsors WHERE name ILIKE '%boxnow%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'I. Bene', 'I.Bene@overseas.hr', 'contact' FROM sponsors WHERE name ILIKE '%overseas%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Demi Stamenkovic', 'demi.stamenkovic@dpd.si', 'contact' FROM sponsors WHERE name ILIKE '%dpd%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Jmartic', 'jmartic@mbe.hr', 'contact' FROM sponsors WHERE name ILIKE '%mbe%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Kristina Kovacic', 'kristina.kovacic@bijelic-co.hr', 'contact' FROM sponsors WHERE name ILIKE '%elfbar%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Tamara Breberina', 'Tamara.Breberina@hr.nestle.com', 'contact' FROM sponsors WHERE name ILIKE '%nestl%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marija Skojo', 'marija.skojo@atlanticgrupa.com', 'contact' FROM sponsors WHERE name ILIKE '%atlantic%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Iva Ramicsvec', 'iva.ramicsvec@atlanticgrupa.com', 'contact' FROM sponsors WHERE name ILIKE '%atlantic%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marija Zdovc', 'Marija.Zdovc@gls-croatia.com', 'contact' FROM sponsors WHERE name ILIKE '%gls%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Josipa Laus', 'josipa.laus@tim360.hr', 'contact' FROM sponsors WHERE name ILIKE '%selectbox%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Anton Debeljuh', 'anton.debeljuh@gwconsulting.hr', 'contact' FROM sponsors WHERE name ILIKE '%goodwill%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Stisma', 'stisma@byterunner-services.com', 'contact' FROM sponsors WHERE name ILIKE '%byterunner%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Martina Suhajova', 'martina.suhajova@packeta.com', 'contact' FROM sponsors WHERE name ILIKE '%packeta%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Calin Soplantai', 'calin.soplantai@packeta.com', 'contact' FROM sponsors WHERE name ILIKE '%packeta%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Alfie', 'alfie@mobilemoxie.com', 'contact' FROM sponsors WHERE name ILIKE '%moxie%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Vedran V', 'vedran.v@mater.agency', 'contact' FROM sponsors WHERE name ILIKE '%euroart%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Nina Maurovic', 'nina.maurovic@dssmith.com', 'contact' FROM sponsors WHERE name ILIKE '%dssmith%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Veljko', 'veljko@plus.hr', 'contact' FROM sponsors WHERE name ILIKE '%veljko%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ernest', 'ernest@shipshape.hr', 'contact' FROM sponsors WHERE name ILIKE '%shipshape%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marko Marinsek', 'marko.marinsek.external@worldline.com', 'contact' FROM sponsors WHERE name ILIKE '%worldline%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'V Savitska', 'v.savitska@epicentrk.ua', 'contact' FROM sponsors WHERE name ILIKE '%epicentrk%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Thomas Bloch', 'thomas.bloch@parcel4you.com', 'contact' FROM sponsors WHERE name ILIKE '%parcel4you%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ales Nepivoda', 'ales.nepivoda@brandtestingclub.com', 'contact' FROM sponsors WHERE name ILIKE '%brandtesting%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Lidvin Melinda', 'lidvin.melinda@posta.hu', 'contact' FROM sponsors WHERE name ILIKE '%posta%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'MarkovicD', 'MarkovicD@dnb.com', 'contact' FROM sponsors WHERE name ILIKE '%hoovers%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Office', 'office@fairylandhealth.com', 'contact' FROM sponsors WHERE name ILIKE '%prolom%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Andrii Bruhal', 'andrii.bruhal@cartum.io', 'contact' FROM sponsors WHERE name ILIKE '%cartum%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Jura', 'jura@automatic-servis.hr', 'contact' FROM sponsors WHERE name ILIKE '%lavazza%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marko Bogdan', 'marko.bogdan@intercapital.hr', 'contact' FROM sponsors WHERE name ILIKE '%intercapital%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marko', 'marko@robotiq.ai', 'contact' FROM sponsors WHERE name ILIKE '%robotiq%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Lovin Ugostiteljstvo', 'lovin.ugostiteljstvo@gmail.com', 'contact' FROM sponsors WHERE name ILIKE '%lovin%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Bilikova', 'bilikova@dotidot.io', 'contact' FROM sponsors WHERE name ILIKE '%dotidot%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Dobromir', 'dobromir@aiployees.com', 'contact' FROM sponsors WHERE name ILIKE '%aiployees%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Petar Pavic', 'petar.pavic@stardigitalgroup.com', 'contact' FROM sponsors WHERE name ILIKE '%linker%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Goran Udosic', 'goran.udosic@bind.hr', 'contact' FROM sponsors WHERE name ILIKE '%bind%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Dragan Maga', 'dragan.maga@b2bintersales.com', 'contact' FROM sponsors WHERE name ILIKE '%intersales%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ivan Kosutic', 'ivan.kosutic@m1.rs', 'contact' FROM sponsors WHERE name ILIKE '%sales%snap%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Toni', 'toni@agilo.com', 'contact' FROM sponsors WHERE name ILIKE '%agilo%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Info', 'info@totebot.ai', 'contact' FROM sponsors WHERE name ILIKE '%totebot%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Gsanni', 'gsanni@tgndata.com', 'contact' FROM sponsors WHERE name ILIKE '%tgndata%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Tilen Terbuc', 'tilen.terbuc@heureka.group', 'contact' FROM sponsors WHERE name ILIKE '%jeftinije%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Petra', 'petra@nexios.cc', 'contact' FROM sponsors WHERE name ILIKE '%nexios%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Tomislav', 'tomislav@inchoo.net', 'contact' FROM sponsors WHERE name ILIKE '%inchoo%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Alen Besic', 'alen.besic@praella.com', 'contact' FROM sponsors WHERE name ILIKE '%praella%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Ivan Blaskovic', 'ivan.blaskovic@frigo-ve.hr', 'contact' FROM sponsors WHERE name ILIKE '%frigo%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Mateja', 'mateja@drap.hr', 'contact' FROM sponsors WHERE name ILIKE '%drap%' LIMIT 1;
INSERT INTO sponsor_contacts (sponsor_id, name, email, type) SELECT id, 'Marija Kovac', 'marija.kovac@rhea.hr', 'contact' FROM sponsors WHERE name ILIKE '%ups%' LIMIT 1;

-- Provjera: koliko kontakata je insertirano i za koje sponzore
SELECT s.name AS sponzor, COUNT(sc.id) AS broj_kontakata
FROM sponsors s
LEFT JOIN sponsor_contacts sc ON sc.sponsor_id = s.id
GROUP BY s.name
HAVING COUNT(sc.id) > 0
ORDER BY s.name;
