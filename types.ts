// src/types.ts

// Tabelas Base
export interface Cliente {
  id: number;
  nome: string;
  telefone: string;
  cpf: string;
  cidade: string;
  uf: string;
}

export interface Produto {
  sku: string;
  nome_produto: string;
  categoria_produto: string;
  departamento: string;
  marca: string;
  tamanho: string;
  cor: string;
  genero: string;
  valor_venda: number;
  quantidade_estoque: number;
  data_criacao?: string;
}

// --- VIEWS ANALÍTICAS ---

export interface AnalyticsCategoria {
  categoria_produto: string;
  qtd_pedidos: number;
  pecas_vendidas: number;
  faturamento_bruto: number;
  lucro_estimado: number;
  preco_medio_peca: number;
}

export interface SalesEvolutionData {
  mes_ano: string;
  total_atendimentos: number;
  faturamento_liquido_real: number;
  tipo_operacao: string;
}

export interface CarteiraCliente {
  cliente: string;
  vendedor_responsavel: string;
  ultimo_vendedor: string;
  total_gasto_acumulado: number;
  qtd_produtos_total: number;
  qtd_vendas: number;
  data_ultima_compra: string;
  ultimas_preferencias: string;
  telefone?: string; // Adicionado para garantir compatibilidade
}

export interface SalesSniperMatch {
  cliente: {
    nome: string;
    telefone: string;
  };
  motivo: string;
  ultimaCompraData: string;
  totalGastoHistorico: number;
}

// --- NOVO: ANÁLISE DE GIRO DE ESTOQUE ---
export interface InventoryAnalytics {
  marca: string;
  genero: string;
  departamento: string;
  total_skus: number;
  qtd_estoque_atual: number;
  valor_estoque_custo: number;
  valor_estoque_venda: number;
  qtd_chegou_90d: number;
  vendas_qtd_30d: number;
  vendas_qtd_90d: number;
  vendas_valor_90d: number;
  // Campos calculados no Front-end
  sugestao?: 'COMPRAR' | 'LIQUIDAR' | 'MANTER';
  cobertura_dias?: number;
}

// --- CORREÇÃO: ANÁLISE DE CHURN ---
export interface RankingCliente {
  cliente_nome: string;
  telefone: string;
  total_gasto: number;
  ultima_compra: string;
  dias_sem_comprar: number;
}
