import app from '../dist/server/index.js';

// Wrapper para converter Vercel Serverless para Express
export default function handler(req, res) {
  // Configura variáveis de ambiente para Vercel
  process.env.VERCEL = '1';
  process.env.NODE_ENV = 'production';
  
  // Express espera ser chamado diretamente, não como promise
  app(req, res);
}
