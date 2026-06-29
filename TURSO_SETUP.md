# 🗄️ Configuração do Banco de Dados Turso para Vercel

## O que é Turso?

Turso é um banco de dados SQLite hospedado na nuvem, perfeito para serverless. Funciona **identicamente** ao SQLite que você já está usando, mas pode ser acessado de qualquer lugar.

## ✅ Por que Turso?

- ✅ **100% compatível** com o código atual (SQLite)
- ✅ **Grátis** até 500MB e 1 bilhão de reads
- ✅ **Funciona perfeitamente** na Vercel
- ✅ **Zero mudanças** no código (apenas variáveis de ambiente)

## 🚀 Passo a Passo - Configuração em 5 Minutos

### 1. Criar Conta no Turso

1. Acesse: https://turso.tech/
2. Clique em "Sign Up" ou "Get Started"
3. Faça login com GitHub (recomendado)

### 2. Criar um Banco de Dados

Após fazer login:

1. No dashboard, clique em **"Create Database"**
2. Nome do banco: `minhaobra-production` (ou o que preferir)
3. Região: Escolha a mais próxima (ex: `sao` para São Paulo)
4. Clique em **"Create"**

### 3. Obter as Credenciais

Após criar o banco, você verá:

```bash
# Database URL (algo como):
libsql://minhaobra-production-seu-usuario.turso.io

# Auth Token (algo como):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copie ambos** - você vai precisar deles!

### 4. Configurar na Vercel

1. Acesse o dashboard da Vercel: https://vercel.com/icannavos-projects/minhaobra
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Nome | Valor | Environment |
|------|-------|-------------|
| `TURSO_DATABASE_URL` | `libsql://seu-banco.turso.io` | Production |
| `TURSO_AUTH_TOKEN` | `seu-token-aqui` | Production |

4. Clique em **"Save"**

### 5. Migrar os Dados (Opcional)

Se você já tem dados no SQLite local que quer migrar:

#### Opção A: Via Turso CLI (Recomendado)

```bash
# Instalar Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Fazer login
turso auth login

# Fazer upload do banco local
turso db shell minhaobra-production < database.sqlite
```

#### Opção B: Manualmente

1. Exporte os dados do SQLite local
2. Use o Turso Dashboard para importar

### 6. Fazer Redeploy

```bash
# Fazer push para o Git (já está configurado)
git add .
git commit -m "feat: Configuração Turso para produção"
git push origin main

# Ou fazer deploy direto
vercel --prod
```

## 🧪 Testar Localmente (Opcional)

Para testar com Turso localmente antes de fazer deploy:

1. Crie um arquivo `.env.local`:

```env
TURSO_DATABASE_URL=libsql://seu-banco.turso.io
TURSO_AUTH_TOKEN=seu-token-aqui
```

2. Execute o servidor:

```bash
pnpm dev
```

## 📊 Como Funciona

O código já está configurado para:

1. **Na Vercel (produção)**: Usa Turso com as variáveis de ambiente
2. **Localmente**: Usa SQLite normal (`file:./database.sqlite`)

**Sem mudanças no código!** O Drizzle ORM detecta automaticamente.

## 🔍 Verificar Logs

Para verificar se o banco está conectando:

```bash
# Ver logs do deploy
vercel logs https://minhaobra-five.vercel.app

# Deve aparecer:
# [Database] Conectando ao Turso (libSQL remoto)...
# [Database] Turso conectado com sucesso
```

## ❓ Dúvidas Comuns

### O SQLite local ainda funciona?

✅ **Sim!** Localmente continua usando o `database.sqlite` normalmente.

### Preciso mudar alguma query?

❌ **Não!** Turso é 100% compatível com SQLite.

### É grátis mesmo?

✅ **Sim!** O plano gratuito inclui:
- 500MB de storage
- 1 bilhão de row reads/mês
- 25 milhões de row writes/mês

Mais do que suficiente para começar!

### E se quiser voltar para SQLite puro?

Só remover as variáveis de ambiente da Vercel e o código volta a usar SQLite local automaticamente.

## 🎯 Próximos Passos

Depois de configurar:

1. ✅ Criar conta no Turso
2. ✅ Criar banco de dados
3. ✅ Adicionar variáveis de ambiente na Vercel
4. ✅ Fazer redeploy
5. ✅ Testar o site

## 📚 Recursos

- Turso Docs: https://docs.turso.tech/
- Turso Dashboard: https://turso.tech/dashboard
- Drizzle + libSQL: https://orm.drizzle.team/docs/get-started-sqlite#libsql

---

**Nota:** O código já está 100% pronto! Só falta adicionar as variáveis de ambiente na Vercel! 🚀
