import { createClient } from '@supabase/supabase-js';
import { Cliente, Produto, VendaGeral, VendaItem, AnalyticsCategoria, SalesEvolutionData, RankingCliente, SalesSniperMatch } from '../types';

// Supabase Configuration
const SUPABASE_URL = 'https://mnxemxgcucfuoedqkygw.supabase.co';
// Using the ANON public key as requested. The service_role secret should not be used in the client.
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- MOCK DATA FALLBACKS ---
const MOCK_SALES_EVOLUTION: SalesEvolutionData[] = [
  { mes: '2023-09', vendas: 12500, trocas: 1200 },
  { mes: '2023-10', vendas: 15000, trocas: 800 },
  { mes: '2023-11', vendas: 11000, trocas: 1500 },
  { mes: '2023-12', vendas: 28000, trocas: 3000 },
  { mes: '2024-01', vendas: 14500, trocas: 2100 },
  { mes: '2024-02', vendas: 16200, trocas: 1100 },
];

const MOCK_ANALYTICS_CATEGORIAS: AnalyticsCategoria[] = [
  { categoria: 'Vestido', faturamento_total: 45000, quantidade_vendas: 150, lucro_total: 22000 },
  { categoria: 'Conjunto', faturamento_total: 32000, quantidade_vendas: 110, lucro_total: 15000 },
  { categoria: 'Calça', faturamento_total: 18000, quantidade_vendas: 80, lucro_total: 9000 },
  { categoria: 'Blusa', faturamento_total: 12000, quantidade_vendas: 120, lucro_total: 6000 },
  { categoria: 'Acessórios', faturamento_total: 5000, quantidade_vendas: 200, lucro_total: 2500 },
];

const MOCK_RANKING_CLIENTES: RankingCliente[] = [
  { cliente_nome: 'Ana Silva', telefone: '11999999999', total_gasto: 4500, ultima_compra: '2023-12-15', dias_sem_comprar: 45 },
  { cliente_nome: 'Beatriz Costa', telefone: '11988888888', total_gasto: 3200, ultima_compra: '2023-10-10', dias_sem_comprar: 110 },
  { cliente_nome: 'Carla Souza', telefone: '11977777777', total_gasto: 2800, ultima_compra: '2023-09-05', dias_sem_comprar: 145 },
  { cliente_nome: 'Daniela Lima', telefone: '11966666666', total_gasto: 2100, ultima_compra: '2024-01-20', dias_sem_comprar: 10 },
  { cliente_nome: 'Fernanda Rocha', telefone: '11955555555', total_gasto: 5600, ultima_compra: '2023-08-01', dias_sem_comprar: 180 },
];

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

    if (salesError) console.error("Error fetching sales:", salesError);

    // Calculate KPIs
    let faturamentoMes = 0;
    let totalPedidos = 0;
    
    if (currentMonthSales) {
      faturamentoMes = currentMonthSales
        .filter(s => s.tipo_operacao === 'Venda simples' || s.tipo_operacao === 'Venda')
        .reduce((sum, item) => sum + (item.total_venda || 0), 0);
      
      totalPedidos = currentMonthSales.length;
    } else {
      // Fallback if DB empty/error
      faturamentoMes = 18500;
      totalPedidos = 142;
    }

    // 2. Charts: Sales vs Exchanges Evolution (Last 6 Months) - Manually Aggregating
    // We aggregate directly from 'gemini_vendas_geral' to ensure we capture "Trocas" vs "Vendas" accurately
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
      // Sort by month
      chartData.sort((a: any, b: any) => a.mes.localeCompare(b.mes));
    } else {
      chartData = MOCK_SALES_EVOLUTION;
    }

    // 3. Top Categories
    const { data: catData, error: catError } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('*')
      .order('faturamento_total', { ascending: false })
      .limit(5);

    const categories = (catError || !catData) ? MOCK_ANALYTICS_CATEGORIAS : catData;

    return {
      kpis: {
        faturamentoMes,
        lucroEstimado: faturamentoMes * 0.45, // Estimating 45% margin
        totalPedidos
      },
      charts: {
        evolution: chartData,
        categories: categories
      }
    };

  } catch (e) {
    console.error("Dashboard Stats Error:", e);
    return {
      kpis: { faturamentoMes: 18500, lucroEstimado: 8325, totalPedidos: 142 },
      charts: { evolution: MOCK_SALES_EVOLUTION, categories: MOCK_ANALYTICS_CATEGORIAS }
    };
  }
};

