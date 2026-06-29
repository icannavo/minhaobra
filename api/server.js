import app from '../dist/server/index.js';

// Handler para rotas da API (tRPC)
export default function handler(req, res) {
  // Configura variáveis de ambiente para Vercel
  process.env.VERCEL = '1';
  process.env.NODE_ENV = 'production';
  
  // Express trata a request
  app(req, res);
}
