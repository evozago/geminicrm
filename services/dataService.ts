import { createClient } from '@supabase/supabase-js';
import {
  AnalyticsCategoria,
  AnalyticsFiltro,
  SalesEvolutionData,
  SalesSniperMatch,
  CarteiraCliente,
  CarteiraFiltro,
  RankingCliente,
  AnaliseMensalFiltro,
  Cliente,
  ClienteFiltro,
  Produto,
  ProdutoFiltro,
  VendaGeral,
  VendaGeralFiltro,
  VendaItem,
  VendaItemFiltro,
} from '../types';

// --- Dados de fallback para modo demo/offline ---
const DEMO_CATEGORIES: AnalyticsCategoria[] = [
  {
    categoria_produto: 'Vestidos',
    faturamento_bruto: 185000,
    lucro_estimado: 74000,
    pecas_vendidas: 420,
    preco_medio_peca: 440,
    qtd_pedidos: 260,
  },
  {
    categoria_produto: 'Acessórios',
    faturamento_bruto: 42000,
    lucro_estimado: 21000,
    pecas_vendidas: 310,
    preco_medio_peca: 135,
    qtd_pedidos: 180,
  },
  {
    categoria_produto: 'Conjuntos',
    faturamento_bruto: 78000,
    lucro_estimado: 31000,
    pecas_vendidas: 190,
    preco_medio_peca: 410,
    qtd_pedidos: 120,
  },
];

const DEMO_EVOLUTION: SalesEvolutionData[] = [
  { mes_ano: '2024-02', faturamento_liquido_real: 186000, total_atendimentos: 410, tipo_operacao: 'venda' },
  { mes_ano: '2024-03', faturamento_liquido_real: 192500, total_atendimentos: 430, tipo_operacao: 'venda' },
  { mes_ano: '2024-04', faturamento_liquido_real: 201300, total_atendimentos: 455, tipo_operacao: 'venda' },
  { mes_ano: '2024-05', faturamento_liquido_real: 189200, total_atendimentos: 420, tipo_operacao: 'venda' },
  { mes_ano: '2024-06', faturamento_liquido_real: 214800, total_atendimentos: 470, tipo_operacao: 'venda' },
  { mes_ano: '2024-07', faturamento_liquido_real: 225600, total_atendimentos: 488, tipo_operacao: 'venda' },
];

const DEMO_CARTEIRA: CarteiraCliente[] = [
  {
    cliente: 'Laura Costa',
    vendedor_responsavel: 'Ana',
    ultimo_vendedor: 'Ana',
    total_gasto_acumulado: 18230,
    qtd_produtos_total: 38,
    qtd_vendas: 16,
    data_ultima_compra: new Date().toISOString(),
    ultimas_preferencias: 'Prefere vestidos Momi tam 6; cores vivas',
  },
  {
    cliente: 'Marina Ramos',
    vendedor_responsavel: 'João',
    ultimo_vendedor: 'Beatriz',
    total_gasto_acumulado: 14210,
    qtd_produtos_total: 25,
    qtd_vendas: 11,
    data_ultima_compra: new Date().toISOString(),
    ultimas_preferencias: 'Conjuntos Lui Bambini tam 4; cores neutras',
  },
  {
    cliente: 'Fernanda Alves',
    vendedor_responsavel: 'Beatriz',
    ultimo_vendedor: 'Beatriz',
    total_gasto_acumulado: 9850,
    qtd_produtos_total: 19,
    qtd_vendas: 8,
    data_ultima_compra: new Date().toISOString(),
    ultimas_preferencias: 'Calças skinny; marca Denim Kids; tam 8',
  },
];

const DEMO_RANKING: RankingCliente[] = [
  { cliente_nome: 'Juliana Mello', telefone: '(11) 99999-0000', dias_sem_comprar: 130, total_gasto: 6200, ultima_compra: '2024-03-15' },
  { cliente_nome: 'Patrícia Souza', telefone: '(11) 98888-1212', dias_sem_comprar: 110, total_gasto: 4800, ultima_compra: '2024-04-02' },
  { cliente_nome: 'Luciana Prado', telefone: '(11) 97777-4545', dias_sem_comprar: 102, total_gasto: 5200, ultima_compra: '2024-04-10' },
];

const DEMO_SNIPER: SalesSniperMatch[] = [
  {
    cliente: { nome: 'Camila Dias', telefone: '(11) 91234-5678' },
    motivo: 'Comprou vestido tamanho 6 há 45 dias',
    ultimaCompraData: '2024-06-15',
    totalGastoHistorico: 820,
  },
  {
    cliente: { nome: 'Bianca Torres', telefone: '(11) 93456-7890' },
    motivo: 'Leva sempre marca Lui Bambini tamanho 6',
    ultimaCompraData: '2024-05-22',
    totalGastoHistorico: 1120,
  },
];