export const getRankingClientes = async (): Promise<RankingCliente[]> => {
  try {
    const { data, error } = await supabase
      .from('gemini_vw_ranking_clientes')
      .select('*')
      .order('total_gasto', { ascending: false })
      .limit(50); // Limit to top 50 for performance

    if (error) {
      console.error("Error fetching ranking:", error);
      return MOCK_RANKING_CLIENTES;
    }
    return data && data.length > 0 ? data : MOCK_RANKING_CLIENTES;
  } catch (e) {
    return MOCK_RANKING_CLIENTES;
  }
};

/**
 * THE SALES SNIPER ALGORITHM
 * Criteria: Bought similar items in last 6 months.
 */
export const runSalesSniper = async (
  marca: string, 
  tamanho: string, 
  genero: string, 
  categoria: string
): Promise<SalesSniperMatch[]> => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    console.log(`Running Sniper: ${marca}, ${tamanho}, ${genero}, ${categoria}`);

    // 1. Find Historical SKUs matching criteria (Similar products)
    const { data: similarProducts, error: prodError } = await supabase
      .from('gemini_produtos')
      .select('sku')
      .eq('marca', marca)
      .eq('genero', genero)
      .or(`tamanho.eq.${tamanho},categoria_produto.eq.${categoria}`);

    if (prodError) throw prodError;
    
    // Fallback Mock if no matching products in DB (for demo purposes if DB is empty)
    if (!similarProducts || similarProducts.length === 0) {
       console.warn("No products found for criteria, using mock.");
       return getMockSniperResult(marca, tamanho);
    }

    const targetSkus = similarProducts.map(p => p.sku);

    // 2. Find Sales Items with these SKUs in last 6 months
    const { data: salesItems, error: itemError } = await supabase
      .from('gemini_vendas_itens')
      .select('movimentacao, sku, valor_venda, data')
      .in('sku', targetSkus)
      .gt('data', sixMonthsAgo.toISOString());

    if (itemError) throw itemError;
    if (!salesItems || salesItems.length === 0) return getMockSniperResult(marca, tamanho);

    const movIds = salesItems.map(i => i.movimentacao);

    // 3. Get Client Info for these sales
    const { data: sales, error: salesError } = await supabase
      .from('gemini_vendas_geral')
      .select('movimentacao, nome, telefone, data')
      .in('movimentacao', movIds);

    if (salesError) throw salesError;

    // 4. Aggregate by Client
    const clientMap = new Map<string, SalesSniperMatch>();

    sales?.forEach(sale => {
      // Find items in this specific sale
      const itemsInSale = salesItems.filter(i => i.movimentacao === sale.movimentacao);
      const totalInSale = itemsInSale.reduce((acc, curr) => acc + curr.valor_venda, 0);
      
      // Use phone as unique key
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

    const results = Array.from(clientMap.values())
      .sort((a, b) => new Date(b.ultimaCompraData).getTime() - new Date(a.ultimaCompraData).getTime());
      
    return results.length > 0 ? results : getMockSniperResult(marca, tamanho);

  } catch (err) {
    console.error("Sniper Error:", err);
    return getMockSniperResult(marca, tamanho);
  }
};

function getMockSniperResult(marca: string, tamanho: string): SalesSniperMatch[] {
  return [
    {
      cliente: {
        id: 1,
        nome: "Mariana Silva (Exemplo)",
        telefone: "11999990000",
        cpf: "123",
        cidade: "São Paulo",
        uf: "SP"
      },
      motivo: `Comprou ${marca} Tam ${tamanho} em Dezembro`,
      ultimaCompraData: new Date().toISOString(),
      totalGastoHistorico: 450.00,
      produtosComprados: ["Vestido Floral"]
    },
    {
      cliente: {
        id: 2,
        nome: "Fernanda Lima (Exemplo)",
        telefone: "11988887777",
        cpf: "456",
        cidade: "Rio de Janeiro",
        uf: "RJ"
      },
      motivo: "Cliente fiel da marca",
      ultimaCompraData: "2024-01-15T10:00:00Z",
      totalGastoHistorico: 890.00,
      produtosComprados: ["Conjunto Verão"]
    }
  ];
}
