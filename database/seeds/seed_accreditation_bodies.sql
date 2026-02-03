-- Seed: Accreditation Bodies
-- Description: Insert default accreditation bodies (ABET, NBA, etc.)

INSERT INTO accreditation_bodies (name, acronym, country, website, description, is_active) VALUES
-- ABET - Accreditation Board for Engineering and Technology (USA)
('Accreditation Board for Engineering and Technology', 'ABET', 'United States', 'https://www.abet.org/', 
'ABET is a nonprofit, non-governmental organization that accredits college and university programs in applied and natural science, computing, engineering, and engineering technology.', 
TRUE),

-- NBA - National Board of Accreditation (India)
('National Board of Accreditation', 'NBA', 'India', 'https://www.nbaind.org/', 
'NBA is the apex body for accreditation of technical education programs in India. It is an autonomous body under the National Assessment and Accreditation Council (NAAC).', 
TRUE),

-- EUR-ACE - European Accredited Engineer
('European Accredited Engineer', 'EUR-ACE', 'European Union', 'https://www.enaee.eu/', 
'EUR-ACE is a European quality label for engineering degree programmes at Bachelor and Master level. It is awarded by ENAEE authorized agencies.', 
TRUE),

-- NAAC - National Assessment and Accreditation Council (India)
('National Assessment and Accreditation Council', 'NAAC', 'India', 'https://www.naac.gov.in/', 
'NAAC is an organization that assesses and accredits institutions of higher education in India. It is an autonomous body funded by the University Grants Commission (UGC).', 
TRUE),

-- IEB - Institution of Engineers Bangladesh
('Institution of Engineers, Bangladesh', 'IEB', 'Bangladesh', 'https://www.iebbd.org/', 
'IEB is the apex professional body of engineers in Bangladesh, responsible for accreditation of engineering programs and professional registration.', 
TRUE),

-- JABEE - Japan Accreditation Board for Engineering Education
('Japan Accreditation Board for Engineering Education', 'JABEE', 'Japan', 'https://jabee.org/', 
'JABEE is responsible for accrediting engineering education programs in Japan and ensuring quality standards.', 
TRUE),

-- EA - Engineers Australia
('Engineers Australia', 'EA', 'Australia', 'https://www.engineersaustralia.org.au/', 
'Engineers Australia is the national peak body for the engineering profession in Australia, responsible for accreditation of engineering programs.', 
TRUE),

-- CEAB - Canadian Engineering Accreditation Board
('Canadian Engineering Accreditation Board', 'CEAB', 'Canada', 'https://engineerscanada.ca/accreditation', 
'CEAB is responsible for accrediting undergraduate engineering programs in Canada, ensuring they meet the standards for professional practice.', 
TRUE),

-- ECUK - Engineering Council UK
('Engineering Council UK', 'ECUK', 'United Kingdom', 'https://www.engc.org.uk/', 
'The Engineering Council is the UK regulatory body for the engineering profession, responsible for maintaining standards through professional engineering institutions.', 
TRUE),

-- PEC - Pakistan Engineering Council
('Pakistan Engineering Council', 'PEC', 'Pakistan', 'https://www.pec.org.pk/', 
'PEC is the statutory body responsible for regulating the engineering profession and accrediting engineering programs in Pakistan.', 
TRUE),

-- BEM - Board of Engineers Malaysia
('Board of Engineers Malaysia', 'BEM', 'Malaysia', 'https://www.bem.org.my/', 
'BEM is the regulatory body for the engineering profession in Malaysia, responsible for registration and accreditation.', 
TRUE),

-- Washington Accord (Signatory Organization)
('Washington Accord', 'WA', 'International', 'https://www.ieagreements.org/accords/washington/', 
'The Washington Accord is an international agreement among bodies responsible for accrediting engineering degree programs, recognizing substantial equivalence.', 
TRUE);
