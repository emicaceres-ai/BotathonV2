import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Heart, Menu, X, LogOut, Search, Settings } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-teleton-light text-teleton-red font-medium' : 'text-gray-600 hover:bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center z-20 relative">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-teleton-red fill-current" />
          <span className="font-bold text-gray-800">Teletón Admin</span>
        </div>
        <button onClick={toggleSidebar} className="text-gray-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-10 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3 border-b border-gray-100">
            <Heart className="h-8 w-8 text-teleton-red fill-current" />
            <div>
              <h1 className="font-bold text-xl text-gray-800">Teletón</h1>
              <p className="text-xs text-gray-500">Gestión de Voluntarios</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link 
              to="/" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/')}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </Link>
            
            <Link 
              to="/busqueda" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/busqueda')}`}
            >
              <Search size={20} />
              <span>Búsqueda/Acción</span>
            </Link>
            
            <Link 
              to="/admin" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin')}`}
            >
              <Settings size={20} />
              <span>Administrador</span>
            </Link>
            
            <Link 
              to="/nuevo" 
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/nuevo')}`}
            >
              <UserPlus size={20} />
              <span>Nuevo Voluntario</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <button className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-gray-700 w-full rounded-lg hover:bg-gray-50 transition-colors">
              <LogOut size={20} />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;