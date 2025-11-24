import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, LineChart, Line } from 'recharts';
import { getDashboardStats } from '../services/dataService';
import { analyzeTrends } from '../services/geminiService';
import { AnalyticsCategoria, SalesEvolutionData } from '../types';
import { BrainCircuit, Loader2, DollarSign, ShoppingBag, TrendingUp, ArrowRightLeft } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{
    kpis: { faturamentoMes: number; lucroEstimado: number; totalPedidos: number };
    charts: { evolution: SalesEvolutionData[]; categories: AnalyticsCategoria[] };
  } | null>(null);
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    getDashboardStats().then(setStats);
  }, []);

  const handleAiAnalysis = async () => {
    if (!stats) return;
    setAnalyzing(true);
    // Analyze the evolution data
    const result = await analyzeTrends(stats.charts.evolution);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  if (!stats) return <div className="p-12 text-center text-slate-500"><Loader2 className="animate-spin h-8 w-8 mx-auto mb-2"/>Carregando dados...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Visão Geral da Loja</h1>
        <button
          onClick={handleAiAnalysis}
          disabled={analyzing}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all disabled:opacity-70 text-sm font-medium"
        >
          {analyzing ? <Loader2 className="animate-spin h-4 w-4" /> : <BrainCircuit className="h-4 w-4" />}
          {analyzing ? 'Analisando...' : 'IA Insights'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign size={80} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Faturamento (Mês Atual)</p>
              <h3 className="text-2xl font-bold text-slate-800">
                {stats.kpis.faturamentoMes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <TrendingUp size={80} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Lucro Estimado</p>
              <h3 className="text-2xl font-bold text-slate-800">
                 {stats.kpis.lucroEstimado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShoppingBag size={80} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Pedidos</p>
              <h3 className="text-2xl font-bold text-slate-800">{stats.kpis.totalPedidos}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Result */}
      {aiAnalysis && (
        <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl animate-fade-in">
          <h3 className="flex items-center gap-2 text-indigo-900 font-semibold mb-3">
            <BrainCircuit className="h-5 w-5" /> Análise do Consultor Virtual
          </h3>
          <div className="prose prose-sm text-indigo-800 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales vs Exchanges (Line Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <ArrowRightLeft className="text-slate-400" size={20} />
               Evolução: Vendas vs Trocas
             </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.charts.evolution} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Line type="monotone" dataKey="vendas" name="Vendas (R$)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="trocas" name="Trocas (R$)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Categories (Bar Chart) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
               <DollarSign className="text-slate-400" size={20} />
               Top 5 Categorias (Faturamento)
             </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.charts.categories} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" />
                <YAxis dataKey="categoria" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="faturamento_total" fill="#6366f1" radius={[0, 4, 4, 0]} name="Faturamento Total" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
