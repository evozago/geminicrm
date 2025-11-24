
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { SalesSniper } from './components/SalesSniper';
import { ChurnAnalysis } from './components/ChurnAnalysis';
import { ClientPortfolio } from './components/ClientPortfolio';
import { LayoutDashboard, Target, Users, Menu, X, ShoppingBag, Briefcase, AlertTriangle, CheckCircle } from 'lucide-react';
import { checkSupabaseConnection } from './services/dataService';

enum View {
  DASHBOARD = 'dashboard',
  SNIPER = 'sniper',
  CHURN = 'churn',
  PORTFOLIO = 'portfolio'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // System Status
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'online' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const check = async () => {
      const result = await checkSupabaseConnection();
      if (result.success) {
        setConnectionStatus('online');
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.message || 'Erro desconhecido');
      }
    };
    check();
  }, []);

  const NavItem = ({ view, icon: Icon, label }: { view: View, icon: any, label: string }) => (
    <button
      onClick={() => {
        setCurrentView(view);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        currentView === view 
          ? 'bg-primary/10 text-primary font-bold' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center gap-2 mb-10 text-slate-900">
            <div className="bg-primary text-white p-2 rounded-lg">
              <ShoppingBag size={24} />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">ModaIntel</h1>
              <p className="text-xs text-slate-400">Retail Intelligence</p>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            <NavItem view={View.DASHBOARD} icon={LayoutDashboard} label="Dashboard Geral" />
            <NavItem view={View.PORTFOLIO} icon={Briefcase} label="Carteira de Clientes" />
            <NavItem view={View.SNIPER} icon={Target} label="Sniper de Vendas" />
            <NavItem view={View.CHURN} icon={Users} label="Clientes Sumidos" />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className={`p-4 rounded-xl text-white ${connectionStatus === 'error' ? 'bg-red-500' : 'bg-gradient-to-br from-slate-900 to-slate-800'}`}>
               <p className="text-xs font-medium text-white/70 mb-1">Status do Sistema</p>
               
               {connectionStatus === 'checking' && (
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                   <span className="text-sm font-semibold">Conectando...</span>
                 </div>
               )}

               {connectionStatus === 'online' && (
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                   <span className="text-sm font-semibold">Online • Supabase</span>
                 </div>
               )}

               {connectionStatus === 'error' && (
                 <div className="flex flex-col gap-1">
                   <div className="flex items-center gap-2">
                     <AlertTriangle size={14} className="text-white" />
                     <span className="text-sm font-bold">Erro de Conexão</span>
                   </div>
                   <span className="text-[10px] leading-tight opacity-90">{errorMessage?.slice(0, 40)}...</span>
                 </div>
               )}

             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-600">
            <Menu size={24} />
          </button>
          <span className="font-bold text-slate-900">ModaIntel</span>
          <div className="w-6" /> {/* Spacer */}
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {currentView === View.DASHBOARD && <Dashboard />}
            {currentView === View.PORTFOLIO && <ClientPortfolio />}
            {currentView === View.SNIPER && <SalesSniper />}
            {currentView === View.CHURN && <ChurnAnalysis />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
