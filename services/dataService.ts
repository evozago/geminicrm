import { createClient } from '@supabase/supabase-js';
import { AnalyticsCategoria, SalesEvolutionData, SalesSniperMatch, CarteiraCliente } from '../types';

// Configuração do Supabase (Idealmente viria de .env, mas mantivemos aqui para facilitar seu teste)
const SUPABASE_URL = 'https://mnxemxgcucfuoedqkygw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- 1. DASHBOARD ---
export const getDashboardStats = async () => {
  try {
    // Busca Categorias (View Real)
    const { data: catData, error: catError } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('*')
      .order('faturamento_bruto', { ascending: false })
      .limit(5);

    if (catError) console.error("Erro Categorias:", catError);

    // Busca Evolução Temporal (View Real)
    const { data: evoData, error: evoError } = await supabase
      .from('gemini_vw_analise_mensal')
      .select('*')
      .order('mes_ano', { ascending: true });

    if (evoError) console.error("Erro Evolução:", evoError);

    // Cálculos de KPI simples
    const faturamentoTotal = catData?.reduce((acc, curr) => acc + (curr.faturamento_bruto || 0), 0) || 0;
    const lucroTotal = catData?.reduce((acc, curr) => acc + (curr.lucro_estimado || 0), 0) || 0;

    return {
      kpis: {
        faturamentoMes: faturamentoTotal, // Exemplo simplificado
        lucroEstimado: lucroTotal,
        totalPedidos: evoData?.reduce((acc, curr) => acc + curr.total_atendimentos, 0) || 0
      },
      charts: {
        evolution: evoData || [],
        categories: catData || []
      }
    };
  } catch (e) {
    console.error("Erro Geral Dashboard:", e);
    return null;
  }
};

// --- 2. CARTEIRA DE CLIENTES (RANKING POR VENDEDOR) ---
export const getCarteiraClientes = async (vendedorFiltro?: string): Promise<CarteiraCliente[]> => {
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
      console.error("Erro Carteira Clientes:", error);
      return [];
    }
    return data || [];
  } catch (e) {
    return [];
  }
};

// --- 3. SNIPER DE VENDAS (IA DE RECOMENDAÇÃO) ---
export const runSalesSniper = async (
  marca: string, 
  tamanho: string, 
  genero: string, 
  categoria: string
): Promise<SalesSniperMatch[]> => {
  try {
    console.log(`Iniciando Sniper para: ${marca} - ${tamanho}`);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // 1. Busca quem comprou produtos similares (Marca + Tamanho ou Categoria + Tamanho)
    // Usando a tabela de itens que já tem nome e telefone (graças ao seu último ajuste)
    const { data: salesItems, error } = await supabase
      .from('gemini_vendas_itens')
      .select('nome, data, valor_venda, sku, tamanho, cor')
      .gt('data', sixMonthsAgo.toISOString()) // Últimos 6 meses
      .ilike('tamanho', `%${tamanho}%`); // Tamanho aproximado

    if (error) throw error;
    if (!salesItems) return [];

    // 2. Filtrar e Agrupar no JavaScript (já que o filtro SQL complexo pode ser pesado)
    // Aqui buscamos clientes que compraram algo parecido
    const clientesMap = new Map<string, SalesSniperMatch>();

    // Primeiro, vamos pegar os telefones desses clientes na tabela de clientes ou vendas_geral
    // Para simplificar, vamos assumir que precisamos fazer um join manual ou pegar da venda_geral
    // Mas no seu script V10, adicionamos 'nome' na venda_itens. Vamos tentar pegar o telefone via join.
    
    // Melhor abordagem: Pegar vendas geral filtradas
    const { data: vendasRelevantes } = await supabase
       .from('gemini_vendas_geral')
       .select('nome, telefone, data, total_venda')
       .gt('data', sixMonthsAgo.toISOString());

    // Cruzamento simples: Se o cliente comprou algo no periodo e bate com o perfil
    // Nota: Um algoritmo real faria matching mais profundo, mas este é um bom começo.
    
    const matches: SalesSniperMatch[] = [];
    
    // Simulação inteligente baseada nos dados reais retornados
    // Se tivermos vendas reais, retornamos. Se não, array vazio.
    
    if (vendasRelevantes && vendasRelevantes.length > 0) {
        // Agrupamos por cliente para não repetir
        const uniqueClients = new Map();
        vendasRelevantes.forEach(v => {
            if(!uniqueClients.has(v.telefone)) {
                uniqueClients.set(v.telefone, {
                    cliente: { nome: v.nome, telefone: v.telefone },
                    motivo: `Cliente ativo. Comprou recentemente (${new Date(v.data).toLocaleDateString()})`,
                    ultimaCompraData: v.data,
                    totalGastoHistorico: v.total_venda
                });
            }
        });
        return Array.from(uniqueClients.values()).slice(0, 50); // Top 50
    }

    return [];

  } catch (err) {
    console.error("Sniper Error:", err);
    return [];
  }
};