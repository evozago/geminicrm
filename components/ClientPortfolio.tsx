import React, { useState, useEffect } from 'react';
import { Users, AlertTriangle, Calendar, ShoppingBag, DollarSign } from 'lucide-react';
import { getCarteiraClientes } from '../services/dataService';
import { CarteiraCliente } from '../types';

export const ClientPortfolio: React.FC = () => {
  const [clientes, setClientes] = useState<CarteiraCliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendedorSelecionado, setVendedorSelecionado] = useState('Todos');
  const [listaVendedores, setListaVendedores] = useState<string[]>(['Todos']);

  useEffect(() => {
    carregarDados();
  }, [vendedorSelecionado]);

  const carregarDados = async () => {
    setLoading(true);
    const data = await getCarteiraClientes(vendedorSelecionado);
    setClientes(data);
    
    // Extrair lista única de vendedores para o filtro
    if (vendedorSelecionado === 'Todos' && data.length > 0) {
      const vendedores = Array.from(new Set(data.map(c => c.vendedor_responsavel).filter(Boolean)));
      setListaVendedores(['Todos', ...vendedores]);
    }
    setLoading(false);
  };

  const getWhatsAppLink = (tel: string, nome: string) => {
    if (!tel) return '#';
    const clean = tel.replace(/\D/g, '');
    return `https://wa.me/${clean}?text=Olá ${nome}, vi que faz um tempo que não nos falamos!`;
  };

  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Users className="text-blue-600" /> Carteira de Clientes
          </h2>
          <p className="text-slate-500">Ranking e acompanhamento por vendedor</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border shadow-sm">
          <span className="text-sm font-bold text-slate-600 px-2">VENDEDOR:</span>
          <select 
            className="bg-slate-100 border-none rounded-md px-4 py-2 font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
            value={vendedorSelecionado}
            onChange={(e) => setVendedorSelecionado(e.target.value)}
          >
            {listaVendedores.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Carregando carteira...</div>
      ) : clientes.length === 0 ? (
        <div className="bg-white rounded-xl border border-amber-200 text-amber-700 p-10 text-center font-medium">
          Não foi possível carregar a carteira agora. Verifique a conexão com o Supabase e tente novamente.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-bold tracking-wider">
                <th className="p-4">Ranking / Cliente</th>
                <th className="p-4">Performance</th>
                <th className="p-4">Últimas Compras (Perfil)</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {clientes.map((cli, index) => {
                const isVendedorDiferente = cli.ultimo_vendedor && cli.ultimo_vendedor !== cli.vendedor_responsavel;
                
                return (
                  <tr key={index} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
                          #{index + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-base">{cli.cliente}</div>
                          <div className="text-xs text-slate-500">Resp: {cli.vendedor_responsavel}</div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="p-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-emerald-600 font-bold">
                          <DollarSign size={14} /> 
                          {cli.total_gasto_acumulado?.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <ShoppingBag size={12} /> {cli.qtd_vendas} compras
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          {cli.qtd_produtos_total} peças
                        </div>
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="text-xs text-slate-700 bg-slate-50 p-2 rounded border border-slate-100">
                        {cli.ultimas_preferencias || "Sem dados recentes"}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Calendar size={10} /> Última: {cli.data_ultima_compra ? new Date(cli.data_ultima_compra).toLocaleDateString() : '-'}
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {isVendedorDiferente && (
                        <div className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold mb-1" title={`Último atendimento foi com ${cli.ultimo_vendedor}`}>
                          <AlertTriangle size={12} /> Atendido por outro
                        </div>
                      )}
                      <a 
                        href={getWhatsAppLink(cli.telefone || '', cli.cliente)}
                        target="_blank" 
                        rel="noreferrer"
                        className="block mt-1 text-xs font-bold text-blue-600 hover:underline"
                      >
                        Chamar no Whats
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};