import { Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';

export const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar fijo a la izquierda */}
      <Sidebar />
      
      {/* Contenido principal dinámico */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header superior simple */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800">Panel de Control</h2>
        </header>

        {/* Zona del Outlet (donde se renderizan las rutas hijas) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
