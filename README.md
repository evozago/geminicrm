<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19N1Qpj2M1vdqmoTAWeePUOimNQIHMzOT

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. (Optional) Configure Supabase connection for live data by setting `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` in `.env.local`.
4. To check if the Supabase endpoint is reachable from your network, run:
   `npm run check:supabase`
5. Run the app:
   `npm run dev`

## Consultas analíticas prontas
As funções em `services/dataService.ts` expõem leituras analíticas com filtros opcionais para os artefatos do Supabase:

- `getAnalyticsCategorias(filtros)` lê `gemini_vw_analytics_categorias` filtrando por categoria, faturamento mínimo e limite de linhas.
- `getAnaliseMensal(filtros)` usa `gemini_vw_analise_mensal` com recorte de período (`inicio`/`fim`) e por `tipo_operacao`.
- `getCarteiraClientesAnalitica(filtros)` consulta `gemini_vw_relatorio_carteira_clientes` por vendedor, cliente, cidade ou gasto acumulado.
- `getClientes`, `getProdutos`, `getVendasItens` e `getVendasGeral` fazem leituras detalhadas das tabelas originais com filtros de texto, datas e valores.

Todos os filtros são opcionais e usam comparações flexíveis (`ilike`) para busca textual. Consulte as assinaturas em `types.ts` para ver os campos disponíveis.
