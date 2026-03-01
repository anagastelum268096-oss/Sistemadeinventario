import { Outlet, NavLink, useNavigate } from 'react-router';
import { Music, Calendar as CalendarIcon, Users, User, Menu, X, Package, Tag, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const navigation = [
    { name: 'Inventario', to: '/', icon: Music },
    { name: 'Categorías', to: '/categories', icon: Tag },
    { name: 'Préstamos', to: '/loans', icon: Package },
    { name: 'Calendario', to: '/calendar', icon: CalendarIcon },
    { name: 'Grupos', to: '/groups', icon: Users },
    { name: 'Por Maestro', to: '/teacher-presentations', icon: User },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200"
      >
        {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative w-64 bg-white border-r border-gray-200 flex flex-col h-full z-40 transition-transform duration-300 ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg">
              <Music className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">Gestión Musical</h1>
              <p className="text-xs text-gray-500">Sistema Completo</p>
            </div>
          </div>
        </div>

        {/* User info */}
        {user && (
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                <Badge variant={isAdmin() ? 'default' : 'secondary'} className="text-xs mt-1">
                  {isAdmin() ? 'Administrador' : 'Maestro'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-50 text-purple-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`
                }
              >
                <Icon className="size-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200 space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
          <div className="text-xs text-gray-500 text-center">
            Sistema de Gestión Musical
            <br />
            © 2026
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto w-full lg:w-auto">
        <Outlet />
      </main>
    </div>
  );
}