// CONFIGURAÇÃO SUPABASE
// NOTA: Em produção, use import.meta.env.VITE_SUPABASE_URL
const SUPABASE_URL = 'https://mnxemxgcucfuoedqkygw.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Healthcheck simples usado pelo App para exibir status de conexão
export const checkSupabaseConnection = async () => {
  try {
    const { error } = await supabase
      .from('gemini_vw_analytics_categorias')
      .select('categoria_produto', { head: true })
      .limit(1);

    if (error) {
      if (error.message?.toLowerCase().includes('fetch failed')) {
        return {
          success: false,
          message:
            'Não foi possível alcançar o Supabase a partir do ambiente atual (rede bloqueada ou offline). Tente novamente em outra rede ou configure as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_KEY.',
        };
      }
      return { success: false, message: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Falha ao conectar ao Supabase' };
  }
};

const applyDateRange = (
  query: ReturnType<typeof supabase.from<any>>,
  startDate?: string,
  endDate?: string,
) => {
  if (startDate) query = query.gte('data', startDate);
  if (endDate) query = query.lte('data', endDate);
  return query;
};

const isNetworkError = (error?: { message?: string }) =>
  Boolean(error?.message?.toLowerCase().includes('fetch failed') || error?.message?.includes('ENET'));

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

    if (catError || evoError) {
      console.warn('⚠️ Entrando em modo demo para Dashboard (Supabase indisponível).');
      return {
        kpis: {
          faturamentoMes: DEMO_CATEGORIES.reduce((acc, c) => acc + c.faturamento_bruto, 0),
          lucroEstimado: DEMO_CATEGORIES.reduce((acc, c) => acc + c.lucro_estimado, 0),
          totalPedidos: DEMO_EVOLUTION.reduce((acc, c) => acc + c.total_atendimentos, 0),
        },
        charts: {
          evolution: DEMO_EVOLUTION,
          categories: DEMO_CATEGORIES,
        },
        offline: true,
      };
    }

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
    return {
      kpis: {
        faturamentoMes: DEMO_CATEGORIES.reduce((acc, c) => acc + c.faturamento_bruto, 0),
        lucroEstimado: DEMO_CATEGORIES.reduce((acc, c) => acc + c.lucro_estimado, 0),
        totalPedidos: DEMO_EVOLUTION.reduce((acc, c) => acc + c.total_atendimentos, 0),
      },
      charts: {
        evolution: DEMO_EVOLUTION,
        categories: DEMO_CATEGORIES,
      },
      offline: true,
    };
  }
};

export const getAnalyticsCategorias = async (
  filtros: AnalyticsFiltro = {},
): Promise<AnalyticsCategoria[]> => {
  let query = supabase
    .from('gemini_vw_analytics_categorias')
    .select('*')
    .order('faturamento_bruto', { ascending: false });

  if (filtros.categoria) {
    query = query.ilike('categoria_produto', `%${filtros.categoria}%`);
  }
  if (typeof filtros.minFaturamento === 'number') {
    query = query.gte('faturamento_bruto', filtros.minFaturamento);
  }
  if (typeof filtros.minLucro === 'number') {
    query = query.gte('lucro_estimado', filtros.minLucro);
  }
  if (typeof filtros.limit === 'number') {
    query = query.limit(filtros.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_vw_analytics_categorias:', error);
    return [];
  }

  return data || [];
};

export const getAnaliseMensal = async (
  filtros: AnaliseMensalFiltro = {},
): Promise<SalesEvolutionData[]> => {
  let query = supabase
    .from('gemini_vw_analise_mensal')
    .select('*')
    .order('mes_ano', { ascending: true });

  if (filtros.inicio) {
    query = query.gte('mes_ano', filtros.inicio);
  }
  if (filtros.fim) {
    query = query.lte('mes_ano', filtros.fim);
  }
  if (filtros.tipo_operacao) {
    query = query.eq('tipo_operacao', filtros.tipo_operacao);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_vw_analise_mensal:', error);
    return [];
  }
  return data || [];
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
      if (isNetworkError(error)) {
        console.warn('⚠️ Retornando dados demo de carteira (Supabase indisponível).');
        return DEMO_CARTEIRA;
      }
      return [];
    }
    return data || [];
  } catch (e) {
    console.error("❌ Erro JS Carteira:", e);
    return DEMO_CARTEIRA;
  }
};

