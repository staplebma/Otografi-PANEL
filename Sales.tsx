import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { getDemoSales, getDemoWorkOrders, isDemoMode } from '../services/demo';
import { workOrdersService } from '../services/workOrders';
import { Sale, WorkOrder } from '../types';
import toast from 'react-hot-toast';

const Sales: React.FC = () => {
    const [sales, setSales] = useState<Sale[]>([]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDateRangeModal, setShowDateRangeModal] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [formData, setFormData] = useState({
        sale_price: 0,
        payment_method: 'Nakit' as const,
        notes: '',
    });

    useEffect(() => {
        const loadData = async () => {
            if (isDemoMode()) {
                setSales(getDemoSales());
                setWorkOrders(getDemoWorkOrders());
            } else {
                try {
                    const workOrdersData = await workOrdersService.getAll();
                    setWorkOrders(workOrdersData);
                } catch (error) {
                    console.error('Failed to load work orders:', error);
                    toast.error('İş emirleri yüklenemedi');
                }
            }
        };
        loadData();
    }, []);

    const handleDateRangeFilter = () => {
        if (!dateRange.start || !dateRange.end) {
            toast.error('Lütfen başlangıç ve bitiş tarihi seçin');
            return;
        }
        toast.success(`${dateRange.start} - ${dateRange.end} aralığı için filtrelendi`);
        setShowDateRangeModal(false);
    };

    // Transform work orders into sales-like format
    const workOrdersAsSales = workOrders.map((wo) => {
        const totalPrice = wo.parts.reduce((sum, part) => sum + part.price, 0);
        const totalProfit = wo.parts.reduce((sum, part) => sum + part.profit, 0);

        return {
            id: wo.id,
            customer_id: wo.vehicles?.customer_id || '',
            vehicle_id: wo.vehicle_id,
            sale_date: wo.service_date,
            sale_price: totalPrice,
            profit: totalProfit,
            payment_method: 'Nakit' as const,
            status: wo.status === 'completed' ? 'completed' as const : wo.status === 'cancelled' ? 'cancelled' as const : 'pending' as const,
            notes: wo.notes,
            sold_by: wo.created_by || '',
            created_at: wo.created_at,
            updated_at: wo.created_at,
            customers: wo.vehicles?.customers,
            vehicles: wo.vehicles,
            type: 'work_order' as const,
        };
    });

    // Combine sales and work orders
    const combinedItems = [
        ...sales.map(sale => ({ ...sale, type: 'sale' as const })),
        ...workOrdersAsSales,
    ].sort((a, b) => new Date(b.sale_date).getTime() - new Date(a.sale_date).getTime());

    const filteredItems = combinedItems.filter((item) => {
        const customerName = item.customers
            ? `${item.customers.first_name} ${item.customers.last_name}`.toLowerCase()
            : '';
        const vehicleName = item.vehicles
            ? `${item.vehicles.brand} ${item.vehicles.model}`.toLowerCase()
            : '';

        return customerName.includes(searchQuery.toLowerCase()) ||
            vehicleName.includes(searchQuery.toLowerCase());
    });

    const totalRevenue = filteredItems.reduce((sum, item) => sum + item.sale_price, 0);
    const totalProfit = filteredItems.reduce((sum, item) => sum + (item.profit || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Satışlar</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Yeni Satış Ekle
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="card bg-blue-50 border-blue-100">
                    <p className="text-sm font-medium text-blue-600">Toplam Kayıt</p>
                    <p className="text-2xl font-bold text-blue-900">{filteredItems.length}</p>
                    <p className="text-xs text-blue-500 mt-1">
                        {sales.length} Satış, {workOrders.length} İş Emri
                    </p>
                </div>
                <div className="card bg-green-50 border-green-100">
                    <p className="text-sm font-medium text-green-600">Toplam Ciro</p>
                    <p className="text-2xl font-bold text-green-900">₺{totalRevenue.toLocaleString()}</p>
                </div>
                <div className="card bg-purple-50 border-purple-100">
                    <p className="text-sm font-medium text-purple-600">Toplam Kar</p>
                    <p className="text-2xl font-bold text-purple-900">₺{totalProfit.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Müşteri veya araç ara..."
                            className="input-field pl-10"
                        />
                    </div>
                    <button onClick={() => setShowDateRangeModal(true)} className="btn-secondary flex items-center">
                        <CalendarIcon className="h-5 w-5 mr-2" />
                        Tarih Filtresi
                    </button>
                </div>
            </div>

            {/* Sales & Work Orders Table */}
            <div className="card overflow-hidden p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tip
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tarih
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Müşteri
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Araç
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tutar
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kar
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Durum
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredItems.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge-${item.type === 'sale' ? 'info' : 'warning'}`}>
                                            {item.type === 'sale' ? 'Satış' : 'İş Emri'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(item.sale_date).toLocaleDateString('tr-TR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.customers?.first_name} {item.customers?.last_name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {item.vehicles?.brand} {item.vehicles?.model}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {item.vehicles?.license_plate}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        ₺{item.sale_price.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                                        ₺{item.profit?.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`badge-${item.status === 'completed' ? 'success' :
                                            item.status === 'pending' ? 'warning' : 'danger'
                                            }`}>
                                            {item.status === 'completed' ? 'Tamamlandı' :
                                                item.status === 'pending' ? 'Bekliyor' : 'İptal'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Add Sale Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Yeni Satış Ekle</h2>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const newSale: Sale = {
                                id: `demo-sale-${Date.now()}`,
                                customer_id: 'demo-customer-1',
                                vehicle_id: 'demo-vehicle-1',
                                sale_date: new Date().toISOString(),
                                sale_price: formData.sale_price,
                                profit: formData.sale_price * 0.1, // Mock profit calculation
                                payment_method: formData.payment_method,
                                status: 'completed',
                                notes: formData.notes,
                                sold_by: 'demo-user',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                                customers: {
                                    id: 'demo-customer-1',
                                    first_name: 'Demo',
                                    last_name: 'Müşteri',
                                    phone: '555-555-5555',
                                    created_by: 'demo',
                                    created_at: '',
                                    updated_at: ''
                                },
                                vehicles: {
                                    id: 'demo-vehicle-1',
                                    customer_id: 'demo-customer-1',
                                    brand: 'Demo',
                                    model: 'Araç',
                                    year: 2024,
                                    license_plate: '34 DEMO 34',
                                    maintenance_status: 'ok',
                                    created_by: 'demo',
                                    created_at: '',
                                    updated_at: ''
                                }
                            };
                            setSales([newSale, ...sales]);
                            setShowModal(false);
                            setFormData({
                                sale_price: 0,
                                payment_method: 'Nakit',
                                notes: '',
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Satış Fiyatı (₺)</label>
                                <input
                                    type="number"
                                    required
                                    className="input-field"
                                    value={formData.sale_price}
                                    onChange={e => setFormData({ ...formData, sale_price: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ödeme Yöntemi</label>
                                <select
                                    className="input-field"
                                    value={formData.payment_method}
                                    onChange={e => setFormData({ ...formData, payment_method: e.target.value as any })}
                                >
                                    <option value="Nakit">Nakit</option>
                                    <option value="Kredi Kartı">Kredi Kartı</option>
                                    <option value="Banka Transferi">Banka Transferi</option>
                                    <option value="Taksit">Taksit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Notlar</label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn-primary">
                                    Kaydet
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Date Range Modal */}
            {showDateRangeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Tarih Aralığı Seç</h2>
                            <button
                                onClick={() => setShowDateRangeModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Başlangıç Tarihi
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.start}
                                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bitiş Tarihi
                                </label>
                                <input
                                    type="date"
                                    value={dateRange.end}
                                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                    className="input-field"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setShowDateRangeModal(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button onClick={handleDateRangeFilter} className="btn-primary">
                                    Filtrele
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sales;
