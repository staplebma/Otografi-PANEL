import React, { useState, useEffect } from 'react';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    XMarkIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    TruckIcon,
    WrenchScrewdriverIcon,
    ClockIcon
} from '@heroicons/react/24/outline';
import { getDemoCustomers, saveDemoCustomers, getDemoVehicles, saveDemoVehicles, getDemoWorkOrders, saveDemoWorkOrders, clearOldDemoData, isDemoMode } from '../services/demo';
import { VEHICLE_BRANDS, VEHICLE_YEARS } from '../services/vehicleData';
import { notificationsService } from '../services/notifications';
import { customersService } from '../services/customers';
import { vehiclesService } from '../services/vehicles';
import toast from 'react-hot-toast';

// Types


interface WorkOrderPart {
    id: string;
    name: string;
    code: string;
    given_date: string;
    expiration_date: string;
    price: number;
}

interface WorkOrder {
    id: string;
    vehicle_id: string;
    status: 'pending' | 'completed' | 'cancelled';
    parts: WorkOrderPart[];
    created_at: string;
    service_date: string;
    notes: string;
}

const CustomersVehicles: React.FC = () => {
    // State
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>(getDemoVehicles() as any[]);
    const [workOrders, setWorkOrders] = useState<WorkOrder[]>(getDemoWorkOrders() as any[]);
    const [searchQuery, setSearchQuery] = useState('');
    const [historyFilterYear, setHistoryFilterYear] = useState<string>('all');

    // Advanced Filter State
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        lastOperationDays: 'all', // all, 7, 30, 90
        hasVehicle: 'all', // all, yes, no
        city: 'all',
    });

    // Modals State
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
    const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
    const [showEditVehicleModal, setShowEditVehicleModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Selection State
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        notes: '',
        // Initial Vehicle Data
        hasVehicle: true,
        brand: '',
        model: '',
        year: '',
        vin: '',
        mileage: '',
        license_plate: '',
        color: '',
        fuel_type: ''
    });

    // Standalone Vehicle Form State
    const [vehicleForm, setVehicleForm] = useState({
        brand: '',
        model: '',
        year: '',
        vin: '',
        mileage: '',
        license_plate: '',
        color: '',
        fuel_type: ''
    });

    // Work Order Form State
    const [workOrderForm, setWorkOrderForm] = useState({
        service_date: new Date().toISOString().split('T')[0],
        notes: '',
        parts: [] as WorkOrderPart[]
    });

    const [newPart, setNewPart] = useState({
        name: '',
        code: '',
        given_date: new Date().toISOString().split('T')[0],
        expiration_date: '',
        price: 0
    });

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            if (isDemoMode()) {
                // Clear old demo data on first load
                const hasCleared = localStorage.getItem('demoDataCleared');
                if (!hasCleared) {
                    clearOldDemoData();
                    localStorage.setItem('demoDataCleared', 'true');
                }

                const loadedCustomers = getDemoCustomers();
                setCustomers(loadedCustomers);
            } else {
                // Production mode - API'den veri çek
                try {
                    const [loadedCustomers, loadedVehicles] = await Promise.all([
                        customersService.getAll(),
                        vehiclesService.getAll()
                    ]);
                    setCustomers(loadedCustomers as Customer[]);
                    setVehicles(loadedVehicles as Vehicle[]);
                } catch (error: any) {
                    console.error('Veri yükleme hatası:', error);
                    toast.error('Veriler yüklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
                }
            }
        };

        loadData();
    }, []);

    // Filtered Data with Advanced Filters
    const filteredCustomers = customers.filter(customer => {
        // Search filter
        const matchesSearch = customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.phone.includes(searchQuery);

        if (!matchesSearch) return false;

        // City filter
        if (filters.city !== 'all' && customer.city !== filters.city) {
            return false;
        }

        // Has vehicle filter
        if (filters.hasVehicle !== 'all') {
            const customerVehicles = vehicles.filter(v => v.customer_id === customer.id);
            const hasVehicles = customerVehicles.length > 0;
            if (filters.hasVehicle === 'yes' && !hasVehicles) return false;
            if (filters.hasVehicle === 'no' && hasVehicles) return false;
        }

        // Price filter (total spent)
        const customerVehicleIds = vehicles.filter(v => v.customer_id === customer.id).map(v => v.id);
        const customerWorkOrders = workOrders.filter(wo => customerVehicleIds.includes(wo.vehicle_id));
        const totalSpent = customerWorkOrders.reduce((sum, wo) => {
            return sum + wo.parts.reduce((partSum, part) => partSum + (part.price || 0), 0);
        }, 0);

        if (filters.minPrice && totalSpent < parseFloat(filters.minPrice)) return false;
        if (filters.maxPrice && totalSpent > parseFloat(filters.maxPrice)) return false;

        // Last operation filter
        if (filters.lastOperationDays !== 'all') {
            const lastWorkOrder = customerWorkOrders.sort((a, b) =>
                new Date(b.service_date || b.created_at).getTime() - new Date(a.service_date || a.created_at).getTime()
            )[0];

            if (lastWorkOrder) {
                const daysSinceLastOp = Math.floor((Date.now() - new Date(lastWorkOrder.service_date || lastWorkOrder.created_at).getTime()) / (1000 * 60 * 60 * 24));
                const maxDays = parseInt(filters.lastOperationDays);
                if (daysSinceLastOp > maxDays) return false;
            } else if (filters.lastOperationDays !== 'all') {
                return false; // No operations, filter out
            }
        }

        return true;
    });

    // Get unique cities for filter
    const uniqueCities = Array.from(new Set(customers.map(c => c.city).filter(Boolean)));

    // Helper for status badge
    const getStatusBadge = (status?: string) => {
        const badges = {
            ok: { text: 'Tamamlandı', class: 'bg-green-100 text-green-800' },
            warning: { text: 'Parça Bekliyor', class: 'bg-yellow-100 text-yellow-800' },
            critical: { text: 'Ödeme Bekliyor', class: 'bg-red-100 text-red-800' }
        };
        return badges[status as keyof typeof badges] || { text: 'Bilinmiyor', class: 'bg-gray-100 text-gray-800' };
    };

    // Handlers
    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent double submission
        if (isSubmitting) {
            return;
        }

        // Validation
        if (!formData.first_name || !formData.last_name || !formData.phone) {
            toast.error('Lütfen zorunlu alanları doldurun');
            return;
        }

        if (formData.hasVehicle && formData.vin && formData.vin.length !== 17) {
            toast.error('Şase numarası (VIN) 17 karakter olmalıdır.');
            return;
        }

        // Confirmation before proceeding
        if (!window.confirm('Müşteriyi eklemek istediğinize emin misiniz?')) {
            return;
        }

        setIsSubmitting(true);
        try {
            let newCustomer: Customer;

            // Demo mode için localStorage'a kaydet
            if (isDemoMode()) {
                newCustomer = {
                    id: `cust-${Date.now()}`,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email,
                    phone: formData.phone,
                    address: formData.address,
                    city: formData.city,
                    notes: formData.notes,
                    created_at: new Date().toISOString(),
                    created_by: 'demo',
                    updated_at: new Date().toISOString()
                };

                // Add Vehicle if selected (demo mode)
                if (formData.hasVehicle && formData.brand) {
                    const newVehicle: Vehicle = {
                        id: `veh-${Date.now()}`,
                        customer_id: newCustomer.id,
                        brand: formData.brand,
                        model: formData.model,
                        year: Number(formData.year),
                        license_plate: formData.license_plate,
                        vin: formData.vin,
                        mileage: Number(formData.mileage) || 0,
                        maintenance_status: 'ok',
                        created_by: 'demo',
                        updated_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    };
                    const updatedVehicles = [...vehicles, newVehicle];
                    setVehicles(updatedVehicles);
                    saveDemoVehicles(updatedVehicles);
                }

                const updatedCustomers = [newCustomer, ...customers];
                setCustomers(updatedCustomers);
                saveDemoCustomers(updatedCustomers);
            } else {
                // Production mode - API'ye istek at
                // customersService.create zaten camelCase'e çeviriyor, bu yüzden first_name formatında gönderiyoruz
                const customerData: Partial<Customer> = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email || undefined,
                    phone: formData.phone,
                    address: formData.address || undefined,
                    city: formData.city || undefined,
                    notes: formData.notes || undefined,
                };

                // Müşteriyi oluştur
                newCustomer = await customersService.create(customerData);

                // Müşteri başarıyla oluşturulduktan sonra araç ekle
                if (formData.hasVehicle && formData.brand && formData.license_plate) {
                    try {
                        const vehicleData = {
                            customerId: newCustomer.id,
                            brand: formData.brand,
                            model: formData.model,
                            year: Number(formData.year),
                            licensePlate: formData.license_plate,
                            vin: formData.vin || undefined,
                            mileage: formData.mileage ? Number(formData.mileage) : undefined,
                            color: formData.color || undefined,
                            fuelType: formData.fuel_type || undefined,
                        };

                        await vehiclesService.create(vehicleData);
                        toast.success('Müşteri ve araç başarıyla oluşturuldu');
                    } catch (vehicleError: any) {
                        console.error('Araç ekleme hatası:', vehicleError);
                        toast.error('Müşteri oluşturuldu ancak araç eklenirken hata oluştu: ' + (vehicleError.response?.data?.message || vehicleError.message));
                    }
                } else {
                    toast.success('Müşteri başarıyla oluşturuldu');
                }

                // Müşteri listesini yenile
                const refreshedCustomers = await customersService.getAll();
                setCustomers(refreshedCustomers as Customer[]);

                // Araç listesini yenile
                const refreshedVehicles = await vehiclesService.getAll();
                setVehicles(refreshedVehicles as Vehicle[]);
            }

            setShowAddModal(false);
            resetForm();
        } catch (error: any) {
            console.error('Müşteri ekleme hatası:', error);
            toast.error('Müşteri eklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAddVehicleOnly = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        if (vehicleForm.vin && vehicleForm.vin.length !== 17) {
            toast.error('Şase numarası (VIN) 17 karakter olmalıdır.');
            return;
        }

        try {
            if (isDemoMode()) {
                // Demo mode - localStorage'a kaydet
                const newVehicle: Vehicle = {
                    id: `veh-${Date.now()}`,
                    customer_id: selectedCustomer.id,
                    brand: vehicleForm.brand,
                    model: vehicleForm.model,
                    year: Number(vehicleForm.year),
                    license_plate: vehicleForm.license_plate,
                    vin: vehicleForm.vin,
                    mileage: Number(vehicleForm.mileage) || 0,
                    maintenance_status: 'ok',
                    created_by: 'demo',
                    updated_at: new Date().toISOString(),
                    created_at: new Date().toISOString()
                };

                const updatedVehicles = [...vehicles, newVehicle];
                setVehicles(updatedVehicles);
                saveDemoVehicles(updatedVehicles);
                toast.success('Araç başarıyla eklendi');
            } else {
                // Production mode - API'ye istek at
                const vehicleData = {
                    customerId: selectedCustomer.id,
                    brand: vehicleForm.brand,
                    model: vehicleForm.model,
                    year: Number(vehicleForm.year),
                    licensePlate: vehicleForm.license_plate,
                    vin: vehicleForm.vin || undefined,
                    mileage: vehicleForm.mileage ? Number(vehicleForm.mileage) : undefined,
                    color: vehicleForm.color || undefined,
                    fuelType: vehicleForm.fuel_type || undefined,
                };

                await vehiclesService.create(vehicleData);
                toast.success('Araç başarıyla eklendi');

                // Araç listesini yenile
                const refreshedVehicles = await vehiclesService.getAll();
                setVehicles(refreshedVehicles as Vehicle[]);
            }

            setShowAddVehicleModal(false);
            setVehicleForm({
                brand: '',
                model: '',
                year: '',
                vin: '',
                mileage: '',
                license_plate: '',
                color: '',
                fuel_type: ''
            });
        } catch (error: any) {
            console.error('Araç ekleme hatası:', error);
            toast.error('Araç eklenirken hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedVehicle) return;

        if (vehicleForm.vin && vehicleForm.vin.length !== 17) {
            toast.error('Şase numarası (VIN) 17 karakter olmalıdır.');
            return;
        }

        try {
            if (isDemoMode()) {
                // Demo mode - localStorage'a kaydet
                const updatedVehicles = vehicles.map(v => {
                    if (v.id === selectedVehicle.id) {
                        return {
                            ...v,
                            brand: vehicleForm.brand,
                            model: vehicleForm.model,
                            year: Number(vehicleForm.year),
                            license_plate: vehicleForm.license_plate,
                            vin: vehicleForm.vin,
                            mileage: Number(vehicleForm.mileage) || 0
                        };
                    }
                    return v;
                });

                setVehicles(updatedVehicles);
                saveDemoVehicles(updatedVehicles);

                // Update selected vehicle to reflect changes immediately in UI
                const updatedVehicle = updatedVehicles.find(v => v.id === selectedVehicle.id);
                if (updatedVehicle) setSelectedVehicle(updatedVehicle);

                toast.success('Araç bilgileri güncellendi');
            } else {
                // Production mode - API'ye istek at
                const vehicleData = {
                    brand: vehicleForm.brand,
                    model: vehicleForm.model,
                    year: Number(vehicleForm.year),
                    licensePlate: vehicleForm.license_plate,
                    vin: vehicleForm.vin || undefined,
                    mileage: vehicleForm.mileage ? Number(vehicleForm.mileage) : undefined,
                };

                await vehiclesService.update(selectedVehicle.id, vehicleData);
                toast.success('Araç bilgileri güncellendi');

                // Araç listesini yenile
                const refreshedVehicles = await vehiclesService.getAll();
                setVehicles(refreshedVehicles as Vehicle[]);

                // Update selected vehicle
                const updatedVehicle = refreshedVehicles.find(v => v.id === selectedVehicle.id);
                if (updatedVehicle) setSelectedVehicle(updatedVehicle as Vehicle);
            }

            setShowEditVehicleModal(false);
        } catch (error: any) {
            console.error('Araç güncelleme hatası:', error);
            toast.error('Araç güncellenirken hata oluştu: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEditCustomer = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCustomer) return;

        const updatedCustomers = customers.map(c => {
            if (c.id === selectedCustomer.id) {
                return {
                    ...c,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    phone: formData.phone,
                    email: formData.email,
                    address: formData.address,
                    city: formData.city,
                    notes: formData.notes
                };
            }
            return c;
        });

        setCustomers(updatedCustomers);
        saveDemoCustomers(updatedCustomers);

        // Update selected customer
        const updatedCustomer = updatedCustomers.find(c => c.id === selectedCustomer.id);
        if (updatedCustomer) setSelectedCustomer(updatedCustomer);

        toast.success('Müşteri bilgileri güncellendi');
        setShowEditCustomerModal(false);
    };

    const handleDeleteCustomer = (id: string) => {
        if (window.confirm('Bu müşteriyi silmek istediğinizden emin misiniz?')) {
            const updatedCustomers = customers.filter(c => c.id !== id);
            setCustomers(updatedCustomers);
            saveDemoCustomers(updatedCustomers);
            // Also delete vehicles
            const updatedVehicles = vehicles.filter(v => v.customer_id !== id);
            setVehicles(updatedVehicles);
            saveDemoVehicles(updatedVehicles);
            toast.success('Müşteri silindi');
            if (selectedCustomer?.id === id) setShowDetailModal(false);
        }
    };

    const handleAddPart = () => {
        if (!newPart.name || !newPart.code || !newPart.given_date || !newPart.expiration_date) {
            toast.error('Lütfen tüm parça bilgilerini doldurun');
            return;
        }

        const part: WorkOrderPart = {
            id: `part-${Date.now()}`,
            ...newPart
        };

        setWorkOrderForm({
            ...workOrderForm,
            parts: [...workOrderForm.parts, part]
        });

        setNewPart({
            name: '',
            code: '',
            given_date: new Date().toISOString().split('T')[0],
            expiration_date: '',
            price: 0
        });
    };

    const handleCreateWorkOrder = async () => {
        if (!selectedVehicle) return;
        if (workOrderForm.parts.length === 0) {
            toast.error('Lütfen en az bir parça ekleyin');
            return;
        }

        const newWorkOrder: WorkOrder = {
            id: `wo-${Date.now()}`,
            vehicle_id: selectedVehicle.id,
            status: 'pending',
            parts: workOrderForm.parts,
            created_at: new Date().toISOString(),
            service_date: workOrderForm.service_date,
            notes: workOrderForm.notes
        };

        const updatedWorkOrders = [newWorkOrder, ...workOrders];
        setWorkOrders(updatedWorkOrders);
        saveDemoWorkOrders(updatedWorkOrders);

        // Create sales record from work order
        const totalPrice = workOrderForm.parts.reduce((sum, part) => sum + (part.price || 0), 0);
        const customer = customers.find(c => c.id === selectedVehicle.customer_id);

        if (customer && totalPrice > 0) {
            const { getDemoSales, saveDemoSales } = await import('../services/demo');
            const currentSales = getDemoSales();

            const newSale = {
                id: `sale-${Date.now()}`,
                customer_id: customer.id,
                vehicle_id: selectedVehicle.id,
                sale_date: workOrderForm.service_date,
                sale_price: totalPrice,
                profit: totalPrice * 0.2, // 20% profit margin
                payment_method: 'Nakit',
                status: 'completed',
                notes: `İş Emri: ${workOrderForm.parts.map(p => p.name).join(', ')}`,
                sold_by: 'current-user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                customers: {
                    id: customer.id,
                    first_name: customer.first_name,
                    last_name: customer.last_name,
                    phone: customer.phone,
                    created_by: 'demo',
                    created_at: customer.created_at,
                    updated_at: customer.created_at
                },
                vehicles: {
                    id: selectedVehicle.id,
                    customer_id: selectedVehicle.customer_id,
                    brand: selectedVehicle.brand,
                    model: selectedVehicle.model,
                    year: selectedVehicle.year,
                    license_plate: selectedVehicle.license_plate,
                    maintenance_status: 'ok',
                    created_by: 'demo',
                    created_at: selectedVehicle.created_at,
                    updated_at: selectedVehicle.created_at
                }
            };

            saveDemoSales([newSale, ...currentSales]);
        }

        // Send email notification to admin
        try {
            if (customer) {
                await fetch('http://localhost:3000/api/notifications/work-order', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                    },
                    body: JSON.stringify({
                        customerName: `${customer.first_name} ${customer.last_name}`,
                        vehicleInfo: `${selectedVehicle.brand} ${selectedVehicle.model} (${selectedVehicle.license_plate})`,
                        parts: workOrderForm.parts.map(p => ({
                            name: p.name,
                            code: p.code,
                            price: p.price,
                            given_date: p.given_date
                        })),
                        serviceDate: workOrderForm.service_date
                    })
                });
            }
        } catch (error) {
            console.error('Email notification failed:', error);
        }

        toast.success('İş emri oluşturuldu ve satış kaydedildi');
        setShowWorkOrderModal(false);
        setWorkOrderForm({ service_date: new Date().toISOString().split('T')[0], notes: '', parts: [] });

        // Trigger notification
        notificationsService.add({
            user_id: 'current-user',
            title: 'Yeni İş Emri',
            message: `${selectedVehicle.license_plate} plakalı araç için yeni iş emri oluşturuldu.`,
            type: 'service',
            is_read: false
        });
    };



    const resetForm = () => {
        setFormData({
            first_name: '',
            last_name: '',
            phone: '',
            email: '',
            city: '',
            address: '',
            notes: '',
            hasVehicle: true,
            brand: '',
            model: '',
            year: '',
            vin: '',
            mileage: '',
            license_plate: '',
            color: '',
            fuel_type: ''
        });
    };

    const availableModels = formData.brand ? VEHICLE_BRANDS.find(b => b.name === formData.brand)?.models || [] : [];
    const availableVehicleFormModels = vehicleForm.brand ? VEHICLE_BRANDS.find(b => b.name === vehicleForm.brand)?.models || [] : [];

    // Render Helpers
    const getCustomerVehicles = (customerId: string) => vehicles.filter(v => v.customer_id === customerId);
    const getVehicleWorkOrders = (vehicleId: string) => workOrders.filter(wo => wo.vehicle_id === vehicleId);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
                    <p className="text-sm text-gray-500 mt-1">Müşteri ve araç yönetim paneli</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="btn-primary flex items-center"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Yeni Müşteri Ekle
                    </button>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="card p-4 space-y-4">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="İsim, soyisim veya telefon ile ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-10"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-primary text-white' : ''}`}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        Gelişmiş Filtre
                    </button>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Toplam Harcama (₺)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                    className="input-field text-sm"
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                    className="input-field text-sm"
                                />
                            </div>
                        </div>

                        {/* Last Operation */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Son İşlem
                            </label>
                            <select
                                value={filters.lastOperationDays}
                                onChange={(e) => setFilters({ ...filters, lastOperationDays: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value="all">Tümü</option>
                                <option value="7">Son 7 gün</option>
                                <option value="30">Son 30 gün</option>
                                <option value="90">Son 90 gün</option>
                            </select>
                        </div>

                        {/* Has Vehicle */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Araç Durumu
                            </label>
                            <select
                                value={filters.hasVehicle}
                                onChange={(e) => setFilters({ ...filters, hasVehicle: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value="all">Tümü</option>
                                <option value="yes">Aracı Var</option>
                                <option value="no">Aracı Yok</option>
                            </select>
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Şehir
                            </label>
                            <select
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="input-field text-sm"
                            >
                                <option value="all">Tümü</option>
                                {uniqueCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        {/* Reset Filters */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({
                                    minPrice: '',
                                    maxPrice: '',
                                    lastOperationDays: 'all',
                                    hasVehicle: 'all',
                                    city: 'all',
                                })}
                                className="btn-secondary w-full text-sm"
                            >
                                Filtreleri Temizle
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                    <span className="font-semibold">{filteredCustomers.length}</span> müşteri bulundu
                </p>
                {(filters.minPrice || filters.maxPrice || filters.lastOperationDays !== 'all' ||
                    filters.hasVehicle !== 'all' || filters.city !== 'all') && (
                        <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                            Filtre aktif
                        </span>
                    )}
            </div>

            {/* Customer List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map(customer => {
                    const customerVehicles = getCustomerVehicles(customer.id);
                    return (
                        <div
                            key={customer.id}
                            onClick={() => { setSelectedCustomer(customer); setShowDetailModal(true); }}
                            className="card hover:shadow-md transition-shadow cursor-pointer group border border-transparent hover:border-primary/20"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {customer.first_name[0]}{customer.last_name[0]}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                            {customer.first_name} {customer.last_name}
                                        </h3>
                                        <p className="text-xs text-gray-500">{customer.city || 'Şehir belirtilmemiş'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">Tel:</span>
                                    {customer.phone}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-900">Araçlar:</span>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium">
                                        {customerVehicles.length} Adet
                                    </span>
                                </div>
                            </div>

                            {customerVehicles.length > 0 && (
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2">Son Eklenen Araç:</p>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-800">
                                        <TruckIcon className="h-4 w-4 text-gray-400" />
                                        {customerVehicles[customerVehicles.length - 1].brand} {customerVehicles[customerVehicles.length - 1].model}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Yeni Müşteri Ekle</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddCustomer} className="p-6 space-y-6">
                            {/* Personal Info */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider border-b pb-2">Kişisel Bilgiler</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Ad <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Soyad <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Telefon <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="tel"
                                            className="input-field"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">E-posta</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Adres</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vehicle Info */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b pb-2">
                                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Araç Bilgileri</h3>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.hasVehicle}
                                            onChange={e => setFormData({ ...formData, hasVehicle: e.target.checked })}
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-sm text-gray-600">Araç Ekle</span>
                                    </label>
                                </div>

                                {formData.hasVehicle && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <label className="label">Marka</label>
                                            <select
                                                className="input-field"
                                                value={formData.brand}
                                                onChange={e => setFormData({ ...formData, brand: e.target.value, model: '' })}
                                            >
                                                <option value="">Seçiniz</option>
                                                {VEHICLE_BRANDS.map(b => (
                                                    <option key={b.name} value={b.name}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Model</label>
                                            <select
                                                className="input-field"
                                                value={formData.model}
                                                onChange={e => setFormData({ ...formData, model: e.target.value })}
                                                disabled={!formData.brand}
                                            >
                                                <option value="">Seçiniz</option>
                                                {availableModels.map(m => (
                                                    <option key={m} value={m}>{m}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Yıl</label>
                                            <select
                                                className="input-field"
                                                value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            >
                                                <option value="">Seçiniz</option>
                                                {VEHICLE_YEARS.map(y => (
                                                    <option key={y} value={y}>{y}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="label">Plaka</label>
                                            <input
                                                type="text"
                                                className="input-field uppercase"
                                                placeholder="34 ABC 123"
                                                value={formData.license_plate}
                                                onChange={e => setFormData({ ...formData, license_plate: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="label">KM</label>
                                            <input
                                                type="number"
                                                className="input-field"
                                                value={formData.mileage}
                                                onChange={e => setFormData({ ...formData, mileage: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Şase No (VIN) <span className="text-xs text-gray-500 font-normal">(17 Karakter)</span></label>
                                            <input
                                                type="text"
                                                className="input-field uppercase"
                                                value={formData.vin}
                                                maxLength={17}
                                                onChange={e => setFormData({ ...formData, vin: e.target.value })}
                                            />
                                            {formData.vin.length > 0 && formData.vin.length !== 17 && (
                                                <p className="text-xs text-red-500 mt-1">Şase numarası 17 karakter olmalıdır. ({formData.vin.length}/17)</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label">Renk</label>
                                            <input
                                                type="text"
                                                className="input-field"
                                                placeholder="Örn: Beyaz, Siyah, Gri"
                                                value={formData.color}
                                                onChange={e => setFormData({ ...formData, color: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Yakıt Tipi</label>
                                            <select
                                                className="input-field"
                                                value={formData.fuel_type}
                                                onChange={e => setFormData({ ...formData, fuel_type: e.target.value })}
                                            >
                                                <option value="">Seçiniz</option>
                                                <option value="Benzin">Benzin</option>
                                                <option value="Dizel">Dizel</option>
                                                <option value="LPG">LPG</option>
                                                <option value="Elektrik">Elektrik</option>
                                                <option value="Hibrit">Hibrit</option>
                                                <option value="Plug-in Hibrit">Plug-in Hibrit</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {showDetailModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl my-8 overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-16 w-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                                        {selectedCustomer.first_name[0]}{selectedCustomer.last_name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-2">
                                            {selectedCustomer.first_name} {selectedCustomer.last_name}
                                            <button
                                                onClick={() => {
                                                    setFormData({
                                                        first_name: selectedCustomer.first_name,
                                                        last_name: selectedCustomer.last_name,
                                                        phone: selectedCustomer.phone,
                                                        email: selectedCustomer.email || '',
                                                        city: selectedCustomer.city || '',
                                                        address: selectedCustomer.address || '',
                                                        notes: selectedCustomer.notes || '',
                                                        hasVehicle: false,
                                                        brand: '', model: '', year: '', vin: '', mileage: '', license_plate: '',
                                                        color: '', fuel_type: ''
                                                    });
                                                    setShowEditCustomerModal(true);
                                                }}
                                                className="text-white/60 hover:text-white transition-colors"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                        </h2>
                                        <p className="text-blue-100 flex items-center gap-2 mt-1">
                                            <UserIcon className="h-4 w-4" />
                                            Müşteri Detayları
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDetailModal(false)} className="text-white/80 hover:text-white">
                                    <XMarkIcon className="h-8 w-8" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column: Customer Info */}
                            <div className="lg:col-span-1 space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">İletişim Bilgileri</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Telefon</label>
                                            <p className="text-gray-900 font-medium">{selectedCustomer.phone}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">E-posta</label>
                                            <p className="text-gray-900 font-medium">{selectedCustomer.email || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Şehir</label>
                                            <p className="text-gray-900 font-medium">{selectedCustomer.city || '-'}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Adres</label>
                                            <p className="text-gray-900 font-medium">{selectedCustomer.address || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleDeleteCustomer(selectedCustomer.id)}
                                    className="w-full btn-outline border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                    Müşteriyi Sil
                                </button>
                            </div>

                            {/* Right Column: Vehicles */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center justify-between mb-4 border-b pb-2">
                                    <h3 className="text-lg font-bold text-gray-900">Kayıtlı Araçlar</h3>
                                    <button
                                        onClick={() => {
                                            setVehicleForm({
                                                brand: '',
                                                model: '',
                                                year: '',
                                                vin: '',
                                                mileage: '',
                                                license_plate: '',
                                                color: '',
                                                fuel_type: ''
                                            });
                                            setShowAddVehicleModal(true);
                                        }}
                                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                                    >
                                        <PlusIcon className="h-4 w-4" />
                                        Araç Ekle
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {getCustomerVehicles(selectedCustomer.id).length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                            <TruckIcon className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                            <p className="text-gray-500">Bu müşteriye ait araç bulunmuyor.</p>
                                        </div>
                                    ) : (
                                        getCustomerVehicles(selectedCustomer.id).map(vehicle => {
                                            const badge = getStatusBadge(vehicle.maintenance_status);
                                            return (
                                                <div key={vehicle.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                <TruckIcon className="h-6 w-6 text-gray-600" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-gray-900">
                                                                    {vehicle.brand} {vehicle.model}
                                                                </h4>
                                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mt-1">
                                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono font-medium">
                                                                        {vehicle.license_plate}
                                                                    </span>
                                                                    <span>•</span>
                                                                    <span>{vehicle.year}</span>
                                                                    <span>•</span>
                                                                    <span>{(vehicle.mileage || 0).toLocaleString()} km</span>
                                                                </div>
                                                                <div className="mt-2 flex items-center gap-2">
                                                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.class}`}>
                                                                        {badge.text}
                                                                    </span>
                                                                    {vehicle.last_maintenance_date && (
                                                                        <span className="text-xs text-gray-500">
                                                                            Son Bakım: {new Date(vehicle.last_maintenance_date).toLocaleDateString('tr-TR')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setSelectedVehicle(vehicle);
                                                                setVehicleForm({
                                                                    brand: vehicle.brand,
                                                                    model: vehicle.model,
                                                                    year: vehicle.year.toString(),
                                                                    vin: vehicle.vin || '',
                                                                    mileage: (vehicle.mileage || 0).toString(),
                                                                    license_plate: vehicle.license_plate,
                                                                    color: vehicle.color || '',
                                                                    fuel_type: vehicle.fuel_type || ''
                                                                });
                                                                setShowEditVehicleModal(true);
                                                            }}
                                                            className="text-gray-400 hover:text-primary"
                                                        >
                                                            <PencilIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>

                                                    {/* Quick Actions or Info */}
                                                    <div className="mt-4 flex gap-2">
                                                        <button
                                                            onClick={() => { setSelectedVehicle(vehicle); setShowHistoryModal(true); }}
                                                            className="flex-1 btn-secondary text-xs py-1.5 flex items-center justify-center gap-1"
                                                        >
                                                            <ClockIcon className="h-4 w-4" />
                                                            Geçmiş İşlemler
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedVehicle(vehicle); setShowWorkOrderModal(true); }}
                                                            className="flex-1 btn-primary text-xs py-1.5 flex items-center justify-center gap-1"
                                                        >
                                                            <WrenchScrewdriverIcon className="h-4 w-4" />
                                                            Yeni İş Emri
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* New Work Order Modal */}
            {showWorkOrderModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Yeni İş Emri</h2>
                                <p className="text-sm text-gray-500">{selectedVehicle.brand} {selectedVehicle.model} - {selectedVehicle.license_plate}</p>
                            </div>
                            <button onClick={() => setShowWorkOrderModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Service Date */}
                            <div>
                                <label className="label">İşlem Tarihi</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={workOrderForm.service_date}
                                    onChange={e => setWorkOrderForm({ ...workOrderForm, service_date: e.target.value })}
                                />
                            </div>

                            {/* Add Part Form */}
                            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Parça Ekle</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Parça Adı</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={newPart.name}
                                            onChange={e => setNewPart({ ...newPart, name: e.target.value })}
                                            placeholder="Örn: Fren Balatası"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Parça Kodu</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={newPart.code}
                                            onChange={e => setNewPart({ ...newPart, code: e.target.value })}
                                            placeholder="Örn: FRN-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Veriliş Tarihi</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={newPart.given_date}
                                            onChange={e => setNewPart({ ...newPart, given_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Sonraki Değişim</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={newPart.expiration_date}
                                            onChange={e => setNewPart({ ...newPart, expiration_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Fiyat (TL)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={newPart.price}
                                            onChange={e => setNewPart({ ...newPart, price: Number(e.target.value) })}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleAddPart}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    Listeye Ekle
                                </button>
                            </div>

                            {/* Added Parts List */}
                            {workOrderForm.parts.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Eklenecek Parçalar</h3>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parça</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Kod</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Veriliş Tarihi</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Sonraki Değişim</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fiyat</th>
                                                    <th className="px-4 py-2"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {workOrderForm.parts.map((part, index) => (
                                                    <tr key={index}>
                                                        <td className="px-4 py-2 text-sm text-gray-900">{part.name}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{part.code}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{part.given_date}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{part.expiration_date}</td>
                                                        <td className="px-4 py-2 text-sm text-gray-500">{part.price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                                        <td className="px-4 py-2 text-right">
                                                            <button
                                                                onClick={() => {
                                                                    const newParts = [...workOrderForm.parts];
                                                                    newParts.splice(index, 1);
                                                                    setWorkOrderForm({ ...workOrderForm, parts: newParts });
                                                                }}
                                                                className="text-red-500 hover:text-red-700"
                                                            >
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="label">Notlar</label>
                                <textarea
                                    className="input-field"
                                    rows={3}
                                    value={workOrderForm.notes}
                                    onChange={e => setWorkOrderForm({ ...workOrderForm, notes: e.target.value })}
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    onClick={() => setShowWorkOrderModal(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleCreateWorkOrder}
                                    className="btn-primary"
                                >
                                    İş Emrini Oluştur
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* History Modal */}
            {showHistoryModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Geçmiş İşlemler</h2>
                                <p className="text-sm text-gray-500">{selectedVehicle.brand} {selectedVehicle.model} - {selectedVehicle.license_plate}</p>
                            </div>
                            <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Year Filter */}
                            <div className="mb-6 flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                                <span className="text-sm font-medium text-gray-700">Yıl Filtresi:</span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setHistoryFilterYear('all')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${historyFilterYear === 'all'
                                            ? 'bg-primary text-white shadow-sm'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                            }`}
                                    >
                                        Tümü
                                    </button>
                                    {Array.from(new Set(
                                        getVehicleWorkOrders(selectedVehicle.id)
                                            .flatMap(wo => wo.parts.map(p => p.given_date.split('-')[0]))
                                    )).sort().map(year => (
                                        <button
                                            key={year}
                                            onClick={() => setHistoryFilterYear(year)}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${historyFilterYear === year
                                                ? 'bg-primary text-white shadow-sm'
                                                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                                }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {getVehicleWorkOrders(selectedVehicle.id).length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Bu araç için kayıtlı işlem geçmişi bulunamadı.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {getVehicleWorkOrders(selectedVehicle.id)
                                        .filter(wo => {
                                            if (historyFilterYear === 'all') return true;
                                            // Show WO if it has any part from the selected year
                                            return wo.parts.some(p => p.given_date.startsWith(historyFilterYear));
                                        })
                                        .map(wo => {
                                            // Filter parts to show only those matching the year if a year is selected
                                            const displayParts = historyFilterYear === 'all'
                                                ? wo.parts
                                                : wo.parts.filter(p => p.given_date.startsWith(historyFilterYear));

                                            if (displayParts.length === 0) return null;

                                            return (
                                                <div key={wo.id} className="border rounded-lg overflow-hidden">
                                                    <div className="bg-gray-50 px-4 py-2 border-b flex justify-between items-center">
                                                        <span className="font-medium text-gray-900">
                                                            {new Date(wo.service_date || wo.created_at).toLocaleDateString('tr-TR')}
                                                        </span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${wo.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {wo.status === 'completed' ? 'Tamamlandı' : 'Bekliyor'}
                                                        </span>
                                                    </div>
                                                    <div className="p-4">
                                                        <table className="min-w-full">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Parça</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Kod</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Değişim</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Sonraki Değişim</th>
                                                                    <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Fiyat</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="text-sm">
                                                                {displayParts.map(part => {
                                                                    const today = new Date();
                                                                    const exp = part.expiration_date ? new Date(part.expiration_date) : null;
                                                                    let statusInfo = { color: 'text-gray-900', bg: '', text: '' };

                                                                    if (exp) {
                                                                        const diffTime = exp.getTime() - today.getTime();
                                                                        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                                        if (daysLeft <= 0) {
                                                                            statusInfo = { color: 'text-gray-500', bg: 'bg-gray-50', text: 'Süresi Doldu' };
                                                                        } else if (daysLeft <= 5) {
                                                                            statusInfo = { color: 'text-red-700 font-medium', bg: 'bg-red-50', text: `${daysLeft} gün kaldı` };
                                                                        } else if (daysLeft <= 60) {
                                                                            statusInfo = { color: 'text-yellow-700 font-medium', bg: 'bg-yellow-50', text: `${daysLeft} gün kaldı` };
                                                                        } else {
                                                                            statusInfo = { color: 'text-green-700', bg: 'bg-green-50', text: `${daysLeft} gün kaldı` };
                                                                        }
                                                                    }

                                                                    return (
                                                                        <tr key={part.id} className={statusInfo.bg}>
                                                                            <td className="py-2 px-2 text-gray-900 font-medium">{part.name}</td>
                                                                            <td className="py-2 px-2 text-gray-500">{part.code}</td>
                                                                            <td className="py-2 px-2 text-gray-500">{part.given_date}</td>
                                                                            <td className="py-2 px-2">
                                                                                <div className="flex flex-col">
                                                                                    <span className={statusInfo.color}>{part.expiration_date}</span>
                                                                                    {statusInfo.text && (
                                                                                        <span className={`text-xs ${statusInfo.color}`}>{statusInfo.text}</span>
                                                                                    )}
                                                                                </div>
                                                                            </td>
                                                                            <td className="py-2 px-2 text-gray-500">{part.price?.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</td>
                                                                        </tr>
                                                                    );
                                                                })}
                                                            </tbody>
                                                        </table>
                                                        {wo.notes && (
                                                            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                                <span className="font-medium">Not:</span> {wo.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Add Vehicle Modal (Standalone) */}
            {showAddVehicleModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Araç Ekle</h2>
                            <button onClick={() => setShowAddVehicleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleAddVehicleOnly} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="label">Marka</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.brand}
                                        onChange={e => setVehicleForm({ ...vehicleForm, brand: e.target.value, model: '' })}
                                    >
                                        <option value="">Seçiniz</option>
                                        {VEHICLE_BRANDS.map(b => (
                                            <option key={b.name} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Model</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.model}
                                        onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                        disabled={!vehicleForm.brand}
                                    >
                                        <option value="">Seçiniz</option>
                                        {availableVehicleFormModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Yıl</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.year}
                                        onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                                    >
                                        <option value="">Seçiniz</option>
                                        {VEHICLE_YEARS.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Plaka</label>
                                    <input
                                        type="text"
                                        className="input-field uppercase"
                                        placeholder="34 ABC 123"
                                        value={vehicleForm.license_plate}
                                        onChange={e => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">KM</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={vehicleForm.mileage}
                                        onChange={e => setVehicleForm({ ...vehicleForm, mileage: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Şase No (VIN) <span className="text-xs text-gray-500 font-normal">(17 Karakter)</span></label>
                                    <input
                                        type="text"
                                        className="input-field uppercase"
                                        value={vehicleForm.vin}
                                        maxLength={17}
                                        onChange={e => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                                    />
                                    {vehicleForm.vin.length > 0 && vehicleForm.vin.length !== 17 && (
                                        <p className="text-xs text-red-500 mt-1">Şase numarası 17 karakter olmalıdır. ({vehicleForm.vin.length}/17)</p>
                                    )}
                                </div>
                                <div>
                                    <label className="label">Renk</label>
                                    <input
                                        type="text"
                                        className="input-field"
                                        placeholder="Örn: Beyaz, Siyah, Gri"
                                        value={vehicleForm.color}
                                        onChange={e => setVehicleForm({ ...vehicleForm, color: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Yakıt Tipi</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.fuel_type}
                                        onChange={e => setVehicleForm({ ...vehicleForm, fuel_type: e.target.value })}
                                    >
                                        <option value="">Seçiniz</option>
                                        <option value="Benzin">Benzin</option>
                                        <option value="Dizel">Dizel</option>
                                        <option value="LPG">LPG</option>
                                        <option value="Elektrik">Elektrik</option>
                                        <option value="Hibrit">Hibrit</option>
                                        <option value="Plug-in Hibrit">Plug-in Hibrit</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowAddVehicleModal(false)}
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
            {/* Edit Vehicle Modal */}
            {showEditVehicleModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Araç Düzenle</h2>
                            <button onClick={() => setShowEditVehicleModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditVehicle} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="label">Marka</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.brand}
                                        onChange={e => setVehicleForm({ ...vehicleForm, brand: e.target.value, model: '' })}
                                    >
                                        <option value="">Seçiniz</option>
                                        {VEHICLE_BRANDS.map(b => (
                                            <option key={b.name} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Model</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.model}
                                        onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })}
                                        disabled={!vehicleForm.brand}
                                    >
                                        <option value="">Seçiniz</option>
                                        {availableVehicleFormModels.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Yıl</label>
                                    <select
                                        className="input-field"
                                        value={vehicleForm.year}
                                        onChange={e => setVehicleForm({ ...vehicleForm, year: e.target.value })}
                                    >
                                        <option value="">Seçiniz</option>
                                        {VEHICLE_YEARS.map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Plaka</label>
                                    <input
                                        type="text"
                                        className="input-field uppercase"
                                        placeholder="34 ABC 123"
                                        value={vehicleForm.license_plate}
                                        onChange={e => setVehicleForm({ ...vehicleForm, license_plate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">KM</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={vehicleForm.mileage}
                                        onChange={e => setVehicleForm({ ...vehicleForm, mileage: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="label">Şase No (VIN) <span className="text-xs text-gray-500 font-normal">(17 Karakter)</span></label>
                                    <input
                                        type="text"
                                        className="input-field uppercase"
                                        value={vehicleForm.vin}
                                        maxLength={17}
                                        onChange={e => setVehicleForm({ ...vehicleForm, vin: e.target.value })}
                                    />
                                    {vehicleForm.vin.length > 0 && vehicleForm.vin.length !== 17 && (
                                        <p className="text-xs text-red-500 mt-1">Şase numarası 17 karakter olmalıdır. ({vehicleForm.vin.length}/17)</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowEditVehicleModal(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn-primary">
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Customer Modal */}
            {showEditCustomerModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-900">Müşteri Düzenle</h2>
                            <button onClick={() => setShowEditCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleEditCustomer} className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Ad <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.first_name}
                                            onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Soyad <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            className="input-field"
                                            value={formData.last_name}
                                            onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Telefon <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="tel"
                                            className="input-field"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">E-posta</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Adres</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="label">Şehir</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setShowEditCustomerModal(false)}
                                    className="btn-secondary"
                                >
                                    İptal
                                </button>
                                <button type="submit" className="btn-primary">
                                    Güncelle
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomersVehicles;
