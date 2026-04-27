-- Product click tracking for affiliate analytics
CREATE TABLE IF NOT EXISTS product_clicks (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  product_id TEXT NOT NULL,
  partner_id TEXT NOT NULL,
  affiliate_url TEXT NOT NULL,
  recipient TEXT,
  occasion TEXT,
  budget TEXT,
  clicked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_clicks_session ON product_clicks(session_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_product ON product_clicks(product_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_partner ON product_clicks(partner_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_clicked_at ON product_clicks(clicked_at);
