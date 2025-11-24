import { createClient } from '@supabase/supabase-js';
import { Cliente, Produto, VendaGeral, VendaItem, AnalyticsCategoria, SalesEvolutionData, RankingCliente, SalesSniperMatch, CarteiraCliente } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://mnxemxgcucfuoedqkygw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- HELPER FOR CONNECTION STATUS ---
export const checkSupabaseConnection = async (): Promise<{ success: boolean; message?: string }> => {
  try {
    // Try to fetch a single row from a table known to exist, or just check health
    // We try gemini_clientes as it's a base table.
    const { data, error } = await supabase.from('gemini_clientes').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error("Supabase Connection Check Failed:", error);
      return { success: false, message: error.message };
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, message: e.message || "Unknown connection error" };
  }
};

// --- MOCK DATA CONSTANTS (REMOVED FROM ACTIVE USE TO FORCE REAL DATA) ---
const MOCK_SALES_EVOLUTION: SalesEvolutionData[] = [
  { mes: '2023-09', vendas: 0, trocas: 0 },
];
const MOCK_ANALYTICS_CATEGORIAS: AnalyticsCategoria[] = [];

// --- DASHBOARD SERVICES ---

export const getDashboardStats = async () => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    sixMonthsAgo.setDate(1);

    // Fetch sales for KPI (Current Month)
    const { data: currentMonthSales, error: salesError } = await supabase
      .from('gemini_vendas_geral')
      .select('total_venda, tipo_operacao, data')
      .gte('data', startOfMonth.toISOString());

    if (salesError) {
       console.error("Error fetching sales:", salesError);
       throw salesError;
    }

    // Calculate KPIs
    let faturamentoMes = 0;
    let totalPedidos = 0;
    
    if (currentMonthSales) {
      faturamentoMes = currentMonthSales
        .filter(s => s.tipo_operacao === 'Venda simples' || s.tipo_operacao === 'Venda')
        .reduce((sum, item) => sum + (item.total_venda || 0), 0);
      
      totalPedidos = currentMonthSales.length;
    }

    // 2. Charts: Sales vs Exchanges Evolution
    const { data: rawEvolutionData, error: evError } = await supabase
      .from('gemini_vendas_geral')
      .select('data, total_venda, tipo_operacao')
      .gte('data', sixMonthsAgo.toISOString())
      .order('data', { ascending: true });

    let chartData: SalesEvolutionData[] = [];

    if (!evError && rawEvolutionData && rawEvolutionData.length > 0) {
      const grouped = rawEvolutionData.reduce((acc: any, curr) => {
        const month = curr.data.substring(0, 7); // YYYY-MM
        if (!acc[month]) acc[month] = { mes: month, vendas: 0, trocas: 0 };
        
        const isTroca = curr.tipo_operacao?.toLowerCase().includes('troca');
        if (isTroca) {
          acc[month].trocas += (curr.total_venda || 0);
        } else {
          acc[month].vendas += (curr.total_venda || 0);
        }
        return acc;
      }, {});
      
      chartData = Object.values(grouped);
      chartData.sort((a: any, b: any) => a.mes.localeCompare(b.mes));
    } 

    // 3. Top Categories
    const { data: catData, error: catError } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('*')
      .order('faturamento_total', { ascending: false })
      .limit(5);

    const categories = (catError || !catData) ? [] : catData;

    return {
      kpis: {
        faturamentoMes,
        lucroEstimado: faturamentoMes * 0.45,
        totalPedidos
      },
      charts: {
        evolution: chartData,
        categories: categories
      }
    };

  } catch (e) {
    console.error("Dashboard Stats Error:", e);
    // Return empty/zero stats to indicate error rather than fake data
    return {
      kpis: { faturamentoMes: 0, lucroEstimado: 0, totalPedidos: 0 },
      charts: { evolution: [], categories: [] }
    };
  }
};

export const getRankingClientes = async (): Promise<RankingCliente[]> => {
  try {
    const { data, error } = await supabase
      .from('gemini_vw_ranking_clientes')
      .select('*')
      .order('total_gasto', { ascending: false })
      .limit(50);

    if (error) {
      console.error("Error fetching ranking:", error);
      return []; // Return empty to show reality
    }
    return data || [];
  } catch (e) {
    return [];
  }
};

export const getCarteiraClientes = async (): Promise<CarteiraCliente[]> => {
  try {
    const { data, error } = await supabase
      .from('gemini_vw_relatorio_carteira_clientes')
      .select('*')
      .order('total_gasto_acumulado', { ascending: false });

    if (error) {
      console.error("Error fetching carteira:", error);
      return []; // Return empty to show reality
    }
    return data || []; 
  } catch (e) {
    console.error("Critical error carteira:", e);
    return []; // Return empty to show reality
  }
};

export const runSalesSniper = async (
  marca: string, 
  tamanho: string, 
  genero: string, 
  categoria: string
): Promise<SalesSniperMatch[]> => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: similarProducts, error: prodError } = await supabase
      .from('gemini_produtos')
      .select('sku')
      .eq('marca', marca)
      .eq('genero', genero)
      .or(`tamanho.eq.${tamanho},categoria_produto.eq.${categoria}`);

    if (prodError) throw prodError;
    
    if (!similarProducts || similarProducts.length === 0) {
       console.warn("No products found for criteria.");
       return []; 
    }

    const targetSkus = similarProducts.map(p => p.sku);

    const { data: salesItems, error: itemError } = await supabase
      .from('gemini_vendas_itens')
      .select('movimentacao, sku, valor_venda, data')
      .in('sku', targetSkus)
      .gt('data', sixMonthsAgo.toISOString());

    if (itemError) throw itemError;
    if (!salesItems || salesItems.length === 0) return [];

    const movIds = salesItems.map(i => i.movimentacao);

    const { data: sales, error: salesError } = await supabase
      .from('gemini_vendas_geral')
      .select('movimentacao, nome, telefone, data')
      .in('movimentacao', movIds);

    if (salesError) throw salesError;

    const clientMap = new Map<string, SalesSniperMatch>();

    sales?.forEach(sale => {
      const itemsInSale = salesItems.filter(i => i.movimentacao === sale.movimentacao);
      const totalInSale = itemsInSale.reduce((acc, curr) => acc + curr.valor_venda, 0);
      
      if (!clientMap.has(sale.telefone)) {
        clientMap.set(sale.telefone, {
          cliente: {
            id: 0, 
            nome: sale.nome,
            telefone: sale.telefone,
            cpf: '',
            cidade: '',
            uf: ''
          },
          motivo: `Comprou itens ${marca} recentemente`,
          ultimaCompraData: sale.data,
          totalGastoHistorico: 0,
          produtosComprados: []
        });
      }

      const entry = clientMap.get(sale.telefone)!;
      entry.totalGastoHistorico += totalInSale;
      
      if (new Date(sale.data) > new Date(entry.ultimaCompraData)) {
        entry.ultimaCompraData = sale.data;
      }
    });

    return Array.from(clientMap.values())
      .sort((a, b) => new Date(b.ultimaCompraData).getTime() - new Date(a.ultimaCompraData).getTime());

  } catch (err) {
    console.error("Sniper Error:", err);
    return []; 
  }
};