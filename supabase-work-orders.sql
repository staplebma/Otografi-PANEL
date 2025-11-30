-- Work Orders Table
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Work Order Parts Table
CREATE TABLE IF NOT EXISTS work_order_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(100) NOT NULL,
  given_date DATE NOT NULL,
  expiration_date DATE NOT NULL,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  profit DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_work_orders_vehicle ON work_orders(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_work_orders_created_by ON work_orders(created_by);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_date ON work_orders(service_date);
CREATE INDEX IF NOT EXISTS idx_work_order_parts_wo ON work_order_parts(work_order_id);

-- RLS (Row Level Security) Policies
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_order_parts ENABLE ROW LEVEL SECURITY;

-- Work Orders RLS Policies
CREATE POLICY "Users can view their own work orders or if admin/manager" ON work_orders
  FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Users can create work orders" ON work_orders
  FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own work orders or if admin/manager" ON work_orders
  FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
    )
  );

CREATE POLICY "Only admins can delete work orders" ON work_orders
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Work Order Parts RLS Policies
CREATE POLICY "Users can view parts of accessible work orders" ON work_order_parts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      WHERE work_orders.id = work_order_parts.work_order_id
      AND (
        work_orders.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Users can create parts for their work orders" ON work_order_parts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM work_orders
      WHERE work_orders.id = work_order_parts.work_order_id
      AND work_orders.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update parts of their work orders" ON work_order_parts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM work_orders
      WHERE work_orders.id = work_order_parts.work_order_id
      AND (
        work_orders.created_by = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid() AND users.role IN ('admin', 'manager')
        )
      )
    )
  );

CREATE POLICY "Only admins can delete parts" ON work_order_parts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_work_order_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER work_orders_updated_at
  BEFORE UPDATE ON work_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_work_order_updated_at();

-- Comments
COMMENT ON TABLE work_orders IS 'Stores work orders/service orders for vehicles';
COMMENT ON TABLE work_order_parts IS 'Stores parts/items for each work order with individual profit tracking';
COMMENT ON COLUMN work_order_parts.profit IS 'Manual profit amount in TL for this part';
