import React, { useEffect, useState, useMemo } from 'react';
import { getCarteiraClientes } from '../services/dataService';
import { CarteiraCliente } from '../types';
import { 
  Briefcase, 
  User, 
  Calendar, 
  Tag, 
  DollarSign, 
  Filter, 
  Trophy, 
  ShoppingBag,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Crown
} from 'lucide-react';

type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: keyof CarteiraCliente;
  direction: SortDirection;
}

export const ClientPortfolio: React.FC = () => {
  const [data, setData] = useState<CarteiraCliente[]>([]);
  const [vendedores, setVendedores] = useState<string[]>([]);
  const [selectedVendedor, setSelectedVendedor] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Sorting State
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'total_gasto_acumulado', direction: 'desc' });

  useEffect(() => {
    getCarteiraClientes().then(result => {
      setData(result);
      
      // Extract unique salespersons for filter
      const vends = Array.from(new Set(result.map(c => c.vendedor_responsavel))).filter(Boolean).sort();
      setVendedores(vends);
      
      setLoading(false);
    });
  }, []);

  // 1. Filter Data
  const filteredData = useMemo(() => {
    if (selectedVendedor === 'Todos') return data;
    return data.filter(c => c.vendedor_responsavel === selectedVendedor);
  }, [data, selectedVendedor]);

  // 2. Sort Data (Handling Grouping Logic)
  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    if (selectedVendedor === 'Todos' && sortConfig.key !== 'vendedor_responsavel') {
        return sorted.sort((a, b) => {
             const vendA = a.vendedor_responsavel || '';
             const vendB = b.vendedor_responsavel || '';
             if (vendA < vendB) return -1;
             if (vendA > vendB) return 1;
             return 0;
        });
    }

    return sorted;
  }, [filteredData, sortConfig, selectedVendedor]);

  // 3. Paginate Data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const handleSort = (key: keyof CarteiraCliente) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const SortIcon = ({ column }: { column: keyof CarteiraCliente }) => {
    if (sortConfig.key !== column) return <ArrowUpDown size={14} className="text-slate-300 ml-1 inline" />;
    return <ArrowUpDown size={14} className={`ml-1 inline ${sortConfig.direction === 'asc' ? 'text-indigo-600 rotate-180' : 'text-indigo-600'}`} />;
  };

  // Metrics for Top Cards
  const totalFaturamento = filteredData.reduce((acc, curr) => acc + (curr.total_gasto_acumulado || 0), 0);
  const top5Clients = [...filteredData].sort((a,b) => (b.total_gasto_acumulado || 0) - (a.total_gasto_acumulado || 0)).slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <Briefcase className="text-indigo-600" /> Carteira de Clientes
            </h1>
            <p className="text-slate-500 mt-2">
              Gerenciamento completo de carteira.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <Filter size={20} className="text-slate-400 ml-2" />
            <span className="text-sm font-semibold text-slate-600">Vendedor:</span>
            <select 
              value={selectedVendedor}
              onChange={(e) => {
                setSelectedVendedor(e.target.value);
                setCurrentPage(1); // Reset page on filter change
              }}
              className="bg-white border border-slate-200 text-slate-700 text-sm rounded-md focus:ring-indigo-500 focus:border-indigo-500 block p-2 outline-none min-w-[150px]"
            >
              <option value="Todos">Todos (Agrupado)</option>
              {vendedores.map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Top 5 Highlight Section */}
        {filteredData.length > 0 && (
            <div className="mb-8">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Crown size={16} className="text-yellow-500" /> Top 5 VIPs ({selectedVendedor})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {top5Clients.map((client, idx) => (
                        <div key={idx} className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-slate-200 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                            <div className="absolute top-0 right-0 p-2 text-slate-100 font-bold text-4xl -mt-2 -mr-2 select-none group-hover:text-indigo-50">#{idx + 1}</div>
                            <div className="relative z-10">
                                <div className="font-bold text-slate-800 truncate" title={client.cliente}>{client.cliente}</div>
                                <div className="text-emerald-600 font-bold text-sm mt-1">
                                    {(client.total_gasto_acumulado || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <div className="text-xs text-slate-500 mt-2">
                                    {client.qtd_vendas || 0} compras
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Totals Bar */}
        <div className="flex gap-6 mb-6 text-sm border-y border-slate-100 py-4">
            <div>
                <span className="text-slate-500">Total Clientes:</span> <strong className="text-slate-900">{filteredData.length}</strong>
            </div>
            <div>
                <span className="text-slate-500">Faturamento Visível:</span> <strong className="text-emerald-600">{totalFaturamento.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
            </div>
             <div>
                <span className="text-slate-500">Página:</span> <strong>{currentPage} de {totalPages}</strong>
            </div>
        </div>

        {/* Main Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('cliente')}>
                    Nome do Cliente <SortIcon column="cliente" />
                </th>
                <th className="px-4 py-3 text-left font-bold text-slate-600">
                    Contato
                </th>
                {selectedVendedor === 'Todos' && (
                    <th className="px-4 py-3 text-left font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('vendedor_responsavel')}>
                        Vendedor <SortIcon column="vendedor_responsavel" />
                    </th>
                )}
                <th className="px-4 py-3 text-right font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('total_gasto_acumulado')}>
                    Total Gasto <SortIcon column="total_gasto_acumulado" />
                </th>
                <th className="px-4 py-3 text-center font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('qtd_vendas')}>
                    Vendas <SortIcon column="qtd_vendas" />
                </th>
                <th className="px-4 py-3 text-center font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('qtd_produtos')}>
                    Peças <SortIcon column="qtd_produtos" />
                </th>
                <th className="px-4 py-3 text-center font-bold text-slate-600 cursor-pointer hover:bg-slate-100" onClick={() => handleSort('ultima_compra_data')}>
                    Última Compra <SortIcon column="ultima_compra_data" />
                </th>
                 <th className="px-4 py-3 text-left font-bold text-slate-600 w-1/4">
                    Últimas Preferências
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                 <tr><td colSpan={8} className="p-8 text-center text-slate-500">Carregando dados...</td></tr>
              ) : paginatedData.length === 0 ? (
                 <tr><td colSpan={8} className="p-8 text-center text-slate-500">Nenhum registro encontrado. Se houver erro de conexão, verifique o status na barra lateral.</td></tr>
              ) : (
                paginatedData.map((client, index) => {
                  // Logic for Group Header
                  const showGroupHeader = selectedVendedor === 'Todos' && (index === 0 || client.vendedor_responsavel !== paginatedData[index - 1].vendedor_responsavel);
                  
                  return (
                    <React.Fragment key={index}>
                        {showGroupHeader && (
                            <tr className="bg-indigo-50/50">
                                <td colSpan={8} className="px-4 py-2 font-bold text-indigo-900 text-xs uppercase tracking-wider border-y border-indigo-100">
                                    Carteira: {client.vendedor_responsavel || 'Sem Vendedor'}
                                </td>
                            </tr>
                        )}
                        <tr className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3">
                                <div className="font-bold text-slate-900">{client.cliente}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                {client.telefone || '-'}
                            </td>
                             {selectedVendedor === 'Todos' && (
                                <td className="px-4 py-3 text-slate-500">
                                    {client.vendedor_responsavel || '-'}
                                </td>
                            )}
                            <td className="px-4 py-3 text-right font-medium text-emerald-700">
                                {(client.total_gasto_acumulado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                                {client.qtd_vendas || 0}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-600">
                                {client.qtd_produtos || 0}
                            </td>
                             <td className="px-4 py-3 text-center text-slate-600 text-xs">
                                {client.ultima_compra_data ? new Date(client.ultima_compra_data).toLocaleDateString('pt-BR') : '-'}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500 italic">
                                {client.ultimas_preferencias || 'Sem dados recentes'}
                            </td>
                        </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6 border-t border-slate-100 pt-4">
             <div className="text-sm text-slate-500">
                 Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> até <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="font-medium">{filteredData.length}</span> resultados
             </div>
             <div className="flex items-center gap-2">
                 <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     <ChevronLeft size={16} />
                 </button>
                 {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pNum = i + 1;
                    if (currentPage > 3 && totalPages > 5) pNum = currentPage - 2 + i;
                    if (pNum > totalPages) return null;

                    return (
                        <button
                            key={pNum}
                            onClick={() => setCurrentPage(pNum)}
                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === pNum 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {pNum}
                        </button>
                    )
                 })}
                 <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                     <ChevronRight size={16} />
                 </button>
             </div>
        </div>

      </div>
    </div>
  );
};