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

export interface VendaItem {
  movimentacao: string;
  sku: string;
  quantidade: number;
  valor_venda: number;
  data: string;
  nome?: string;
}

// --- VIEWS DO SUPABASE (Ouro) ---

export interface AnalyticsCategoria {
  categoria_produto: string; // Nome exato da coluna na View
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

// A Super View de Carteira de Clientes
export interface CarteiraCliente {
  cliente: string;
  vendedor_responsavel: string; // Quem mais vendeu
  ultimo_vendedor: string;      // Quem atendeu por último
  total_gasto_acumulado: number;
  qtd_produtos_total: number;
  qtd_vendas: number;
  data_ultima_compra: string;
  ultimas_preferencias: string; // "Lui Bambini (6), Momi (8)"
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