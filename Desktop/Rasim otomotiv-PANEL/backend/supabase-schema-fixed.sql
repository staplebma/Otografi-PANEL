-- Rasim Otomotiv CRM Database Schema (Fixed for NestJS JWT)
-- Bu schema NestJS backend'in service_role key ile full access yapacağı şekilde ayarlanmıştır

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'manager', 'user'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER NOT NULL,
  license_plate VARCHAR(20) UNIQUE NOT NULL,
  vin VARCHAR(17),
  color VARCHAR(50),
  fuel_type VARCHAR(50), -- 'Benzin', 'Dizel', 'LPG', 'Elektrik', 'Hybrid'
  transmission VARCHAR(50), -- 'Manuel', 'Otomatik'
  mileage INTEGER,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_interval_days INTEGER DEFAULT 365,
  maintenance_status VARCHAR(20) DEFAULT 'ok', -- 'ok', 'warning', 'critical'
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id),
  vehicle_id UUID REFERENCES vehicles(id),
  sale_date DATE NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  purchase_price DECIMAL(10, 2),
  profit DECIMAL(10, 2) GENERATED ALWAYS AS (sale_price - COALESCE(purchase_price, 0)) STORED,
  payment_method VARCHAR(50), -- 'Nakit', 'Kredi Kartı', 'Banka Transferi', 'Taksit'
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  notes TEXT,
  sold_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Records table
CREATE TABLE IF NOT EXISTS service_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  service_date DATE NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  description TEXT,
  cost DECIMAL(10, 2),
  mileage INTEGER,
  next_service_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'sale', 'service', 'customer', 'system'
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_created_by ON customers(created_by);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_maintenance_status ON vehicles(maintenance_status);
CREATE INDEX IF NOT EXISTS idx_vehicles_next_maintenance ON vehicles(next_maintenance_date);
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
CREATE INDEX IF NOT EXISTS idx_sales_vehicle_id ON sales(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by ON sales(sold_by);
CREATE INDEX IF NOT EXISTS idx_sales_sale_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_service_records_vehicle_id ON service_records(vehicle_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sales_updated_at ON sales;
CREATE TRIGGER update_sales_updated_at BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_records_updated_at ON service_records;
CREATE TRIGGER update_service_records_updated_at BEFORE UPDATE ON service_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - NestJS Backend Full Access
-- ============================================
-- Backend uses service_role key which bypasses RLS
-- These policies are for future direct Supabase client usage

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role full access" ON users;
DROP POLICY IF EXISTS "Service role full access" ON customers;
DROP POLICY IF EXISTS "Service role full access" ON vehicles;
DROP POLICY IF EXISTS "Service role full access" ON sales;
DROP POLICY IF EXISTS "Service role full access" ON service_records;
DROP POLICY IF EXISTS "Service role full access" ON notifications;

-- Simple permissive policies for service role
CREATE POLICY "Allow service role full access" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON customers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON vehicles
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON sales
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON service_records
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow service role full access" ON notifications
  FOR ALL USING (true) WITH CHECK (true);

-- Create view for dashboard stats
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
  (SELECT COUNT(*) FROM customers) as total_customers,
  (SELECT COUNT(*) FROM vehicles) as total_vehicles,
  (SELECT COUNT(*) FROM sales WHERE status = 'completed') as total_sales,
  (SELECT COUNT(*) FROM vehicles WHERE maintenance_status = 'critical') as critical_maintenances,
  (SELECT SUM(sale_price) FROM sales WHERE status = 'completed' AND sale_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_revenue,
  (SELECT COUNT(*) FROM sales WHERE status = 'completed' AND sale_date >= CURRENT_DATE - INTERVAL '30 days') as monthly_sales;

-- Grant access to view
GRANT SELECT ON dashboard_stats TO authenticated;
GRANT SELECT ON dashboard_stats TO anon;
