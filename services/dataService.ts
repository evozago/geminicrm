import { createClient } from '@supabase/supabase-js';
import { AnalyticsCategoria, SalesEvolutionData, SalesSniperMatch, CarteiraCliente } from '../types';

// CONFIGURAÇÃO SUPABASE
// NOTA: Em produção, use import.meta.env.VITE_SUPABASE_URL
const SUPABASE_URL = 'https://mnxemxgcucfuoedqkygw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. DASHBOARD ---
export const getDashboardStats = async () => {
  console.log("🔄 Buscando dados do Dashboard...");
  try {
    // Busca Categorias
    const { data: catData, error: catError } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('*')
      .order('faturamento_bruto', { ascending: false })
      .limit(5);

    if (catError) console.error("❌ Erro Categorias:", catError);

    // Busca Evolução
    const { data: evoData, error: evoError } = await supabase
      .from('gemini_vw_analise_mensal')
      .select('*')
      .order('mes_ano', { ascending: true });

    if (evoError) console.error("❌ Erro Evolução:", evoError);

    // Cálculos KPI
    const faturamentoTotal = catData?.reduce((acc, curr) => acc + (curr.faturamento_bruto || 0), 0) || 0;
    const lucroTotal = catData?.reduce((acc, curr) => acc + (curr.lucro_estimado || 0), 0) || 0;
    
    // Total de pedidos (soma de todos os meses da evolução)
    // Filtramos para não somar duplicado se tiver múltiplas linhas por mês
    const totalPedidos = evoData?.reduce((acc, curr) => acc + (curr.total_atendimentos || 0), 0) || 0;

    return {
      kpis: {
        faturamentoMes: faturamentoTotal, 
        lucroEstimado: lucroTotal,
        totalPedidos: totalPedidos
      },
      charts: {
        evolution: evoData || [],
        categories: catData || []
      }
    };
  } catch (e) {
    console.error("❌ Erro Crítico Dashboard:", e);
    return null;
  }
};

// --- 2. CARTEIRA DE CLIENTES ---
export const getCarteiraClientes = async (vendedorFiltro?: string): Promise<CarteiraCliente[]> => {
  console.log(`🔄 Buscando Carteira. Filtro: ${vendedorFiltro}`);
  try {
    let query = supabase
      .from('gemini_vw_relatorio_carteira_clientes')
      .select('*')
      .order('total_gasto_acumulado', { ascending: false });

    if (vendedorFiltro && vendedorFiltro !== 'Todos') {
      query = query.eq('vendedor_responsavel', vendedorFiltro);
    }

    const { data, error } = await query;

    if (error) {
      console.error("❌ Erro SQL Carteira:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("❌ Erro JS Carteira:", e);
    return [];
  }
};

// --- 3. SNIPER DE VENDAS ---
export const runSalesSniper = async (
  marca: string, 
  tamanho: string, 
  genero: string, 
  categoria: string
): Promise<SalesSniperMatch[]> => {
  console.log(`🎯 Iniciando Sniper: ${marca}, ${tamanho}, ${genero}`);
  
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // ESTRATÉGIA MAIS SIMPLES E EFICAZ:
    // 1. Buscar na tabela de ITENS quem comprou produtos parecidos nos últimos 6 meses.
    // Usamos .ilike para ser flexível (ex: buscar "6" encontra "6", "06", "Tam 6")
    
    const { data: itensEncontrados, error: erroItens } = await supabase
      .from('gemini_vendas_itens')
      .select('movimentacao, sku, tamanho, cor, nome, data')
      .gt('data', sixMonthsAgo.toISOString())
      .ilike('tamanho', `%${tamanho}%`) 
      // Se quiser filtrar por marca também, precisaríamos fazer um join, 
      // mas vamos focar no tamanho e nome do cliente que já temos na tabela itens
      .limit(200);

    if (erroItens) {
      console.error("❌ Erro Sniper Itens:", erroItens);
      throw erroItens;
    }

    if (!itensEncontrados || itensEncontrados.length === 0) {
      console.warn("⚠️ Sniper: Nenhum item encontrado com esses filtros.");
      return [];
    }

    // Coletar os IDs de movimentação para pegar o telefone na tabela GERAL
    const movimentacoesIds = itensEncontrados.map(i => i.movimentacao);

    // 2. Buscar Telefones na Vendas Geral
    const { data: vendasGerais, error: erroGeral } = await supabase
      .from('gemini_vendas_geral')
      .select('movimentacao, nome, telefone, total_venda')
      .in('movimentacao', movimentacoesIds);

    if (erroGeral) throw erroGeral;

    // 3. Cruzar dados e montar resultado
    const resultadoMap = new Map<string, SalesSniperMatch>();

    vendasGerais?.forEach(venda => {
      // Validar se tem telefone
      if (!venda.telefone || venda.telefone.length < 8) return;

      if (!resultadoMap.has(venda.telefone)) {
        resultadoMap.set(venda.telefone, {
          cliente: { nome: venda.nome || "Cliente", telefone: venda.telefone },
          motivo: `Comprou tamanho ${tamanho} recentemente`,
          ultimaCompraData: itensEncontrados.find(i => i.movimentacao === venda.movimentacao)?.data || new Date().toISOString(),
          totalGastoHistorico: venda.total_venda
        });
      }
    });

    console.log(`✅ Sniper encontrou ${resultadoMap.size} clientes.`);
    return Array.from(resultadoMap.values());

  } catch (err) {
    console.error("❌ Erro Crítico Sniper:", err);
    return [];
  }
};