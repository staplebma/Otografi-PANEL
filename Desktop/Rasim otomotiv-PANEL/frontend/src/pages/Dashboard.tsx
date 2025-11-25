import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesService } from '../services/sales';
import { vehiclesService } from '../services/vehicles';
import { getDemoCustomers, getDemoVehicles, getDemoSales, getDemoWorkOrders } from '../services/demo';
import CurrencyConverter from '../components/CurrencyConverter';
import {
  UsersIcon,
  TruckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  XMarkIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'customer' | 'vehicle' | 'workorder';
  title: string;
  description: string;
  timestamp: string;
  icon: any;
  color: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [maintenanceDue, setMaintenanceDue] = useState<Vehicle[]>([]);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerVehicles, setCustomerVehicles] = useState<any[]>([]);
  const [customerSales, setCustomerSales] = useState<any[]>([]);
  const [customerWorkOrders, setCustomerWorkOrders] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [salesStats, vehicles] = await Promise.all([
        salesService.getStats(),
        vehiclesService.getMaintenanceDue(),
      ]);

      const customers = getDemoCustomers();
      const allVehicles = getDemoVehicles();
      const workOrders = getDemoWorkOrders();

      setStats(salesStats);
      setMaintenanceDue(vehicles.slice(0, 5));

      // Sort customers by created_at descending
      const sortedCustomers = [...customers].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setRecentCustomers(sortedCustomers.slice(0, 5));

      // Create activities timeline
      const activities: Activity[] = [];

      // Add customer activities
      customers.forEach((customer: any) => {
        activities.push({
          id: `customer-${customer.id}`,
          type: 'customer',
          title: 'Yeni Müşteri',
          description: `${customer.first_name} ${customer.last_name} eklendi`,
          timestamp: customer.created_at,
          icon: UserPlusIcon,
          color: 'blue',
        });
      });

      // Add vehicle activities
      allVehicles.forEach((vehicle: any) => {
        const customer = customers.find((c: any) => c.id === vehicle.customer_id);
        activities.push({
          id: `vehicle-${vehicle.id}`,
          type: 'vehicle',
          title: 'Yeni Araç',
          description: `${vehicle.brand} ${vehicle.model} - ${customer?.first_name} ${customer?.last_name}`,
          timestamp: vehicle.created_at,
          icon: TruckIcon,
          color: 'green',
        });
      });

      // Add work order activities
      workOrders.forEach((wo: any) => {
        const vehicle = allVehicles.find((v: any) => v.id === wo.vehicle_id);
        const totalPrice = wo.parts.reduce((sum: number, p: any) => sum + (p.price || 0), 0);

        activities.push({
          id: `workorder-${wo.id}`,
          type: 'workorder',
          title: 'Yeni İş Emri',
          description: `${vehicle?.brand} ${vehicle?.model} - ${wo.parts.length} parça (${totalPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })})`,
          timestamp: wo.service_date || wo.created_at,
          icon: WrenchScrewdriverIcon,
          color: 'purple',
        });
      });

      // Sort activities by timestamp descending
      const sortedActivities = activities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setRecentActivities(sortedActivities.slice(0, 10));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerClick = (customer: Customer) => {
    setSelectedCustomer(customer);

    // Load customer's vehicles
    const vehicles = getDemoVehicles();
    const customerVehs = vehicles.filter((v: any) => v.customer_id === customer.id);
    setCustomerVehicles(customerVehs);

    // Load customer's sales
    const sales = getDemoSales();
    const customerSls = sales.filter((s: any) => s.customer_id === customer.id);
    setCustomerSales(customerSls);

    // Load customer's work orders
    const workOrders = getDemoWorkOrders();
    const vehicleIds = customerVehs.map((v: any) => v.id);
    const customerWOs = workOrders.filter((wo: any) => vehicleIds.includes(wo.vehicle_id));
    setCustomerWorkOrders(customerWOs);

    setShowCustomerModal(true);
  };

  const getActivityColor = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
    };
    return colors[color] || 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">


      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Recent Activities - 3 columns */}
        <div className="card lg:col-span-3">
          <h3 className="text-lg font-semibold mb-4">Son İşlemler</h3>
          <div className="space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Henüz işlem bulunmuyor</p>
            ) : (
              recentActivities.map((activity) => {
                const IconComponent = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-lg ${getActivityColor(activity.color)}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600 truncate">{activity.description}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <ClockIcon className="h-3 w-3 text-gray-400" />
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Currency Converter - 1 column on right */}
        <div className="lg:col-span-1">
          <CurrencyConverter />
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Maintenance Due */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Bakım Gerektiren Araçlar</h3>
          <div className="space-y-3">
            {maintenanceDue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Bakım gerektiren araç bulunmuyor
              </p>
            ) : (
              maintenanceDue.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {vehicle.brand} {vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500">{vehicle.license_plate}</p>
                  </div>
                  <span
                    className={`badge-${vehicle.maintenance_status === 'critical'
                      ? 'danger'
                      : vehicle.maintenance_status === 'warning'
                        ? 'warning'
                        : 'success'
                      }`}
                  >
                    {vehicle.maintenance_status === 'critical'
                      ? 'Kritik'
                      : vehicle.maintenance_status === 'warning'
                        ? 'Uyarı'
                        : 'Tamam'}
                  </span>
                </div>
              ))
            )}
          </div>
          {maintenanceDue.length > 0 && (
            <Link
              to="/vehicles"
              className="block text-center mt-4 text-primary hover:text-primary-600 font-medium"
            >
              Tümünü Gör →
            </Link>
          )}
        </div>

        {/* Recent Customers */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Son Müşteriler</h3>
          <div className="space-y-3">
            {recentCustomers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Müşteri bulunmuyor</p>
            ) : (
              recentCustomers.map((customer) => (
                <div
                  key={customer.id}
                  onClick={() => handleCustomerClick(customer)}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{customer.phone}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(customer.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
              ))
            )}
          </div>
          {recentCustomers.length > 0 && (
            <Link
              to="/customers"
              className="block text-center mt-4 text-primary hover:text-primary-600 font-medium"
            >
              Tümünü Gör →
            </Link>
          )}
        </div>
      </div>

      {/* Customer Detail Modal */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8">
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-primary to-blue-600 text-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedCustomer.first_name} {selectedCustomer.last_name}</h2>
                <p className="text-blue-100">{selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setShowCustomerModal(false)} className="text-white/80 hover:text-white">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedCustomer.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Şehir</p>
                  <p className="font-medium">{selectedCustomer.city || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Adres</p>
                  <p className="font-medium">{selectedCustomer.address || '-'}</p>
                </div>
              </div>

              {/* Vehicles */}
              <div>
                <h3 className="text-lg font-bold mb-3">Araçlar ({customerVehicles.length})</h3>
                {customerVehicles.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">Kayıtlı araç bulunmuyor</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {customerVehicles.map((vehicle: any) => (
                      <div key={vehicle.id} className="border rounded-lg p-3">
                        <p className="font-bold">{vehicle.brand} {vehicle.model}</p>
                        <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.license_plate}</p>
                        <p className="text-xs text-gray-500 mt-1">KM: {vehicle.mileage?.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Work Orders & Parts */}
              <div>
                <h3 className="text-lg font-bold mb-3">İş Emirleri ve Parçalar ({customerWorkOrders.length})</h3>
                {customerWorkOrders.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">İş emri bulunmuyor</p>
                ) : (
                  <div className="space-y-3">
                    {customerWorkOrders.map((wo: any) => {
                      const vehicle = customerVehicles.find((v: any) => v.id === wo.vehicle_id);
                      return (
                        <div key={wo.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium">{vehicle?.brand} {vehicle?.model} - {vehicle?.license_plate}</p>
                              <p className="text-sm text-gray-500">{new Date(wo.service_date || wo.created_at).toLocaleDateString('tr-TR')}</p>
                            </div>
                            <span className="badge-success">Tamamlandı</span>
                          </div>
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Parçalar:</p>
                            <div className="space-y-1">
                              {wo.parts.map((part: any) => (
                                <div key={part.id} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                                  <span>{part.name} ({part.code})</span>
                                  <span className="font-medium text-primary">{part.price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sales Summary */}
              <div>
                <h3 className="text-lg font-bold mb-3">Satış Özeti</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Toplam Satış</p>
                    <p className="text-2xl font-bold text-green-900">{customerSales.length}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Toplam Tutar</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {customerSales.reduce((sum: number, s: any) => sum + (s.sale_price || 0), 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
