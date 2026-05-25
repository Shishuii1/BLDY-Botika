import { Bell, Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useAuthStore } from '../../app/store';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuthStore();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.list(true).then((r) => r.data.data).catch(() => []),
    refetchInterval: 60000,
    retry: false,
    enabled: !!user,
  });

  const unread = notifications?.filter((n) => !n.is_read)?.length || 0;

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6">
      <button type="button" onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
        <Menu size={22} />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <button type="button" onClick={toggle} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button type="button" className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-700 ml-2">
          <div className="text-right">
            <p className="text-sm font-medium">{user?.full_name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role_name?.replace('_', ' ')}</p>
          </div>
          <button
            type="button"
            onClick={() => { logout(); navigate('/login'); }}
            className="p-2 rounded-lg hover:bg-red-50 text-red-500"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
