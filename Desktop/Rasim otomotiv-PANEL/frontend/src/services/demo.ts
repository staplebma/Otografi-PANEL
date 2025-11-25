// Demo mode - works without backend
export const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@rasimotomotiv.com',
  firstName: 'Demo',
  lastName: 'Kullanıcı',
  role: 'admin' as const,
};

export const DEMO_CREDENTIALS = {
  email: 'demo@rasimotomotiv.com',
  password: 'demo123',
};

export const isDemoMode = () => {
  return localStorage.getItem('demoMode') === 'true';
};

export const enableDemoMode = () => {
  localStorage.setItem('demoMode', 'true');
};

export const disableDemoMode = () => {
  localStorage.removeItem('demoMode');
};

// Demo customers - Only real customers for production
export const DEMO_CUSTOMERS = [
  {
    id: 'customer-mert-hakan',
    first_name: 'Mert Hakan',
    last_name: 'Korkmaz',
    email: 'merthakan@korkmaz.com',
    phone: '05383218986',
    address: 'talas',
    city: 'Kayseri',
    notes: '',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'customer-kemal',
    first_name: 'Kemal',
    last_name: 'Sorkulu',
    email: '',
    phone: '05424445678',
    address: '',
    city: 'Kayseri',
    notes: '',
    created_by: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Helper to get demo customers from localStorage with fallback
export const getDemoCustomers = () => {
  const stored = localStorage.getItem('demoCustomers');
  if (stored) {
    return JSON.parse(stored);
  }
  localStorage.setItem('demoCustomers', JSON.stringify(DEMO_CUSTOMERS));
  return DEMO_CUSTOMERS;
};

// Helper to save demo customers
export const saveDemoCustomers = (customers: any[]) => {
  localStorage.setItem('demoCustomers', JSON.stringify(customers));
};

export const getDemoVehicles = () => {
  const stored = localStorage.getItem('demoVehicles');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveDemoVehicles = (vehicles: any[]) => {
  localStorage.setItem('demoVehicles', JSON.stringify(vehicles));
};

export const getDemoWorkOrders = () => {
  const stored = localStorage.getItem('demoWorkOrders');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveDemoWorkOrders = (workOrders: any[]) => {
  localStorage.setItem('demoWorkOrders', JSON.stringify(workOrders));
};

export const getDemoSales = () => {
  const stored = localStorage.getItem('demoSales');
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
};

export const saveDemoSales = (sales: any[]) => {
  localStorage.setItem('demoSales', JSON.stringify(sales));
};

// Clear old demo data and reset to production customers only
export const clearOldDemoData = () => {
  localStorage.removeItem('demoCustomers');
  localStorage.removeItem('demoVehicles');
  localStorage.removeItem('demoWorkOrders');
  localStorage.removeItem('demoSales');
  // Re-initialize with production customers
  localStorage.setItem('demoCustomers', JSON.stringify(DEMO_CUSTOMERS));
};

// Demo vehicles and maintenance data - Empty for production
export const DEMO_VEHICLES: any[] = [];
export const DEMO_MAINTENANCE_PARTS: any[] = [];
export const DEMO_SALES: any[] = [];
