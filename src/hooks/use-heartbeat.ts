import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook que mantém o projeto Supabase ativo fazendo pings periódicos.
 * Supabase pausa projetos gratuitos após 7 dias de inatividade.
 * Este hook previne a pausa mantendo atividade a cada 5 minutos.
 */
export function useHeartbeat() {
  useEffect(() => {
    // Função que faz ping ao Supabase
    const sendHeartbeat = async () => {
      try {
        // Query leve que apenas toca o banco
        await supabase
          .from('sales')
          .select('id')
          .limit(1);
        
        console.log('[Heartbeat] ✅ Ping ao Supabase enviado com sucesso');
      } catch (error) {
        console.error('[Heartbeat] ❌ Erro ao fazer ping:', error);
      }
    };

    // Fazer ping imediatamente ao iniciar
    sendHeartbeat();

    // Fazer ping a cada 5 minutos (300.000 ms)
    const heartbeatInterval = setInterval(sendHeartbeat, 5 * 60 * 1000);

    // Limpar intervalo ao desmontar o componente
    return () => clearInterval(heartbeatInterval);
  }, []);
}
