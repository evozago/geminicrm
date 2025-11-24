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
  marca: string;
  tamanho: string;
  cor: string;
  genero: string;
  valor_venda: number;
  quantidade_estoque: number;
}

// Views de Inteligência (Essenciais para o Dashboard)
export interface AnalyticsCategoria {
  categoria_produto: string; // Nome exato da coluna na View SQL
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