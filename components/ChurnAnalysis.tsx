import React, { useEffect, useState } from 'react';
import { getRankingClientes } from '../services/dataService';
import { generateRecoveryMessage } from '../services/geminiService';
import { RankingCliente } from '../types';
import { AlertCircle, Clock, Send, MessageSquare } from 'lucide-react';

export const ChurnAnalysis: React.FC = () => {
  const [clients, setClients] = useState<RankingCliente[]>([]);
  const [messages, setMessages] = useState<{[key: string]: string}>({});
  const [loadingMsg, setLoadingMsg] = useState<string | null>(null);

  useEffect(() => {
    // Filter for clients inactive > 90 days
    getRankingClientes().then(data => {
      const churned = data.filter(c => c.dias_sem_comprar > 90);
      setClients(churned);
    });
  }, []);

  const handleGenerateMessage = async (client: RankingCliente) => {
    setLoadingMsg(client.cliente_nome);
    const msg = await generateRecoveryMessage(client);
    setMessages(prev => ({ ...prev, [client.cliente_nome]: msg }));
    setLoadingMsg(null);
  };

  const handleSend = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Clock className="text-orange-500" /> Análise de Recorrência
          </h1>
          <p className="text-slate-500 mt-2">
            Identificamos <strong className="text-orange-600">{clients.length} clientes</strong> que não compram há mais de 90 dias.
            Use a IA para reconquistá-los.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div key={client.cliente_nome} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:border-orange-200 transition-all">
            <div className="p-6 border-b border-slate-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{client.cliente_nome}</h3>
                  <p className="text-xs text-slate-400 font-mono">{client.telefone}</p>
                </div>
                <div className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
                  <AlertCircle size={12} /> {client.dias_sem_comprar} dias
                </div>
              </div>
              
              <div className="flex justify-between text-sm text-slate-600 mb-4">
                <span>Total Gasto:</span>
                <span className="font-semibold">R$ {client.total_gasto.toLocaleString('pt-BR')}</span>
              </div>
              
              <div className="text-xs text-slate-400">
                Última compra: {new Date(client.ultima_compra).toLocaleDateString('pt-BR')}
              </div>
            </div>

            <div className="p-4 bg-slate-50">
              {!messages[client.cliente_nome] ? (
                <button
                  onClick={() => handleGenerateMessage(client)}
                  disabled={loadingMsg === client.cliente_nome}
                  className="w-full bg-white border border-slate-200 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-white hover:border-primary hover:text-primary transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {loadingMsg === client.cliente_nome ? (
                    'Gerando...'
                  ) : (
                    <>
                      <MessageSquare size={16} /> Gerar msg "Saudades"
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3 animate-fade-in">
                  <textarea 
                    className="w-full text-sm p-2 rounded border border-orange-200 bg-orange-50 text-slate-700 focus:outline-none resize-none"
                    rows={4}
                    defaultValue={messages[client.cliente_nome]}
                  />
                  <button 
                    onClick={() => handleSend(client.telefone, messages[client.cliente_nome])}
                    className="w-full bg-green-500 text-white py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Send size={16} /> Enviar WhatsApp
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
