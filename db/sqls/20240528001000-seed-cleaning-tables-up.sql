INSERT INTO cleaners (name, email, phone, status, notes)
VALUES
  ('Alice Johnson', 'alice.johnson@example.com', '555-0100', 'active', 'Team lead for commercial accounts'),
  ('Bruno Silva', 'bruno.silva@example.com', '555-0101', 'active', 'Speaks Spanish and English'),
  ('Carla Mendes', 'carla.mendes@example.com', '555-0102', 'inactive', 'On leave until July');

INSERT INTO jobs (title, client_name, location, description, rate, status)
VALUES
  ('Weekly Office Cleaning', 'Brightside Studio', '123 Market Street', 'Deep clean of shared office space', 180.00, 'scheduled'),
  ('Post-Event Cleanup', 'Northbridge Events', '85 Riverfront Ave', 'Cleanup after corporate event', 240.00, 'open'),
  ('Residential Refresh', 'Liam Carter', '42 Elm Drive', 'Two-bedroom apartment turnover', 130.00, 'completed');

INSERT INTO assignments (job_id, cleaner_id, service_date, status, notes)
SELECT j.id, c.id, '2024-06-03', 'scheduled', 'Bring eco-friendly supplies'
FROM jobs j
JOIN cleaners c ON c.email = 'alice.johnson@example.com'
WHERE j.title = 'Weekly Office Cleaning'
LIMIT 1;

INSERT INTO assignments (job_id, cleaner_id, service_date, status, notes)
SELECT j.id, c.id, '2024-06-03', 'scheduled', NULL
FROM jobs j
JOIN cleaners c ON c.email = 'bruno.silva@example.com'
WHERE j.title = 'Weekly Office Cleaning'
LIMIT 1;

INSERT INTO assignments (job_id, cleaner_id, service_date, status, notes)
SELECT j.id, c.id, '2024-05-30', 'completed', 'Completed ahead of schedule'
FROM jobs j
JOIN cleaners c ON c.email = 'carla.mendes@example.com'
WHERE j.title = 'Residential Refresh'
LIMIT 1;
