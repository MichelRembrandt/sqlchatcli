import Database from 'better-sqlite3';
import { fileURLToPath } from 'node:url';

const dbPath = fileURLToPath(new URL('./app.db', import.meta.url));
const knowledgeDb = new Database(dbPath);

knowledgeDb.exec(`
  CREATE TABLE IF NOT EXISTS knowledge_table (
    table_name      TEXT NOT NULL,
    column_name     TEXT,
    data_type       TEXT,
    description     TEXT
  );
`);

const { count } = knowledgeDb.prepare('SELECT COUNT(*) AS count FROM knowledge_table').get();

if (count === 0) {
  knowledgeDb.exec(`
  INSERT INTO knowledge_table (table_name, column_name, data_type, description) VALUES
    ('products', 'product_id',          'INTEGER', 'Primary key. Uniquely identifies a product (the catalog item under which stock movements occur).'),
    ('products', 'product_name',        'TEXT', 'Name of the product stocked in the warehouse.'),
    ('products', 'vendor_managed_flag', 'INTEGER',           'Whether the product is vendor-managed (1) or self-managed (0). A vendor-managed product means the supplier commits to a fixed replenishment schedule for the warehouse, locked for the product listing term. Self-managed products have restocking planned per shipment instead.'),
    ('products', 'unit',                'TEXT',       'Unit of measure for the product storage_capacity: EACH, CASE, KG, or LBS. Avoid statistical analysis of quantities without grouping by unit, since 1 EACH is not equal to 1 KG'),
    ('products', 'storage_capacity',    'REAL', 'Maximum aggregate quantity that can be stored for this product. The quantity repesents the amount in product.unit'),
    ('products', 'stocked_date',        'TEXT',          'Date the product became available for stocking. Formatted as: YYYY-MM-DD'),
    ('products', 'discontinued_date',   'TEXT',          'Date the product is discontinued. No new stock movements should originate after this date. Used together with stocked_date to compute product listing duration. Formatted as: YYYY-MM-DD'),
    ('stock_movements', 'movement_id',   'INTEGER',           'Primary key. Uniquely identifies a single stock movement (a receipt into, or a shipment out of, the warehouse).'),
    ('stock_movements', 'product_id',    'INTEGER',           'Foreign key to products.product_id. Every stock movement belongs to exactly one product.'),
    ('stock_movements', 'movement_type', 'TEXT',    'Indicates whether the movement is stock received into the warehouse (RECEIVE) or stock shipped out to fulfill orders (SHIP). Avoid statistical analysis of quantities without grouping by movement_type, since summations of received and shipped quantities will create misleading results, as they represent stock moving in a different direction. Value can be RECEIVE or SHIP.'),
    ('stock_movements', 'unit',          'TEXT',       'Unit of measure for this specific movement: EACH, CASE, KG, or LBS. Must be the same as the parent product unit.'),
    ('stock_movements', 'quantity',      'REAL', 'Amount of stock logged for the movement, in stock_movements.unit. This is the amount to use for mean quantity, total quantity, quantity type questions - always group these by movement_type and by unit in case not specified in the question.'),
    ('stock_movements', 'start_time',    'TEXT',          'Timestamp the movement begins (unloading starts for a receipt, or picking/loading begins for a shipment). Use this column when a question refers to when a movement starts. Formatted as: YYYY-MM-DD HH:MM:SS'),
    ('stock_movements', 'end_time',      'TEXT',          'Timestamp the movement finishes. Used together with start_time to compute the movement duration in minutes - a single movement is one dock session and should last well under a day (typically 15-90 minutes). Formatted as: YYYY-MM-DD HH:MM:SS'),
    ('stock_movements', 'logged_date',   'TEXT',          'Date the movement was recorded/logged in the warehouse management system. This can differ from the start_time date (e.g. logged a day before the movement begins) and should NOT be used to answer -when does the movement start- questions. Formatted as: YYYY-MM-DD');
  `);
}

export function getKnowledgeTable() {
  return knowledgeDb.prepare('SELECT * FROM knowledge_table').all();
}
