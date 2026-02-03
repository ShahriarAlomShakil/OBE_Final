-- Seed: Sample departments data
-- Description: Insert initial department data for testing

-- Engineering Departments
INSERT INTO departments (name, dept_code, faculty_id, description, established_year, is_active) VALUES
('Computer Science & Engineering', 'CSE', 1, 'Department of Computer Science and Engineering', 2000, TRUE),
('Electrical & Electronics Engineering', 'EEE', 1, 'Department of Electrical and Electronics Engineering', 2000, TRUE),
('Civil Engineering', 'CE', 1, 'Department of Civil Engineering', 2000, TRUE),
('Mechanical Engineering', 'ME', 1, 'Department of Mechanical Engineering', 2001, TRUE),

-- Science Departments
('Physics', 'PHY', 2, 'Department of Physics', 1995, TRUE),
('Chemistry', 'CHEM', 2, 'Department of Chemistry', 1995, TRUE),
('Mathematics', 'MATH', 2, 'Department of Mathematics', 1995, TRUE),
('Statistics', 'STAT', 2, 'Department of Statistics', 1998, TRUE),

-- Arts Departments
('English', 'ENG', 3, 'Department of English', 1995, TRUE),
('History', 'HIST', 3, 'Department of History', 1995, TRUE),
('Philosophy', 'PHIL', 3, 'Department of Philosophy', 1996, TRUE),

-- Business Departments
('Accounting & Information Systems', 'AIS', 4, 'Department of Accounting and Information Systems', 2002, TRUE),
('Management', 'MGT', 4, 'Department of Management', 2002, TRUE),
('Marketing', 'MKT', 4, 'Department of Marketing', 2002, TRUE),
('Finance', 'FIN', 4, 'Department of Finance', 2003, TRUE);
