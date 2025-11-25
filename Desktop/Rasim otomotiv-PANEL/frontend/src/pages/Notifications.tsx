import React, { useState, useEffect } from 'react';
import { BellIcon, CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { notificationsService } from '../services/notifications';

const Notifications: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            const data = await notificationsService.getAll();
            setNotifications(data);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await notificationsService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsService.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'sale':
                return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
            case 'service':
                return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
            default:
                return <InformationCircleIcon className="h-6 w-6 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Bildirimler</h1>
                <button
                    onClick={markAllAsRead}
                    className="text-sm text-primary hover:text-primary-600 font-medium"
                >
                    Tümünü Okundu İşaretle
                </button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-2 text-gray-500">Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`card flex gap-4 transition-colors ${!notification.is_read ? 'bg-blue-50 border-blue-100' : ''
                                    }`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex-shrink-0 pt-1">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h3 className={`text-lg font-medium ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {new Date(notification.created_at).toLocaleDateString('tr-TR', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <p className={`mt-1 ${!notification.is_read ? 'text-blue-700' : 'text-gray-600'
                                        }`}>
                                        {notification.message}
                                    </p>
                                </div>
                                {!notification.is_read && (
                                    <div className="flex-shrink-0 self-center">
                                        <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}

                {notifications.length === 0 && (
                    <div className="text-center py-12">
                        <BellIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Bildiriminiz bulunmuyor</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications;
