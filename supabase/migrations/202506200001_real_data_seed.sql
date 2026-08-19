-- Migration: Real Data Seed
-- Date: 2025-06-20
-- Description: Replace all mock data with real staff and auth_users data
--   from the quarterly report (June 2026).
--   Student data (460 records) was already seeded with real data and is retained.

-- =============================================================================
-- STEP 1: Clear mock staff data
-- =============================================================================
DELETE FROM staff;

-- =============================================================================
-- STEP 2: Insert 26 real staff members
-- (Position #1 - Secondary Headmaster is VACANT;
--  Sri. Bansode Ajit Lalasaheb serves as acting principal)
-- =============================================================================

-- Higher Secondary Teachers (उ.मा.शि.)
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्री.सरवदे श्रीनिवास मल्हारी', 'Higher Secondary Teacher', 'Teaching', '2001-07-11', 'active'),
  ('श्री.भुसे दिपक प्रभाकर', 'Higher Secondary Teacher', 'Teaching', '2001-07-13', 'active'),
  ('श्री.दरवेस रत्नेश रमेश', 'Higher Secondary Teacher', 'Teaching', '2009-08-04', 'active'),
  ('श्री.बनसोडे अजित लालासाहेब', 'Higher Secondary Teacher', 'Teaching', '2013-03-20', 'active');

-- Secondary Teachers (माध्य.शि.)
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्रीम.सावंत सुमन अर्जुन', 'Secondary Teacher', 'Teaching', '1994-10-19', 'active'),
  ('श्री.बनसोडे सुधिर ज्ञानोबा', 'Secondary Teacher', 'Teaching', '2008-01-10', 'active'),
  ('श्री.पाटील दिलीप रामभाऊ', 'Secondary Teacher', 'Teaching', '2009-07-08', 'active'),
  ('श्री.पडळकर नानासाहेब शामराव', 'Secondary Teacher', 'Teaching', '2013-03-20', 'active');

-- Senior Primary Teacher (प.प्रा.शि.)
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्री.निमरोठ सुनील रमेश', 'Senior Primary Teacher', 'Teaching', '2008-08-18', 'active');

-- Primary Teachers (प्रा.शि.)
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्रीम.बिरादार सारिका अंगदराव', 'Primary Teacher', 'Teaching', '2008-09-11', 'active'),
  ('श्री.धुमाळ श्रीकांत सुर्यकांत', 'Primary Teacher', 'Teaching', '2009-09-02', 'active'),
  ('श्री.भिसे लक्ष्मण रामदास', 'Primary Teacher', 'Teaching', '2010-02-16', 'active'),
  ('श्रीम.चौधरी प्रज्ञा बाळू', 'Primary Teacher', 'Teaching', '2013-01-24', 'active'),
  ('श्री.मोरे दिगंबर सुभाषराव', 'Primary Teacher', 'Teaching', '2014-09-15', 'active');

-- Residential Staff
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्री.माने राजेंद्र परशराम', 'Superintendent', 'Residential', '2007-09-07', 'active'),
  ('श्रीम.पखाले सविता पुंडलिक', 'Lady Superintendent', 'Residential', '2003-12-15', 'active');

-- Administrative Staff
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्री.जारवाल सतीश हरसिंग', 'Senior Clerk', 'Administrative', '2015-01-12', 'active'),
  ('श्री.कारोटे गणेश हनुमंत', 'Lab Assistant', 'Administrative', '2014-09-13', 'active');

-- Support Staff
INSERT INTO staff (full_name, designation, department, joining_date, status) VALUES
  ('श्रीम.मंडलिक रुपाली ज्ञानेश्वर', 'Peon', 'Support', '2015-07-01', 'active'),
  ('श्रीम.वडेकर कल्पना ठमा', 'Cook', 'Support', '1994-04-06', 'active'),
  ('श्रीम.भगत अंजना हरी', 'Cook', 'Support', '1986-07-01', 'active'),
  ('श्री.साळुंखे पराग एकनाथ', 'Cook', 'Support', '2012-06-02', 'active'),
  ('श्री.चौरे जुलाल श्रावण', 'Worker', 'Support', '1990-08-11', 'active'),
  ('श्री.कोकाटे सुदाम तुकाराम', 'Worker', 'Support', '1995-08-08', 'active'),
  ('श्री.घोडविंदे योगेश शांताराम', 'Worker', 'Support', '2008-07-21', 'active'),
  ('श्री.जाधव दिलीप दिगंबर', 'Cleaner', 'Support', '2008-05-26', 'active');

-- =============================================================================
-- STEP 3: Update auth_users - remove mock accounts, add real staff accounts
-- =============================================================================

-- Delete all mock auth_users except web creator (Omkar) and system admin
DELETE FROM auth_users WHERE username NOT IN ('7666971183', 'admin');

-- Insert real staff auth accounts
-- Passwords are plaintext; the login system auto-hashes on first successful login
INSERT INTO auth_users (username, password_hash, role, name_en, name_mr, mobile_number, is_active) VALUES
  ('9423864391', 'Principal@2024', 'principal', 'Ajit Lalasaheb Bansode', 'श्री.बनसोडे अजित लालासाहेब', '9423864391', true),
  ('mane_rajendra', 'Mane@2024', 'class_teacher', 'Rajendra Parsharam Mane', 'श्री.माने राजेंद्र परशराम', NULL, true),
  ('pakhale_savita', 'Pakhale@2024', 'class_teacher', 'Savita Pundalik Pakhale', 'श्रीम.पखाले सविता पुंडलिक', NULL, true),
  ('jarwal_satish', 'Jarwal@2024', 'clerk', 'Satish Harsing Jarwal', 'श्री.जारवाल सतीश हरसिंग', NULL, true);

-- Update Omkar's account to web_creator role
UPDATE auth_users
SET role = 'web_creator', name_mr = 'ओमकार सुपे', name_en = 'Omkar Supe'
WHERE username = '7666971183';

-- Update admin account labels
UPDATE auth_users
SET name_en = 'System Admin', name_mr = 'प्रशासक'
WHERE username = 'admin';

-- =============================================================================
-- STEP 4: Clear mock security_logs
-- =============================================================================
DELETE FROM security_logs;

-- =============================================================================
-- NOTES:
-- - Student data (460 records across standards 1-12) is real and was retained
-- - Position #1 (Secondary Headmaster) is VACANT
-- - Sri. Bansode Ajit Lalasaheb serves as acting principal (मुख्याध्यापक प्रभारी)
-- - Staff list sourced from quarterly report (June 2026)
-- =============================================================================
