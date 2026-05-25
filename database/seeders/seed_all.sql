USE pharmasys;

INSERT INTO roles (role_name, description) VALUES
('super_admin', 'Full system access'),
('pharmacist', 'Medicine and prescription management'),
('cashier', 'POS and customer transactions'),
('inventory_staff', 'Stock and supplier management');

INSERT INTO branches (branch_name, address, phone, email) VALUES
('Main Branch', '123 Pharmacy Street, Manila', '+639171234567', 'main@pharmasys.local'),
('Branch 2', '456 Health Ave, Quezon City', '+639181234567', 'branch2@pharmasys.local');

-- Users created on first API start (admin@pharmasys.com / Admin@123) via ensureDefaultAdmin()

INSERT INTO categories (name, description) VALUES
('Analgesics', 'Pain relief medications'),
('Antibiotics', 'Antibacterial medications'),
('Vitamins', 'Supplements and vitamins'),
('Cardiovascular', 'Heart and blood pressure'),
('Dermatology', 'Skin treatments'),
('OTC', 'Over-the-counter general');

INSERT INTO suppliers (company_name, contact_person, email, phone, address) VALUES
('MedSupply PH', 'Roberto Cruz', 'sales@medsupply.ph', '+6328123456', 'Manila Industrial Park'),
('PharmaCore Inc', 'Lisa Tan', 'orders@pharmacore.ph', '+6328987654', 'Laguna Technopark'),
('HealthFirst Distributors', 'Mark Lim', 'info@healthfirst.ph', '+6328111222', 'Cebu Business Park');

INSERT INTO medicines (branch_id, barcode, medicine_name, generic_name, brand_name, category_id, dosage, description, supplier_id, quantity, reorder_level, unit_price, selling_price, expiration_date, batch_number, prescription_required) VALUES
(1, '8901234567890', 'Paracetamol 500mg', 'Paracetamol', 'Biogesic', 1, '500mg tablet', 'Pain and fever relief', 1, 500, 50, 2.50, 5.00, '2027-06-30', 'BATCH-PARA-001', 0),
(1, '8901234567891', 'Amoxicillin 500mg', 'Amoxicillin', 'Amoxil', 2, '500mg capsule', 'Antibiotic', 2, 200, 30, 8.00, 15.00, '2026-12-31', 'BATCH-AMOX-002', 1),
(1, '8901234567892', 'Vitamin C 500mg', 'Ascorbic Acid', 'Cecon', 3, '500mg tablet', 'Immune support', 1, 350, 40, 3.00, 8.00, '2028-03-15', 'BATCH-VITC-003', 0),
(1, '8901234567893', 'Losartan 50mg', 'Losartan', 'Cozaar', 4, '50mg tablet', 'Blood pressure', 2, 150, 25, 12.00, 25.00, '2027-01-20', 'BATCH-LOS-004', 1),
(1, '8901234567894', 'Cetirizine 10mg', 'Cetirizine', 'Zyrtex', 6, '10mg tablet', 'Allergy relief', 3, 80, 20, 4.00, 10.00, '2026-08-10', 'BATCH-CET-005', 0),
(1, '8901234567895', 'Metformin 500mg', 'Metformin', 'Glucophage', 4, '500mg tablet', 'Diabetes management', 2, 45, 15, 6.00, 12.00, '2026-05-01', 'BATCH-MET-006', 1);

INSERT INTO customers (full_name, email, phone, address, loyalty_points, senior_citizen, pwd) VALUES
('Walk-in Customer', NULL, NULL, NULL, 0, 0, 0),
('Pedro Garcia', 'pedro@email.com', '+639171111111', 'Manila', 120, 1, 0),
('Rosa Mendoza', 'rosa@email.com', '+639182222222', 'Quezon City', 85, 0, 1),
('Carlos Tan', 'carlos@email.com', '+639193333333', 'Makati', 200, 0, 0);

INSERT INTO discounts (code, name, discount_type, value, is_active) VALUES
('SENIOR20', 'Senior Citizen 20%', 'percentage', 20.00, 1),
('PWD20', 'PWD 20%', 'percentage', 20.00, 1),
('PROMO10', 'Promo 10%', 'percentage', 10.00, 1);

INSERT INTO notifications (branch_id, type, title, message, is_read) VALUES
(1, 'system', 'Welcome to PharmaSys', 'Your pharmacy management system is ready.', 0),
(1, 'low_stock', 'Low Stock Alert', 'Metformin 500mg is below reorder level (45 units).', 0),
(1, 'expiring', 'Expiring Soon', 'Cetirizine 10mg expires on 2026-08-10.', 0);
