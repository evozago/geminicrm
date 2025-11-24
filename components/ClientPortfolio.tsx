import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, ShoppingBag, DollarSign, Trophy, ArrowUp, ArrowDown, Tag, ChevronLeft, ChevronRight } from 'lucide-react';
import { getCarteiraClientes } from '../services/dataService';
import { CarteiraCliente } from '../types';

export const ClientPortfolio: React.FC = () => {
  const [rawData, setRawData] = useState<CarteiraCliente[]>([]);
  const [displayData, setDisplayData] = useState<CarteiraCliente[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters & Pagination
  const [vendedorSelecionado, setVendedorSelecionado] = useState('Todos');
  const [listaVendedores, setListaVendedores] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;

  // Sorting
  const [sortConfig, setSortConfig] = useState<{ key: keyof CarteiraCliente; direction: 'asc' | 'desc' }>({
    key: 'total_gasto_acumulado',
    direction: 'desc'
  });

  useEffect(() => {
    carregarDados();
  }, [vendedorSelecionado]);

  // Handle local sorting and pagination whenever data or page changes
  useEffect(() => {
    let processed = [...rawData];

    // 1. Sort
    processed.sort((a, b) => {
      // Primary Sort
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue === bValue) return 0;
      const comparison = aValue > bValue ? 1 : -1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    setDisplayData(processed);
  }, [rawData, sortConfig]);

  const carregarDados = async () => {
    setLoading(true);
    const data = await getCarteiraClientes(vendedorSelecionado);
    setRawData(data);
    
    if (vendedorSelecionado === 'Todos' && data.length > 0) {
      const vendedores = Array.from(new Set(data.map(c => c.vendedor_responsavel).filter(Boolean)));
      setListaVendedores(['Todos', ...vendedores]);
    }
    setLoading(false);
  };

  const handleSort = (key: keyof CarteiraCliente) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getWhatsAppLink = (tel: string, nome: string) => {
    if (!tel) return '#';
    const clean = tel.replace(/\D/g, '');
    return `https://wa.me/${clean}?text=Olá ${nome}, tudo bem? Estava analisando sua carteira aqui e...`;
  };

  // Pagination Logic
  const totalPages = Math.ceil(displayData.length / itemsPerPage);
  const paginatedData = displayData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Top 5 Calculation (Global, based on filtered list)
  const top5Clients = [...displayData]
    .sort((a, b) => b.total_gasto_acumulado - a.total_gasto_acumulado)
    .slice(0, 5);

  const SortIcon = ({ column }: { column: keyof CarteiraCliente }) => {
    if (sortConfig.key !== column) return <ArrowDown size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp size={12} className="text-blue-600" />
      : <ArrowDown size={12} className="text-blue-600" />;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Users className="text-primary" /> Carteira & Ranking
          </h2>
          <p className="text-slate-500 mt-2">
            Gestão completa da carteira de clientes, agrupada por vendedor e performance.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Filtrar Vendedor</span>
          <select 
            className="bg-slate-50 border-none rounded-lg px-4 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-primary outline-none min-w-[150px]"
            value={vendedorSelecionado}
            onChange={(e) => {
              setVendedorSelecionado(e.target.value);
              setCurrentPage(1);
            }}
          >
            {listaVendedores.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
          <p>Carregando inteligência de carteira...</p>
        </div>
      ) : (
        <>
          {/* TOP 5 CARDS */}
          {top5Clients.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {top5Clients.map((client, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:border-blue-300 transition-all">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Trophy size={48} className="text-yellow-500" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase">Top Cliente</span>
                  </div>
                  <h3 className="font-bold text-slate-800 truncate mb-1" title={client.cliente}>{client.cliente}</h3>
                  <p className="text-emerald-600 font-bold text-lg">R$ {client.total_gasto_acumulado?.toLocaleString('pt-BR', { notation: 'compact' })}</p>
                  <p className="text-[10px] text-slate-400 mt-2">Vendedor: {client.vendedor_responsavel}</p>
                </div>
              ))}
            </div>
          )}

          {/* MAIN TABLE */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                      onClick={() => handleSort('cliente')}
                    >
                      <div className="flex items-center gap-1">Cliente / Ranking <SortIcon column="cliente" /></div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                      onClick={() => handleSort('vendedor_responsavel')}
                    >
                      <div className="flex items-center gap-1">Vendedor <SortIcon column="vendedor_responsavel" /></div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                      onClick={() => handleSort('total_gasto_acumulado')}
                    >
                      <div className="flex items-center gap-1">Total Gasto <SortIcon column="total_gasto_acumulado" /></div>
                    </th>
                    <th 
                      className="p-4 cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                      onClick={() => handleSort('qtd_vendas')}
                    >
                       <div className="flex items-center gap-1">Freq. <SortIcon column="qtd_vendas" /></div>
                    </th>
                    <th className="p-4">Preferências Recentes</th>
                    <th className="p-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {paginatedData.map((cli, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    const isNewVendor = index === 0 || paginatedData[index - 1].vendedor_responsavel !== cli.vendedor_responsavel;
                    
                    // Logic for grouping headers if sorting by vendor or default
                    const showGroupHeader = isNewVendor && (sortConfig.key === 'vendedor_responsavel' || sortConfig.key === 'total_gasto_acumulado') && vendedorSelecionado === 'Todos';

                    return (
                      <React.Fragment key={index}>
                        {showGroupHeader && (
                          <tr className="bg-slate-100/50">
                            <td colSpan={6} className="px-4 py-2 font-bold text-slate-700 text-xs uppercase tracking-wider border-y border-slate-100">
                              Vendedor: {cli.vendedor_responsavel || 'Não atribuído'}
                            </td>
                          </tr>
                        )}
                        <tr className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-slate-400 w-6">#{globalIndex + 1}</span>
                              <div>
                                <div className="font-bold text-slate-800">{cli.cliente}</div>
                                <div className="text-xs text-slate-400">{cli.telefone || 'Sem telefone'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                              {cli.vendedor_responsavel}
                            </span>
                            {cli.ultimo_vendedor && cli.ultimo_vendedor !== cli.vendedor_responsavel && (
                              <div className="text-[10px] text-orange-500 mt-1 flex items-center gap-1">
                                <AlertTriangle size={10} /> Último: {cli.ultimo_vendedor}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-emerald-700 font-bold">
                              R$ {cli.total_gasto_acumulado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1 text-xs text-slate-500">
                              <span title="Quantidade de Vendas" className="flex items-center gap-1">
                                <ShoppingBag size={12} /> {cli.qtd_vendas} cps
                              </span>
                              <span title="Última Compra" className="flex items-center gap-1 text-slate-400">
                                <Calendar size={12} /> {cli.data_ultima_compra ? new Date(cli.data_ultima_compra).toLocaleDateString() : '-'}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                             {cli.ultimas_preferencias ? (
                               <div className="flex flex-wrap gap-1 max-w-xs">
                                 {cli.ultimas_preferencias.split(',').slice(0, 3).map((pref, i) => (
                                   <span key={i} className="px-2 py-0.5 rounded-full border border-slate-200 text-[10px] text-slate-600 flex items-center gap-1 bg-white">
                                     <Tag size={8} /> {pref.trim()}
                                   </span>
                                 ))}
                               </div>
                             ) : (
                               <span className="text-xs text-slate-300 italic">Sem preferências reg.</span>
                             )}
                          </td>
                          <td className="p-4 text-center">
                            <a 
                              href={getWhatsAppLink(cli.telefone || '', cli.cliente)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 hover:border-blue-600 px-3 py-1.5 rounded-lg transition-all"
                            >
                              WhatsApp
                            </a>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                  {displayData.length === 0 && (
                     <tr>
                       <td colSpan={6} className="p-12 text-center text-slate-400">Nenhum cliente encontrado.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Mostrando <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a <span className="font-bold">{Math.min(currentPage * itemsPerPage, displayData.length)}</span> de {displayData.length}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex items-center px-4 font-medium text-slate-700 bg-slate-50 rounded-lg border border-slate-100">
                    Página {currentPage} de {totalPages}
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};