import React, { useEffect, useState } from 'react';
import { BarChart, Activity, TrendingUp, DollarSign, Package } from 'lucide-react';
import { getDashboardStats } from '../services/dataService';
import { AnalyticsCategoria, SalesEvolutionData } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await getDashboardStats();
      setStats(data);
      setOffline(Boolean((data as any)?.offline));
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <div className="p-10 text-center">Carregando Inteligência...</div>;

  return (
    <div className="space-y-6 animate-fade-in p-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Faturamento Estimado</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                R$ {(stats?.kpis?.faturamentoMes ?? 0).toLocaleString('pt-BR')}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Lucro Líquido (Est.)</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                R$ {(stats?.kpis?.lucroEstimado ?? 0).toLocaleString('pt-BR')}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-slate-500 font-medium">Total de Pedidos</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-1">
                {stats?.kpis?.totalPedidos ?? 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Package size={24} />
            </div>
          </div>
        </div>
      </div>

      {offline && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <Activity size={18} />
          <div>
            <p className="font-semibold">Exibindo dados demonstrativos</p>
            <p className="text-sm">Não foi possível ler o Supabase; mostramos uma amostra para continuar a navegação.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart size={20} className="text-slate-400" /> Categorias Mais Lucrativas
          </h3>
          <div className="space-y-4">
            {stats?.charts?.categories?.map((cat: AnalyticsCategoria, idx: number) => (
              <div key={idx} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{cat.categoria_produto}</span>
                  <span className="text-emerald-600 font-bold">R$ {cat.faturamento_bruto?.toLocaleString('pt-BR')}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div 
                    className="bg-slate-800 h-2.5 rounded-full" 
                    style={{ width: `${(cat.faturamento_bruto / (stats?.charts?.categories[0]?.faturamento_bruto || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Lucro: R$ {cat.lucro_estimado?.toLocaleString('pt-BR')} | {cat.pecas_vendidas} peças
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolução Temporal Simples */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Activity size={20} className="text-slate-400" /> Evolução Recente
          </h3>
          <div className="space-y-4">
             {stats?.charts?.evolution?.slice(0, 6).map((evo: SalesEvolutionData, idx: number) => (
               <div key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2">
                 <span className="text-sm font-bold text-slate-600">{evo.mes_ano}</span>
                 <div className="text-right">
                    <div className="text-sm font-bold text-slate-800">
                      R$ {evo.faturamento_liquido_real?.toLocaleString('pt-BR')}
                    </div>
                    <div className="text-xs text-slate-400">
                      {evo.total_atendimentos} atendimentos
                    </div>
                 </div>
               </div>
             ))}
             {(!stats?.charts?.evolution || stats?.charts?.evolution.length === 0) && (
               <div className="text-center text-slate-400 py-10">Sem dados de evolução disponíveis.</div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};