import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mnxemxgcucfuoedqkygw.supabase.co';
const key = process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ueGVteGdjdWNmdW9lZHFreWd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTY5MTYsImV4cCI6MjA2OTQ3MjkxNn0.JeDMKgnwRcK71KOIun8txqFFBWEHSKdPzIF8Qm9tw1o';

const supabase = createClient(url, key);

async function main() {
  const { error } = await supabase
    .from('gemini_vw_analytics_categorias')
    .select('categoria_produto', { head: true })
    .limit(1);

  if (error) {
    if (error.message?.toLowerCase().includes('fetch failed')) {
      console.error('Conexão não pôde ser estabelecida. Verifique acesso à internet ou regras de rede.');
      process.exitCode = 1;
      return;
    }

    console.error('Erro ao consultar Supabase:', error.message);
    process.exitCode = 1;
    return;
  }

  console.log('✅ Conexão com Supabase bem-sucedida.');
}

main().catch((err) => {
  console.error('Erro inesperado ao verificar Supabase:', err?.message || err);
  process.exitCode = 1;
});