export const getCarteiraClientesAnalitica = async (
  filtros: CarteiraFiltro = {},
): Promise<CarteiraCliente[]> => {
  let query = supabase
    .from('gemini_vw_relatorio_carteira_clientes')
    .select('*')
    .order('total_gasto_acumulado', { ascending: false });

  if (filtros.vendedor) query = query.eq('vendedor_responsavel', filtros.vendedor);
  if (filtros.cliente) query = query.ilike('cliente', `%${filtros.cliente}%`);
  if (filtros.cidade) query = query.ilike('cidade', `%${filtros.cidade}%`);
  if (typeof filtros.minTotalGasto === 'number') {
    query = query.gte('total_gasto_acumulado', filtros.minTotalGasto);
  }

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar carteira analítica:', error);
    return [];
  }

  return data || [];
};

// --- 2.1 Ranking de Clientes para churn ---
export const getRankingClientes = async (): Promise<RankingCliente[]> => {
  console.log('🔄 Buscando Ranking de Clientes...');
  try {
    const { data, error } = await supabase
      .from('gemini_vw_ranking_clientes')
      .select('cliente_nome, telefone, dias_sem_comprar, total_gasto, ultima_compra')
      .order('dias_sem_comprar', { ascending: false });

    if (error) {
      console.error('❌ Erro Ranking Clientes:', error);
      if (isNetworkError(error)) {
        console.warn('⚠️ Retornando ranking demo (Supabase indisponível).');
        return DEMO_RANKING;
      }
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ Erro JS Ranking Clientes:', err);
    return DEMO_RANKING;
  }
};

// --- 4. Leituras detalhadas ---
export const getClientes = async (filtros: ClienteFiltro = {}): Promise<Cliente[]> => {
  let query = supabase
    .from('gemini_clientes')
    .select('*')
    .order('nome', { ascending: true });

  if (filtros.nome) query = query.ilike('nome', `%${filtros.nome}%`);
  if (filtros.cidade) query = query.ilike('cidade', `%${filtros.cidade}%`);
  if (filtros.uf) query = query.eq('uf', filtros.uf);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_clientes:', error);
    return [];
  }
  return data || [];
};

export const getProdutos = async (filtros: ProdutoFiltro = {}): Promise<Produto[]> => {
  let query = supabase
    .from('gemini_produtos')
    .select('*')
    .order('nome_produto', { ascending: true });

  if (filtros.categoria) query = query.eq('categoria_produto', filtros.categoria);
  if (filtros.marca) query = query.eq('marca', filtros.marca);
  if (filtros.tamanho) query = query.ilike('tamanho', `%${filtros.tamanho}%`);
  if (filtros.genero) query = query.eq('genero', filtros.genero);
  if (typeof filtros.estoqueMenorQue === 'number') query = query.lt('quantidade_estoque', filtros.estoqueMenorQue);
  if (filtros.buscaNome) query = query.ilike('nome_produto', `%${filtros.buscaNome}%`);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_produtos:', error);
    return [];
  }
  return data || [];
};

export const getVendasItens = async (filtros: VendaItemFiltro = {}): Promise<VendaItem[]> => {
  let query = supabase
    .from('gemini_vendas_itens')
    .select('*')
    .order('data', { ascending: false });

  if (filtros.vendedor) query = query.eq('vendedor', filtros.vendedor);
  if (filtros.sku) query = query.eq('sku', filtros.sku);
  if (filtros.movimentacao) query = query.eq('movimentacao', filtros.movimentacao);
  if (filtros.cliente) query = query.ilike('nome', `%${filtros.cliente}%`);
  query = applyDateRange(query, filtros.dataDe, filtros.dataAte);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_vendas_itens:', error);
    return [];
  }
  return data || [];
};

export const getVendasGeral = async (filtros: VendaGeralFiltro = {}): Promise<VendaGeral[]> => {
  let query = supabase
    .from('gemini_vendas_geral')
    .select('*')
    .order('movimentacao', { ascending: false });

  if (filtros.movimentacao) query = query.eq('movimentacao', filtros.movimentacao);
  if (filtros.tipo_operacao) query = query.eq('tipo_operacao', filtros.tipo_operacao);
  if (typeof filtros.totalVendaMin === 'number') query = query.gte('total_venda', filtros.totalVendaMin);
  if (typeof filtros.totalVendaMax === 'number') query = query.lte('total_venda', filtros.totalVendaMax);
  if (filtros.nome) query = query.ilike('nome', `%${filtros.nome}%`);

  const { data, error } = await query;
  if (error) {
    console.error('❌ Erro ao carregar gemini_vendas_geral:', error);
    return [];
  }
  return data || [];
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
      if (isNetworkError(erroItens)) {
        console.warn('⚠️ Sniper usando resultados demo (Supabase indisponível).');
        return DEMO_SNIPER;
      }
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
    return DEMO_SNIPER;
  }
};
