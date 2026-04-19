-- Seed: dodavanje sponzora koji nedostaju u bazi (2025 projekt)
-- Pokreni PRIJE seed_2025_contacts.sql
-- Preskače sponzore koji već postoje (WHERE NOT EXISTS).

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'CEWE', 'Brončani', 'Igor Roth', 'Igor.Roth@cewe.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%cewe%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Hero Factory', 'Brončani', 'Dino Schatzl', 'dino.schatzl@coreline.agency', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%hero%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Favi', 'Brončani', 'Marija Vujovic', 'marija.vujovic@favi.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%favi%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Overseas', 'Brončani', 'I. Bene', 'I.Bene@overseas.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%overseas%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'ELFBAR', 'Srebrni', 'Kristina Kovacic', 'kristina.kovacic@bijelic-co.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%elfbar%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'NESTLE', 'Community', 'Tamara Breberina', 'Tamara.Breberina@hr.nestle.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%nestl%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'ATLANTIC GRUPA', 'Brončani', 'Marija Skojo', 'marija.skojo@atlanticgrupa.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%atlantic%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Selectbox', 'Brončani', 'Josipa Laus', 'josipa.laus@tim360.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%selectbox%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Byterunner Services', 'Zlatni', 'Stisma', 'stisma@byterunner-services.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%byterunner%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Packeta', 'Brončani', 'Martina Suhajova', 'martina.suhajova@packeta.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%packeta%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Mobile Moxie', 'Brončani', 'Alfie', 'alfie@mobilemoxie.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%moxie%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Euroart', 'Brončani', 'Vedran V', 'vedran.v@mater.agency', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%euroart%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'DSSMITH', 'Srebrni', 'Nina Maurovic', 'nina.maurovic@dssmith.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%dssmith%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Veljko Plus i Partneri', 'Brončani', 'Veljko', 'veljko@plus.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%veljko%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Worldline', 'Brončani', 'Marko Marinsek', 'marko.marinsek.external@worldline.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%worldline%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Epicentrk', 'Srebrni', 'V Savitska', 'v.savitska@epicentrk.ua', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%epicentrk%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Parcel4you', 'Srebrni', 'Thomas Bloch', 'thomas.bloch@parcel4you.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%parcel4you%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Brandtestingclub', 'Brončani', 'Ales Nepivoda', 'ales.nepivoda@brandtestingclub.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%brandtesting%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Posta.hu', 'Brončani', 'Lidvin Melinda', 'lidvin.melinda@posta.hu', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%posta%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'D&B Hoovers', 'Brončani', 'MarkovicD', 'MarkovicD@dnb.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%hoovers%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Prolom Voda', 'Brončani', 'Office', 'office@fairylandhealth.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%prolom%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Cartum.io', 'Brončani', 'Andrii Bruhal', 'andrii.bruhal@cartum.io', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%cartum%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Lavazza Kava', 'Brončani', 'Jura', 'jura@automatic-servis.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%lavazza%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Intercapital', 'Brončani', 'Marko Bogdan', 'marko.bogdan@intercapital.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%intercapital%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Robotiq.ai', 'Brončani', 'Marko', 'marko@robotiq.ai', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%robotiq%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Lovin.hr', 'Brončani', 'Lovin Ugostiteljstvo', 'lovin.ugostiteljstvo@gmail.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%lovin%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Dotidot', 'Brončani', 'Bilikova', 'bilikova@dotidot.io', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%dotidot%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Linker', 'Brončani', 'Petar Pavic', 'petar.pavic@stardigitalgroup.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%linker%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'B2B Intersales', 'Brončani', 'Dragan Maga', 'dragan.maga@b2bintersales.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%intersales%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Sales Snap', 'Brončani', 'Ivan Kosutic', 'ivan.kosutic@m1.rs', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%sales%snap%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'AGILO', 'Brončani', 'Toni', 'toni@agilo.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%agilo%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'TOTEBOT', 'Brončani', 'Info', 'info@totebot.ai', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%totebot%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'TGNDATA', 'Brončani', 'Gsanni', 'gsanni@tgndata.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%tgndata%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Jeftinije.hr', 'Brončani', 'Tilen Terbuc', 'tilen.terbuc@heureka.group', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%jeftinije%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'NEXIOS', 'Srebrni', 'Petra', 'petra@nexios.cc', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%nexios%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Praella', 'Srebrni', 'Alen Besic', 'alen.besic@praella.com', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%praella%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Frigo', 'Brončani', 'Ivan Blaskovic', 'ivan.blaskovic@frigo-ve.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%frigo%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'Drap', 'Brončani', 'Mateja', 'mateja@drap.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE '%drap%');

INSERT INTO sponsors (name, package_type, contact_name, contact_email, payment_status)
SELECT 'UPS', 'Brončani', 'Marija Kovac', 'marija.kovac@rhea.hr', 'pending'
WHERE NOT EXISTS (SELECT 1 FROM sponsors WHERE name ILIKE 'ups');

-- Provjera: koliko sponzora je u bazi sada
SELECT COUNT(*) AS ukupno_sponzora FROM sponsors;
