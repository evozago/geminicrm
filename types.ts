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
  categoria_produto: string; // Renamed from categoria
  marca: string;
  tamanho: string;
  cor: string;
  genero: string;
  valor_venda: number;
  valor_custo: number;
  quantidade_estoque: number; // Added
}

export interface VendaGeral {
  movimentacao: number;
  data: string;
  nome: string; // Renamed from cliente_nome
  telefone: string;
  total_venda: number;
  tipo_operacao: string; // Added (Venda simples, Troca, etc)
}

export interface VendaItem {
  movimentacao: number;
  sku: string;
  quantidade: number;
  valor_venda: number;
  data: string; // Added
}

// Views / Aggregated Data Types
export interface AnalyticsCategoria {
  categoria: string;
  faturamento_total: number;
  quantidade_vendas: number;
  lucro_total: number;
}

export interface SalesEvolutionData {
  mes: string;
  vendas: number;
  trocas: number;
}

export interface RankingCliente {
  cliente_nome: string;
  telefone: string;
  total_gasto: number;
  ultima_compra: string; // ISO date
  dias_sem_comprar: number;
}

export interface SalesSniperMatch {
  cliente: Cliente;
  motivo: string;
  ultimaCompraData: string;
  totalGastoHistorico: number;
  produtosComprados: string[];
}