import app from '../dist/server/index.js';

// Handler para rotas da API (tRPC)
export default function handler(req, res) {
  try {
    console.log('[API] Request received:', req.method, req.url);
    
    // Configura variáveis de ambiente para Vercel
    process.env.VERCEL = '1';
    process.env.NODE_ENV = 'production';
    
    console.log('[API] Environment configured, calling Express...');
    
    // Express trata a request
    app(req, res);
  } catch (error) {
    console.error('[API] Error in handler:', error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
}
