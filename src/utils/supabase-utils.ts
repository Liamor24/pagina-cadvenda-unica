import { supabase } from '@/integrations/supabase/client';

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 segundo
const MAX_RETRY_DELAY = 30000; // 30 segundos

/**
 * Função com retry automático para operações do Supabase
 * Usa backoff exponencial com jitter
 */
export async function executeWithRetry<T>(
  operation: () => Promise<T>,
  operationName: string = 'Supabase operation'
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`[${operationName}] Tentativa ${attempt}/${MAX_RETRIES}`);
      return await operation();
    } catch (error) {
      lastError = error as Error;
      console.error(`[${operationName}] Erro na tentativa ${attempt}:`, error);
      
      if (attempt < MAX_RETRIES) {
        // Backoff exponencial com jitter
        const delayMs = Math.min(
          INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
          MAX_RETRY_DELAY
        );
        const jitter = Math.random() * delayMs * 0.1;
        const totalDelay = delayMs + jitter;
        
        console.log(`[${operationName}] Aguardando ${Math.round(totalDelay)}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, totalDelay));
      }
    }
  }
  
  throw new Error(`[${operationName}] Falha após ${MAX_RETRIES} tentativas: ${lastError?.message}`);
}

/**
 * Valida a conexão com o Supabase
 */
export async function validateSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.warn('[Supabase] Erro ao validar sessão:', error);
      return false;
    }
    
    // Tenta fazer uma query simples para validar conexão
    const { error: queryError } = await supabase
      .from('sales')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.warn('[Supabase] Erro ao validar conexão:', queryError);
      return false;
    }
    
    console.log('[Supabase] Conexão válida');
    return true;
  } catch (error) {
    console.error('[Supabase] Erro ao validar conexão:', error);
    return false;
  }
}

/**
 * Aguarda a conexão do Supabase ficar disponível
 */
export async function waitForSupabaseConnection(
  timeoutMs: number = 30000
): Promise<boolean> {
  const startTime = Date.now();
  const checkInterval = 1000; // Verifica a cada 1 segundo
  
  while (Date.now() - startTime < timeoutMs) {
    const isConnected = await validateSupabaseConnection();
    if (isConnected) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, checkInterval));
  }
  
  console.error('[Supabase] Timeout esperando conexão');
  return false;
}

/**
 * Configura um heartbeat para monitorar a conexão
 * Retorna função para cancelar o monitoramento
 */
export function setupConnectionHeartbeat(
  onStatusChange?: (isConnected: boolean) => void,
  intervalMs: number = 30000
): () => void {
  let isConnected = true;
  
  const checkConnection = async () => {
    const wasConnected = isConnected;
    isConnected = await validateSupabaseConnection();
    
    if (wasConnected !== isConnected && onStatusChange) {
      console.log(`[Supabase] Status da conexão: ${isConnected ? 'conectado' : 'desconectado'}`);
      onStatusChange(isConnected);
    }
  };
  
  // Verifica imediatamente
  checkConnection();
  
  // Configura verificações periódicas
  const interval = setInterval(checkConnection, intervalMs);
  
  // Retorna função para cancelar
  return () => clearInterval(interval);
}
