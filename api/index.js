import app from '../dist/server/index.js';

// Wrapper para Vercel Serverless Functions
export default async function handler(req, res) {
  // Configura variáveis de ambiente para Vercel
  process.env.VERCEL = '1';
  process.env.NODE_ENV = 'production';
  
  // Usa o app Express como handler
  return app(req, res);
}
