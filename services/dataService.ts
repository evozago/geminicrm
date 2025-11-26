import { supabase } from "@/integrations/supabase/client";
import { AnalyticsCategoria, SalesEvolutionData, SalesSniperMatch, CarteiraCliente, InventoryAnalytics } from '../types';

// --- 1. DASHBOARD ---
export const getDashboardStats = async () => {
  console.log("🔄 Carregando Dashboard...");
  try {
    const { data: catData, error: catError } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('*')
      .order('faturamento_bruto', { ascending: false })
      .limit(5);

    if (catError) console.error("Erro Categorias:", catError);

    const { data: evoData, error: evoError } = await supabase
      .from('gemini_vw_analise_mensal')
      .select('*')
      .order('mes_ano', { ascending: true });

    if (evoError) console.error("Erro Evolução:", evoError);

    const faturamentoTotal = catData?.reduce((acc, curr) => acc + (curr.faturamento_bruto || 0), 0) || 0;
    const lucroTotal = catData?.reduce((acc, curr) => acc + (curr.lucro_estimado || 0), 0) || 0;
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
    console.error("Erro Dashboard:", e);
    return null;
  }
};

// --- 2. CARTEIRA DE CLIENTES ---
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
    if (error) { console.error("Erro Carteira:", error); return []; }
    return data || [];
  } catch (e) {
    console.error("Erro Carteira JS:", e);
    return [];
  }
};

// --- 3. SNIPER DE VENDAS ---
export const runSalesSniper = async (marca: string, tamanho: string, genero: string, categoria: string): Promise<SalesSniperMatch[]> => {
  console.log(`🎯 Sniper: ${marca} | ${genero} | ${tamanho}`);
  try {
    const searchWindow = new Date();
    searchWindow.setMonth(searchWindow.getMonth() - 12);
    
    let queryProdutos = supabase.from('gemini_produtos').select('sku').ilike('marca', `%${marca}%`); 
    if (genero && genero !== 'Unissex') queryProdutos = queryProdutos.ilike('genero', `%${genero}%`);

    const { data: produtosAlvo, error: erroProd } = await queryProdutos;
    if (erroProd || !produtosAlvo || produtosAlvo.length === 0) return [];

    const skusPermitidos = produtosAlvo.map(p => p.sku);

    const { data: itensVendidos, error: erroItens } = await supabase
      .from('gemini_vendas_itens')
      .select('movimentacao, tamanho, data, sku')
      .gt('data', searchWindow.toISOString())
      .in('sku', skusPermitidos)
      .ilike('tamanho', `${tamanho}`);

    if (erroItens) throw erroItens;
    if (!itensVendidos || itensVendidos.length === 0) return [];

    const idsMovimentacao = itensVendidos.map(i => i.movimentacao);
    const { data: vendasGerais } = await supabase
      .from('gemini_vendas_geral')
      .select('movimentacao, nome, telefone, total_venda, data')
      .in('movimentacao', idsMovimentacao);

    const resultadoMap = new Map<string, SalesSniperMatch>();
    vendasGerais?.forEach(venda => {
      if (!venda.telefone || venda.telefone.length < 8 || (venda.total_venda || 0) < 0) return;
      if (!resultadoMap.has(venda.telefone)) {
        resultadoMap.set(venda.telefone, {
          cliente: { nome: venda.nome || "Cliente", telefone: venda.telefone },
          motivo: `Comprou ${marca} (${genero}) Tam ${tamanho}`,
          ultimaCompraData: venda.data,
          totalGastoHistorico: venda.total_venda
        });
      } else {
          const existing = resultadoMap.get(venda.telefone)!;
          if (new Date(venda.data) > new Date(existing.ultimaCompraData)) existing.ultimaCompraData = venda.data;
      }
    });

    return Array.from(resultadoMap.values()).sort((a, b) => new Date(b.ultimaCompraData).getTime() - new Date(a.ultimaCompraData).getTime());
  } catch (err) {
    console.error("Erro Sniper:", err);
    return [];
  }
};

// --- 4. ANÁLISE DE ESTOQUE E GIRO (NOVO) ---
export const getInventoryAnalytics = async (): Promise<InventoryAnalytics[]> => {
  try {
    const { data, error } = await supabase
      .from('gemini_vw_analise_giro')
      .select('*')
      .order('vendas_valor_90d', { ascending: false });

    if (error) {
      console.error("Erro Analytics Estoque:", error);
      return [];
    }

    // LÓGICA DE INTELIGÊNCIA COMERCIAL
    return (data || []).map((item: any) => {
      const estoque = item.qtd_estoque_atual || 0;
      const vendas90d = item.vendas_qtd_90d || 0;
      
      // Cálculo de Cobertura: Quantos dias o estoque dura nesse ritmo?
      // Média diária = Vendas 90 dias / 90
      const vendasPorDia = vendas90d / 90;
      
      // Se não vende nada, cobertura é "infinita" (999 dias)
      const diasDeCobertura = vendasPorDia > 0 ? Math.round(estoque / vendasPorDia) : 999;

      let sugestao: 'COMPRAR' | 'LIQUIDAR' | 'MANTER' = 'MANTER';

      // REGRAS DO ALGORITMO:
      if (estoque > 20 && diasDeCobertura > 120) {
        // Ex: Tenho 50 peças e vou levar 4 meses pra vender -> LIQUIDAR
        sugestao = 'LIQUIDAR';
      } else if (estoque < 10 && diasDeCobertura < 30) {
        // Ex: Tenho 5 peças e acaba em 20 dias -> COMPRAR
        sugestao = 'COMPRAR';
      }

      return {
        ...item,
        sugestao,
        cobertura_dias: diasDeCobertura
      };
    });

  } catch (e) {
    console.error("Erro Analytics:", e);
    return [];
  }
};
