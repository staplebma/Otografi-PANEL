import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  HomeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const navigation = [
    { name: 'Ana Sayfa', href: '/', icon: HomeIcon },
    { name: 'Müşteriler', href: '/customers', icon: UsersIcon },
    { name: 'Satışlar', href: '/sales', icon: CurrencyDollarIcon },
    { name: 'Bildirimler', href: '/notifications', icon: BellIcon },
    { name: 'Ayarlar', href: '/settings', icon: Cog6ToothIcon },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 mb-8">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">OT</span>
          </div>
          <span className="ml-3 text-xl font-bold text-gray-900">Otografi</span>
        </div>

        {/* Navigation */}
        <div className="flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-6 w-6" aria-hidden="true" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
