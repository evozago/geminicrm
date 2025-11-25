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
}

export interface RankingCliente {
  cliente_nome: string;
  telefone: string;
  dias_sem_comprar: number;
  total_gasto: number;
  ultima_compra: string;
}
