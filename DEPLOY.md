# Guia de Deploy Automático

Este projeto está configurado para deploy automático no Vercel através do GitHub Actions.

## Configuração Inicial

### 1. Obter as Credenciais do Vercel

Você precisa configurar três secrets no seu repositório GitHub:

#### a) VERCEL_TOKEN
1. Acesse [Vercel Dashboard](https://vercel.com/account/tokens)
2. Clique em "Create Token"
3. Dê um nome ao token (ex: "GitHub Actions")
4. Copie o token gerado

#### b) VERCEL_ORG_ID
1. Instale o Vercel CLI se ainda não tiver: `npm i -g vercel`
2. Execute `vercel login` e faça login
3. Execute `vercel link` no diretório do projeto
4. O arquivo `.vercel/project.json` será criado
5. Copie o valor de `orgId`

#### c) VERCEL_PROJECT_ID
1. No mesmo arquivo `.vercel/project.json`
2. Copie o valor de `projectId`

### 2. Adicionar Secrets no GitHub

1. Acesse seu repositório: https://github.com/icannavo/minhaobra
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os três secrets:
   - Nome: `VERCEL_TOKEN` | Valor: [seu token]
   - Nome: `VERCEL_ORG_ID` | Valor: [seu org id]
   - Nome: `VERCEL_PROJECT_ID` | Valor: [seu project id]

### 3. Método Alternativo (Mais Simples)

Se preferir usar a integração nativa do Vercel com GitHub:

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Clique em "Add New..." → "Project"
3. Importe seu repositório GitHub: `icannavo/minhaobra`
4. Configure as seguintes opções:
   - **Framework Preset**: Other
   - **Build Command**: `pnpm build`
   - **Output Directory**: `dist`
   - **Install Command**: `pnpm install --no-frozen-lockfile`
5. Clique em "Deploy"

Com a integração nativa, o Vercel fará deploy automático a cada push sem precisar do GitHub Actions!

## Como Funciona

### Deploy Automático

- **Push para main/master**: Deploy automático para produção
- **Pull Request**: Deploy de preview para testar antes de mergear
- **Push para outras branches**: Apenas CI (testes e build)

### Workflows Configurados

#### 1. `deploy.yml`
- Executa type check e build
- Faz deploy automático para Vercel
- Deploy de produção (main/master)
- Deploy de preview (pull requests)

#### 2. `ci.yml`
- Validação contínua
- Type checking
- Testes automatizados
- Build verification

## Comandos Git Úteis

```bash
# Verificar status
git status

# Adicionar alterações
git add .

# Commit
git commit -m "Descrição das alterações"

# Push para GitHub (dispara o deploy automático)
git push origin main

# Criar uma nova branch
git checkout -b feature/nova-funcionalidade

# Fazer push da nova branch
git push origin feature/nova-funcionalidade
```

## Variáveis de Ambiente

Não esqueça de configurar as variáveis de ambiente no Vercel Dashboard:

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as variáveis necessárias:
   - `DATABASE_URL` (se usar banco de dados)
   - `AWS_ACCESS_KEY_ID` (para S3)
   - `AWS_SECRET_ACCESS_KEY` (para S3)
   - Outras variáveis específicas do projeto

## Monitoramento

- **GitHub Actions**: https://github.com/icannavo/minhaobra/actions
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs de Deploy**: Disponíveis no Vercel Dashboard

## Solução de Problemas

### Build Falha no GitHub Actions
1. Verifique os logs em: https://github.com/icannavo/minhaobra/actions
2. Certifique-se de que o build funciona localmente: `pnpm build`
3. Verifique se todas as dependências estão no package.json

### Deploy Falha no Vercel
1. Verifique os logs no Vercel Dashboard
2. Confirme que os secrets estão configurados corretamente
3. Teste o deploy manual: `vercel --prod`

### Secrets Não Funcionam
1. Verifique se os nomes dos secrets estão corretos (case-sensitive)
2. Recrie os secrets se necessário
3. Execute novamente o workflow

## Próximos Passos

1. Configure os secrets do GitHub (se usar GitHub Actions)
   OU
2. Configure a integração Vercel + GitHub (método mais simples)
3. Faça seu primeiro commit e push
4. Acompanhe o deploy no GitHub Actions ou Vercel
5. Acesse sua aplicação no domínio fornecido pelo Vercel

## Recursos Adicionais

- [Documentação Vercel](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)
- [Vercel CLI](https://vercel.com/docs/cli)
