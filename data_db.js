import Database from 'better-sqlite3';

export const db = new Database('app.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    product_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    product_name        TEXT    NOT NULL,
    vendor_managed_flag INTEGER NOT NULL,
    unit                TEXT    NOT NULL,
    storage_capacity    REAL    NOT NULL,
    stocked_date        TEXT    NOT NULL,
    discontinued_date   TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS stock_movements (
    movement_id     INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id      INTEGER NOT NULL REFERENCES products(product_id),
    movement_type   TEXT    NOT NULL CHECK (movement_type IN ('RECEIVE', 'SHIP')),
    unit            TEXT    NOT NULL,
    quantity        REAL    NOT NULL,
    start_time      TEXT    NOT NULL,
    end_time        TEXT    NOT NULL,
    logged_date     TEXT    NOT NULL
  );
`);

const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();

if (count === 0) {
  db.exec(`
  INSERT INTO products (product_name, vendor_managed_flag, unit, storage_capacity, stocked_date, discontinued_date) VALUES
    ('Organic Almond Milk', 0, 'LBS', 10.00, '2024-05-16', '2027-04-23'),
    ('A4 Copy Paper Ream', 1, 'CASE', 8.00, '2025-05-14', '2027-05-07'),
    ('Bluetooth Headphones', 1, 'EACH', 60.00, '2026-01-21', '2031-02-09'),
    ('Cast Iron Skillet', 1, 'KG', 5.60, '2023-07-18', '2027-07-02'),
    ('Stainless Steel Water Bottle', 1, 'EACH', 30.00, '2023-09-13', '2028-09-17'),
    ('Ceramic Coffee Mug', 1, 'CASE', 30.00, '2024-01-29', '2026-01-27'),
    ('Yoga Mat', 0, 'EACH', 24.00, '2025-02-17', '2029-03-06'),
    ('Memory Foam Pillow', 0, 'KG', 4100.00, '2025-04-01', '2029-03-13'),
    ('Portable Bluetooth Speaker', 1, 'LBS', 7800.00, '2025-10-19', '2030-10-23'),
    ('LED Desk Lamp', 0, 'CASE', 47.00, '2025-05-14', '2031-05-27');

  INSERT INTO stock_movements (product_id, movement_type, unit, quantity, start_time, end_time, logged_date) VALUES
    (1, 'RECEIVE', 'LBS', 10.50, '2026-01-03 07:00:00', '2026-01-03 07:55:00', '2025-12-29'),
    (1, 'RECEIVE', 'LBS', 7.20, '2025-01-05 06:30:00', '2025-01-05 07:10:00', '2026-01-03'),
    (1, 'SHIP', 'LBS', 4.00, '2026-01-01 18:00:00', '2026-01-01 18:30:00', '2025-12-29'),
    (2, 'RECEIVE', 'CASE', 180.00, '2026-01-17 17:30:00', '2026-01-17 18:30:00', '2026-01-12'),
    (3, 'SHIP', 'EACH', 25.00, '2026-01-20 08:00:00', '2026-01-20 08:25:00', '2026-01-18'),
    (4, 'RECEIVE', 'KG', 14.50, '2026-01-29 06:45:00', '2026-01-29 07:55:00', '2026-01-26'),
    (4, 'RECEIVE', 'KG', 8.00, '2026-01-20 12:00:00', '2026-01-20 12:45:00', '2026-01-18'),
    (7, 'RECEIVE', 'EACH', 220.00, '2026-01-03 16:00:00', '2026-01-03 16:50:00', '2026-01-03'),
    (8, 'RECEIVE', 'KG', 480.00, '2026-01-01 09:00:00', '2026-01-01 09:40:00', '2025-12-31'),
    (8, 'RECEIVE', 'KG', 820.00, '2026-01-25 19:00:00', '2026-01-25 20:15:00', '2026-01-25'),
    (9, 'SHIP', 'LBS', 150.00, '2026-01-10 07:30:00', '2026-01-10 08:00:00', '2026-01-06'),
    (9, 'RECEIVE', 'LBS', 600.00, '2026-01-23 17:00:00', '2026-01-23 18:00:00', '2026-01-19'),
    (10, 'SHIP', 'CASE', 20.00, '2026-01-26 08:00:00', '2026-01-26 08:20:00', '2026-01-26'),
    (10, 'RECEIVE', 'CASE', 80.00, '2026-01-25 06:00:00', '2026-01-25 07:20:00', '2026-01-21'),
    (10, 'RECEIVE', 'CASE', 35.00, '2026-01-25 12:00:00', '2026-01-25 12:35:00', '2026-01-24');
  `);
}
