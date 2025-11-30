// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'user';
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

// Customer types
export interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string;
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Vehicle types
export interface Vehicle {
  id: string;
  customer_id: string;
  brand: string;
  model: string;
  year: number;
  license_plate: string;
  vin?: string;
  color?: string;
  fuel_type?: string;
  transmission?: string;
  mileage?: number;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
  maintenance_interval_days?: number;
  maintenance_status: 'ok' | 'warning' | 'critical';
  notes?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
}

// Sales types
export interface Sale {
  id: string;
  customer_id: string;
  vehicle_id: string;
  sale_date: string;
  sale_price: number;
  purchase_price?: number;
  profit?: number;
  payment_method?: 'Nakit' | 'Kredi Kartı' | 'Banka Transferi' | 'Taksit';
  status: 'pending' | 'completed' | 'cancelled';
  notes?: string;
  sold_by: string;
  created_at: string;
  updated_at: string;
  customers?: Customer;
  vehicles?: Vehicle;
  users?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface SalesStats {
  totalSales: number;
  completedSales: number;
  pendingSales: number;
  totalRevenue: number;
  totalProfit: number;
}

// Work Order types
export interface WorkOrderPart {
  id: string;
  name: string;
  code: string;
  given_date: string;
  expiration_date: string;
  price: number;
  profit: number; // Manual profit in TL
}

export interface WorkOrder {
  id: string;
  vehicle_id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  parts: WorkOrderPart[];
  created_at: string;
  service_date: string;
  notes: string;
  created_by?: string;
  vehicles?: Vehicle;
  total_price?: number;
  total_profit?: number;
}

export interface WorkOrderStats {
  totalWorkOrders: number;
  pendingWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  totalRevenue: number;
  totalProfit: number;
}

// Notification types
export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'sale' | 'service' | 'customer' | 'system';
  is_read: boolean;
  created_at: string;
}
