
import React, { useState } from 'react';
import { Search, Crosshair, MessageCircle, UserCheck, Phone, Calendar, DollarSign } from 'lucide-react';
import { runSalesSniper } from '../services/dataService';
import { SalesSniperMatch } from '../types';

export const SalesSniper: React.FC = () => {
  const [filters, setFilters] = useState({
    categoria: 'Vestido',
    tamanho: '6',
    marca: 'Lui Bambini',
    genero: 'Menina'
  });
  
  const [results, setResults] = useState<SalesSniperMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setHasSearched(true);
    const matches = await runSalesSniper(filters.marca, filters.tamanho, filters.genero, filters.categoria);
    setResults(matches);
    setLoading(false);
  };

  const getWhatsAppLink = (match: SalesSniperMatch) => {
    const cleanPhone = match.cliente.telefone.replace(/\D/g, '');
    // Message defined in prompt: "Olá [Nome], chegou reposição da [Marca] no tamanho [Tamanho] que você gosta!"
    const message = `Olá ${match.cliente.nome}, chegou reposição da ${filters.marca} no tamanho ${filters.tamanho} que você gosta!`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-8 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Crosshair size={150} />
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Crosshair className="text-red-500" /> O Sniper de Vendas
          </h1>
          <p className="text-slate-300 max-w-2xl">
            Recomendação Ativa: Encontre os clientes perfeitos para a coleção que acabou de chegar.
            A IA cruza dados de compras passadas para prever interesse futuro.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-6 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Search size={18} className="text-primary" /> Configurar Alvo
          </h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Categoria</label>
              <select 
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none border bg-slate-50"
                value={filters.categoria}
                onChange={(e) => setFilters({...filters, categoria: e.target.value})}
              >
                <option>Vestido</option>
                <option>Conjunto</option>
                <option>Calça</option>
                <option>Blusa</option>
                <option>Macacão</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Marca</label>
              <select 
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none border bg-slate-50"
                value={filters.marca}
                onChange={(e) => setFilters({...filters, marca: e.target.value})}
              >
                <option>Lui Bambini</option>
                <option>Denim Kids</option>
                <option>Mini Fashion</option>
                <option>Animê</option>
                <option>Momi</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tamanho</label>
              <select 
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none border bg-slate-50"
                value={filters.tamanho}
                onChange={(e) => setFilters({...filters, tamanho: e.target.value})}
              >
                <option>2</option>
                <option>4</option>
                <option>6</option>
                <option>8</option>
                <option>10</option>
                <option>12</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Gênero</label>
              <select 
                className="w-full border-slate-200 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary outline-none border bg-slate-50"
                value={filters.genero}
                onChange={(e) => setFilters({...filters, genero: e.target.value})}
              >
                <option>Menina</option>
                <option>Menino</option>
                <option>Unissex</option>
              </select>
            </div>

            <button 
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-all transform active:scale-95 flex justify-center items-center gap-2 shadow-lg shadow-slate-900/20 mt-4"
            >
              {loading ? (
                 <span className="flex items-center gap-2">
                   <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Buscando...
                 </span>
              ) : (
                 <>
                   <Crosshair size={20} /> BUSCAR CLIENTES
                 </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-semibold text-slate-800">
               Resultados da Busca
               {hasSearched && <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full text-xs">{results.length} encontrados</span>}
             </h3>
          </div>

          {!hasSearched && (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-400">
              <Search size={48} className="mx-auto mb-4 opacity-20" />
              <p>Configure os filtros ao lado e clique em "Buscar Clientes" para encontrar compradores potenciais.</p>
            </div>
          )}

          {hasSearched && results.length === 0 && !loading && (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500">
              <p>Nenhum cliente encontrado com estes critérios exatos nos últimos 6 meses.</p>
              <p className="text-sm mt-2">Tente mudar o tamanho ou a marca.</p>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                      <th className="p-4">Nome do Cliente</th>
                      <th className="p-4">Última Compra</th>
                      <th className="p-4">Valor Gasto (Hist.)</th>
                      <th className="p-4 text-center">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.map((match) => (
                      <tr key={match.cliente.telefone || Math.random()} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{match.cliente.nome}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                            <Phone size={10} /> {match.cliente.telefone}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(match.ultimaCompraData).toLocaleDateString('pt-BR')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 font-medium text-emerald-600">
                             <DollarSign size={14} />
                             {match.totalGastoHistorico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <a 
                            href={getWhatsAppLink(match)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors shadow-sm hover:shadow-md"
                          >
                            <MessageCircle size={16} />
                            Chamar no WhatsApp
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
