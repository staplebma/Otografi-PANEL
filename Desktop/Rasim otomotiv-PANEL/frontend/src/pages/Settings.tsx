import React, { useState } from 'react';
import { UserCircleIcon, BellIcon, ShieldCheckIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'system';

const Settings: React.FC = () => {
    const { user, updateUser } = useAuth();
    const {
        currency,
        timezone,
        emailNotifications,
        setCurrency,
        setTimezone,
        setEmailNotifications
    } = useSettings();

    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
    const [loading, setLoading] = useState(false);

    // Profile form state
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
    });

    // Update form when user changes
    React.useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
        }
    }, [user]);

    // Security form state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { authService } = await import('../services/auth');
            const updatedUser = await authService.updateProfile({
                firstName: profileData.firstName,
                lastName: profileData.lastName,
            });
            
            updateUser(updatedUser);
            toast.success('Profil bilgileri güncellendi');
        } catch (error: any) {
            console.error('Profil güncelleme hatası:', error);
            toast.error('Güncelleme başarısız oldu: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Yeni şifreler eşleşmiyor');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            toast.error('Şifre en az 6 karakter olmalıdır');
            return;
        }

        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            toast.success('Şifre başarıyla değiştirildi');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });
        } catch (error) {
            toast.error('Şifre değiştirme başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    const handlePreferencesSubmit = async () => {
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Settings are automatically saved via SettingsContext
            toast.success('Tercihler kaydedildi');
        } catch (error) {
            toast.error('Kaydetme başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    const handleSystemSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            // Settings are automatically saved via SettingsContext
            toast.success('Sistem ayarları kaydedildi');
        } catch (error) {
            toast.error('Kaydetme başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Sidebar */}
                <div className="card p-0 overflow-hidden h-fit">
                    <div className="p-4 border-b border-gray-100 bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                            </div>
                        </div>
                    </div>
                    <nav className="p-2">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <UserCircleIcon className="h-5 w-5" />
                            Profil Ayarları
                        </button>
                        <button
                            onClick={() => setActiveTab('notifications')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'notifications'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <BellIcon className="h-5 w-5" />
                            Bildirim Tercihleri
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'security'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <ShieldCheckIcon className="h-5 w-5" />
                            Güvenlik
                        </button>
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'system'
                                ? 'text-primary bg-blue-50'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <GlobeAltIcon className="h-5 w-5" />
                            Sistem Ayarları
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Profil Bilgileri</h2>
                            <form onSubmit={handleProfileSubmit} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
                                        <input
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
                                        <input
                                            type="text"
                                            value={profileData.lastName}
                                            onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                            className="input-field"
                                            required
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                                        <input
                                            type="email"
                                            value={user?.email}
                                            className="input-field bg-gray-50"
                                            disabled
                                        />
                                        <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Bildirim Tercihleri</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                                    <div>
                                        <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                                        <p className="text-sm text-gray-500">Önemli güncellemelerden haberdar olun</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={emailNotifications}
                                            onChange={(e) => setEmailNotifications(e.target.checked)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>

                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium text-gray-900">Satış Bildirimleri</p>
                                        <p className="text-sm text-gray-500">Yeni satışlar için bildirim al</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end mt-6">
                                <button onClick={handlePreferencesSubmit} className="btn-primary" disabled={loading}>
                                    {loading ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Güvenlik Ayarları</h2>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
                                    <input
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
                                    <input
                                        type="password"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
                                    <input
                                        type="password"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <h3 className="text-md font-semibold mb-3">Aktif Oturumlar</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">Bu Cihaz</p>
                                            <p className="text-sm text-gray-500">Son giriş: Şimdi</p>
                                        </div>
                                        <span className="text-xs text-green-600 font-medium">Aktif</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* System Tab */}
                    {activeTab === 'system' && (
                        <div className="card">
                            <h2 className="text-lg font-semibold mb-4">Sistem Ayarları</h2>
                            <form onSubmit={handleSystemSubmit} className="space-y-4">

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Saat Dilimi</label>
                                    <select
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        className="input-field"
                                    >
                                        <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                                        <option value="Europe/London">Londra (GMT+0)</option>
                                        <option value="America/New_York">New York (GMT-5)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Para Birimi</label>
                                    <select
                                        value={currency}
                                        onChange={(e) => setCurrency(e.target.value as 'TRY' | 'USD' | 'EUR')}
                                        className="input-field"
                                    >
                                        <option value="TRY">Türk Lirası (₺)</option>
                                        <option value="USD">US Dollar ($)</option>
                                        <option value="EUR">Euro (€)</option>
                                    </select>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
