import React, { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Upload, Settings, Heart, LogOut, PlusCircle } from 'lucide-react';
import { useAccessibility } from '../providers/AccessibilityProvider';
import AccessibilityPanel from './accessibility/AccessibilityPanel';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAccessibility();

  const isHighContrast = settings.highContrast;

  const menuItems = [
    { id: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/buscar', label: 'Gestión Voluntarios', icon: Users },
    { id: '/admin', label: 'Carga Masiva', icon: Upload },
  ];

  const baseClass = `flex flex-col h-screen w-64 border-r transition-colors duration-300 fixed left-0 top-0 z-50 ${
    isHighContrast ? 'bg-black border-white' : 'bg-white border-gray-200 shadow-xl'
  }`;

  const itemClass = (isActive: boolean) => `
    flex items-center w-full px-6 py-4 text-sm font-bold transition-all duration-200 border-l-4
    ${isActive 
      ? (isHighContrast 
          ? 'bg-gray-800 text-yellow-400 border-yellow-400' 
          : '') 
      : (isHighContrast 
          ? 'text-gray-400 border-transparent hover:text-white hover:bg-gray-900' 
          : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-[#5C2D91]')
    }
  `;

  return (
    <div className={`flex min-h-screen ${isHighContrast ? 'bg-black text-white' : ''}`} style={{ backgroundColor: isHighContrast ? '#000000' : 'var(--t-gray-light)' }}>
      {/* Sidebar */}
      <div className={baseClass}>
        {/* Brand Logo */}
        <div className={`h-20 flex items-center px-6 border-b ${isHighContrast ? 'border-white' : 'border-gray-100'}`}>
          <div className={`p-2 rounded-full mr-3 ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-red)', color: isHighContrast ? '#000000' : '#FFFFFF' }}>
            <Heart className="h-5 w-5 fill-current" />
          </div>
          <div>
            <h1 className={`text-lg font-extrabold leading-none ${isHighContrast ? 'text-white' : ''}`} style={{ color: isHighContrast ? '#FFFFFF' : 'var(--t-gray-dark)' }}>TELETÓN</h1>
            <span className={`text-[10px] uppercase font-bold tracking-widest ${isHighContrast ? 'text-yellow-400' : ''}`} style={{ color: isHighContrast ? '#FFFF00' : 'var(--t-purple)' }}>Voluntariado</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 py-6 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.id || (item.id === '/dashboard' && location.pathname === '/');
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.id)}
                className={itemClass(isActive)}
                style={!isHighContrast && isActive ? {
                  backgroundColor: 'rgba(230, 0, 38, 0.1)',
                  color: 'var(--t-red)',
                  borderLeftColor: 'var(--t-red)'
                } : !isHighContrast ? {
                  color: 'var(--t-gray-dark)'
                } : {}}
                aria-current={isActive ? 'page' : undefined}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Quick Action */}
        <div className="px-6 pb-6">
          <button
            onClick={() => navigate('/voluntarios/nuevo')}
            className={`w-full flex items-center justify-center px-4 py-3 font-bold text-sm transition-all active:scale-95 ${
              isHighContrast
                ? 'bg-transparent border-2 border-green-400 text-green-400 hover:bg-green-400 hover:text-black'
                : 'text-white'
            }`}
            style={!isHighContrast ? {
              backgroundColor: 'var(--t-red)',
              borderRadius: 'var(--radius-normal)',
              boxShadow: 'var(--shadow-card)',
            } : {
              borderRadius: 'var(--radius-normal)',
            }}
            onMouseEnter={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.backgroundColor = 'var(--t-red-dark)';
                e.currentTarget.style.boxShadow = 'var(--shadow-soft)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isHighContrast) {
                e.currentTarget.style.backgroundColor = 'var(--t-red)';
                e.currentTarget.style.boxShadow = 'var(--shadow-card)';
              }
            }}
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Nuevo Voluntario
          </button>
        </div>

        {/* User / Footer */}
        <div className={`p-6 border-t ${isHighContrast ? 'border-white bg-black' : 'border-gray-100 bg-gray-50'}`}>
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${isHighContrast ? 'bg-white text-black' : ''}`} style={{ backgroundColor: isHighContrast ? '#FFFFFF' : 'var(--t-purple)', color: isHighContrast ? '#000000' : '#FFFFFF' }}>
              AD
            </div>
            <div className="ml-3">
              <p className={`text-xs font-bold ${isHighContrast ? 'text-white' : 'text-gray-900'}`}>Admin General</p>
              <p className={`text-[10px] ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>admin@teleton.cl</p>
            </div>
            <button className={`ml-auto p-2 rounded-lg hover:bg-gray-200/50 ${isHighContrast ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-[#D6001C]'}`}>
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen">
        <header className={`sticky top-0 z-30 flex items-center justify-between px-8 py-4 ${isHighContrast ? 'bg-black border-b border-white' : 'bg-white border-b border-gray-200 shadow-sm'}`}>
          <div>
            <h2 className={`text-xl font-bold ${isHighContrast ? 'text-white' : 'text-[#1A1A1A]'}`}>
              {location.pathname === '/' || location.pathname === '/dashboard' ? 'Dashboard Estratégico' :
               location.pathname === '/buscar' ? 'Búsqueda y Acción Preventiva' :
               location.pathname === '/voluntarios/nuevo' ? 'Registro de Voluntario' :
               location.pathname === '/admin' ? 'Centro de Carga de Datos' : 'Teletón'}
            </h2>
            <p className={`text-xs ${isHighContrast ? 'text-gray-400' : 'text-gray-500'}`}>
              Última actualización: {new Date().toLocaleString('es-CL')}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto" style={{ padding: '24px', backgroundColor: 'var(--t-gray-light)' }}>
          {children}
        </main>
      </div>

      {/* Accessibility Panel */}
      <AccessibilityPanel />
    </div>
  );
};

export default Layout;

