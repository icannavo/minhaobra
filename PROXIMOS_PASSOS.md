# ✅ Próximos Passos para Deploy Automático

## Status Atual
✅ Código enviado para GitHub: https://github.com/icannavo/minhaobra  
✅ Workflows de CI/CD configurados  
✅ Configuração Vercel pronta  

## Escolha um Método de Deploy

### 🟢 Método 1: Integração Vercel + GitHub (RECOMENDADO - Mais Simples)

Este é o método mais fácil e não requer configurar secrets manualmente.

**Passos:**

1. **Acesse o Vercel:**
   - Vá para: https://vercel.com
   - Faça login com sua conta GitHub

2. **Importe o Projeto:**
   - Clique em "Add New..." → "Project"
   - Selecione "Import Git Repository"
   - Escolha: `icannavo/minhaobra`
   - Clique em "Import"

3. **Configure o Build:**
   ```
   Framework Preset: Other
   Build Command: pnpm build
   Output Directory: dist
   Install Command: pnpm install --no-frozen-lockfile
   ```

4. **Configure Variáveis de Ambiente (se necessário):**
   - Clique em "Environment Variables"
   - Adicione as variáveis necessárias:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION`
     - `AWS_BUCKET_NAME`
     - Outras variáveis do seu `.env`

5. **Deploy:**
   - Clique em "Deploy"
   - Aguarde o build (2-5 minutos)
   - 🎉 Seu site estará online!

**Vantagens:**
- ✅ Configuração automática
- ✅ Deploy automático a cada push
- ✅ Preview automático para Pull Requests
- ✅ Domínio gratuito (*.vercel.app)
- ✅ SSL/HTTPS automático

---

### 🔵 Método 2: GitHub Actions (Requer Configuração Manual)

Use este método se preferir controlar o deploy através do GitHub Actions.

**Passos:**

1. **Instale o Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Faça Login e Link o Projeto:**
   ```bash
   vercel login
   cd E:\ERP_restauro
   vercel link
   ```

3. **Obtenha as Credenciais:**
   - Copie o `orgId` e `projectId` do arquivo `.vercel/project.json`
   - Gere um token em: https://vercel.com/account/tokens

4. **Configure Secrets no GitHub:**
   - Acesse: https://github.com/icannavo/minhaobra/settings/secrets/actions
   - Adicione três secrets:
     - `VERCEL_TOKEN`: [seu token]
     - `VERCEL_ORG_ID`: [seu org id]
     - `VERCEL_PROJECT_ID`: [seu project id]

5. **Teste o Deploy:**
   - Faça qualquer alteração no código
   - Commit e push
   - Verifique: https://github.com/icannavo/minhaobra/actions

---

## Verificação Rápida

### O Deploy Está Funcionando?

**GitHub Actions:**
- ✅ Workflows visíveis em: https://github.com/icannavo/minhaobra/actions
- ⚠️ Se falhar, verifique se os secrets estão configurados

**Vercel:**
- ✅ Projeto visível em: https://vercel.com/dashboard
- ✅ URL do site disponível após primeiro deploy
- ⚠️ Se falhar, verifique os logs no dashboard

---

## Comandos Git Úteis

```bash
# Verificar status
git status

# Adicionar todas as alterações
git add .

# Fazer commit
git commit -m "Descrição das alterações"

# Enviar para GitHub (dispara deploy automático)
git push origin main

# Ver histórico
git log --oneline -5

# Ver branches
git branch -a
```

---

## Workflow de Desenvolvimento

1. **Faça alterações no código**
2. **Teste localmente:**
   ```bash
   pnpm dev
   ```
3. **Commit e push:**
   ```bash
   git add .
   git commit -m "feat: Nova funcionalidade"
   git push origin main
   ```
4. **Acompanhe o deploy:**
   - GitHub Actions: https://github.com/icannavo/minhaobra/actions
   - Vercel: https://vercel.com/dashboard
5. **Acesse o site atualizado!** 🚀

---

## Solução de Problemas

### ❌ Build Falha

**Erro de dependências:**
```bash
# Limpe e reinstale
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm build
```

**Erro de TypeScript:**
```bash
# Verifique erros de tipo
pnpm check
```

### ❌ Deploy Falha no Vercel

1. Verifique os logs no Vercel Dashboard
2. Confirme que as variáveis de ambiente estão configuradas
3. Teste localmente com `pnpm build`
4. Verifique se o `vercel.json` está correto

### ❌ GitHub Actions Falha

1. Verifique os logs em: https://github.com/icannavo/minhaobra/actions
2. Confirme que os secrets estão configurados (Método 2)
3. Verifique se o arquivo `.github/workflows/deploy.yml` está correto

---

## Próximas Melhorias

- [ ] Configurar domínio customizado no Vercel
- [ ] Adicionar testes automatizados
- [ ] Configurar ambiente de staging
- [ ] Adicionar badges de status no README
- [ ] Configurar notificações de deploy

---

## Recursos Úteis

- 📖 [Documentação Vercel](https://vercel.com/docs)
- 📖 [GitHub Actions](https://docs.github.com/actions)
- 📖 [Git Básico](https://git-scm.com/book/pt-br/v2)
- 🔧 [Vercel CLI](https://vercel.com/docs/cli)

---

**Dúvidas?** Abra uma issue no GitHub ou consulte o arquivo `DEPLOY.md` para instruções detalhadas.

🎉 **Parabéns! Seu projeto está pronto para deploy automático!**
