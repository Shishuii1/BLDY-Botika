import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Pill, Package, ShoppingCart, FileText,
  Truck, Users, Settings, User,
} from 'lucide-react';

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/medicines', icon: Pill, label: 'Medicines' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/pos', icon: ShoppingCart, label: 'POS' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/suppliers', icon: Truck, label: 'Suppliers' },
  { to: '/customers', icon: Users, label: 'Customers' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar({ collapsed, onClose }) {
  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full transition-all`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">P</div>
          {!collapsed && <span className="font-bold text-lg text-primary">PharmaSys</span>}
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-primary/10'
              }`
            }
          >
            <Icon size={20} />
            {!collapsed && <span className="font-medium">{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
