import React, { useState } from 'react';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { DEMO_VEHICLES, DEMO_MAINTENANCE_PARTS } from '../services/demo';
import toast from 'react-hot-toast';

const Vehicles: React.FC = () => {
    const [vehicles, setVehicles] = useState<Vehicle[]>(DEMO_VEHICLES);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'ok' | 'warning' | 'critical'>('all');
    const [showModal, setShowModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [selectedYear, setSelectedYear] = useState(2025);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        license_plate: '',
        mileage: 0,
        vin: '',
    });

    const openDetailModal = (vehicle: Vehicle) => {
        setSelectedVehicle(vehicle);
        setShowDetailModal(true);
    };

    const filteredVehicles = vehicles.filter((vehicle) => {
        const matchesSearch =
            vehicle.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.model.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterStatus === 'all' || vehicle.maintenance_status === filterStatus;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Araçlar</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Yeni Araç Ekle
                </button>
            </div>

            {/* Filters */}
            <div className="card">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Plaka, marka veya model ara..."
                            className="input-field pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-5 w-5 text-gray-400" />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="input-field w-40"
                        >
                            <option value="all">Tüm Durumlar</option>
                            <option value="ok">Sorunsuz</option>
                            <option value="warning">Bakım Yaklaştı</option>
                            <option value="critical">Kritik</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Vehicles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="card hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {vehicle.brand} {vehicle.model}
                                </h3>
                                <p className="text-sm text-gray-500">{vehicle.year}</p>
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
                                        ? 'Bakım Yaklaştı'
                                        : 'Sorunsuz'}
                            </span>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Plaka:</span>
                                <span className="font-medium text-gray-900">{vehicle.license_plate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kilometre:</span>
                                <span className="font-medium text-gray-900">{vehicle.mileage?.toLocaleString()} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Son Bakım:</span>
                                <span className="font-medium text-gray-900">
                                    {vehicle.last_maintenance_date
                                        ? new Date(vehicle.last_maintenance_date).toLocaleDateString('tr-TR')
                                        : '-'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Sonraki Bakım:</span>
                                <span className="font-medium text-gray-900">
                                    {vehicle.next_maintenance_date
                                        ? new Date(vehicle.next_maintenance_date).toLocaleDateString('tr-TR')
                                        : '-'}
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => openDetailModal(vehicle)}
                                className="text-primary hover:text-primary-600 text-sm font-medium"
                            >
                                Detayları Gör →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500">Araç bulunamadı</p>
                </div>
            )}

            {/* Add Vehicle Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Yeni Araç Ekle</h2>
                        </div>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const newVehicle: Vehicle = {
                                id: `demo-vehicle-${Date.now()}`,
                                customer_id: 'demo-customer-1', // Default to first customer for demo
                                ...formData,
                                maintenance_status: 'ok',
                                created_by: 'demo-user',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            };
                            setVehicles([...vehicles, newVehicle]);
                            setShowModal(false);
                            setFormData({
                                brand: '',
                                model: '',
                                year: new Date().getFullYear(),
                                license_plate: '',
                                mileage: 0,
                                vin: '',
                            });
                        }} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Marka</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yıl</label>
                                    <input
                                        type="number"
                                        required
                                        className="input-field"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Kilometre</label>
                                    <input
                                        type="number"
                                        required
                                        className="input-field"
                                        value={formData.mileage}
                                        onChange={e => setFormData({ ...formData, mileage: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plaka</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.license_plate}
                                    onChange={e => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
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

            {/* Vehicle Detail Modal */}
            {showDetailModal && selectedVehicle && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Araç Detayı</h3>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {selectedVehicle.brand} {selectedVehicle.model}
                                </h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false);
                                    setSelectedVehicle(null);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                            {/* Vehicle Info */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="grid grid-cols-4 gap-4 mb-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Model Yılı</p>
                                        <p className="font-semibold text-gray-900">{selectedVehicle.year}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Plaka</p>
                                        <p className="font-semibold text-gray-900">{selectedVehicle.license_plate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Kilometre</p>
                                        <p className="font-semibold text-gray-900">{selectedVehicle.mileage?.toLocaleString()} km</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Durum</p>
                                        <span
                                            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                                                selectedVehicle.maintenance_status === 'critical'
                                                    ? 'bg-red-100 text-red-800'
                                                    : selectedVehicle.maintenance_status === 'warning'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                        >
                                            {selectedVehicle.maintenance_status === 'critical'
                                                ? 'Kritik'
                                                : selectedVehicle.maintenance_status === 'warning'
                                                ? 'Bakım Yaklaştı'
                                                : 'Sorunsuz'}
                                        </span>
                                    </div>
                                </div>

                                {/* Year Tabs */}
                                <div className="flex gap-4 mb-6">
                                    {[2025, 2026, 2027].map((year) => (
                                        <button
                                            key={year}
                                            onClick={() => setSelectedYear(year)}
                                            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                                selectedYear === year
                                                    ? 'bg-blue-600 text-white'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>

                                {/* Parts Table */}
                                <div className="bg-gray-50 rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Parça Kodu
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Parça Adı
                                                </th>
                                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Marka / Model
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {DEMO_MAINTENANCE_PARTS
                                                .filter(m => m.vehicle_id === selectedVehicle.id && m.year === selectedYear)
                                                .flatMap(m => m.parts)
                                                .map((part, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                            {part.part_code}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-700">
                                                            {part.part_name}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-600">
                                                            {part.brand_model}
                                                        </td>
                                                    </tr>
                                                ))}
                                            {DEMO_MAINTENANCE_PARTS.filter(m => m.vehicle_id === selectedVehicle.id && m.year === selectedYear).length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                                                        Bu yıl için bakım parçası kaydı bulunmuyor
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vehicles;
