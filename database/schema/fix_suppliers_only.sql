-- Run if terminal says: Table 'pharmasys.suppliers' doesn't exist
USE pharmasys;

CREATE TABLE IF NOT EXISTS suppliers (
  supplier_id INT PRIMARY KEY AUTO_INCREMENT,
  company_name VARCHAR(150) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(100),
  phone VARCHAR(30),
  address TEXT,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO suppliers (company_name, contact_person, email, phone, address)
SELECT * FROM (SELECT 'MedSupply PH', 'Roberto Cruz', 'sales@medsupply.ph', '+6328123456', 'Manila') AS t
WHERE NOT EXISTS (SELECT 1 FROM suppliers LIMIT 1);
