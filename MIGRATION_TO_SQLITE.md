# Migração MySQL → SQLite - Completa ✅

## Resumo das Alterações

A migração do MySQL para SQLite foi concluída com sucesso. Todos os arquivos foram atualizados e o banco de dados SQLite foi criado.

## Arquivos Modificados

### 1. **drizzle/schema.ts**
- ✅ Substituído `drizzle-orm/mysql-core` por `drizzle-orm/sqlite-core`
- ✅ Substituído `mysqlTable` por `sqliteTable`
- ✅ Substituído tipos MySQL por SQLite:
  - `int()` → `integer()`
  - `varchar()` → `text()`
  - `decimal()` → `real()`
  - `date()` → `text()` (armazenado como ISO string)
  - `timestamp()` → `integer({ mode: "timestamp" })`
  - `boolean()` → `integer({ mode: "boolean" })`
  - `mysqlEnum()` → `text({ enum: [...] })`
- ✅ Ajustado `autoincrement()` para `primaryKey({ autoIncrement: true })`
- ✅ Substituído `.defaultNow()` por `.$defaultFn(() => new Date())`
- ✅ Removido `.onUpdateNow()` (não existe no SQLite)

### 2. **server/db.ts**
- ✅ Atualizado `getDb()` para usar SQLite local:
  ```typescript
  const sqlite = new Database("./database.sqlite");
  _db = drizzle(sqlite);
  ```
- ✅ Substituído `.onDuplicateKeyUpdate()` por `.onConflictDoUpdate()`:
  ```typescript
  .onConflictDoUpdate({
    target: users.openId,
    set: updateSet,
  })
  ```
- ✅ Convertido valores de `string` para `number` onde necessário:
  - `deviation` agora é `number` em vez de `string`
  - `productivity` agora é `number` em vez de `string`
  - `actualProductivity` agora é `number` em vez de `string`
- ✅ Removido imports não utilizados (`gte`, `lte`, `isNull`)

### 3. **drizzle.config.ts**
- ✅ Substituído `dialect: "mysql"` por `dialect: "sqlite"`
- ✅ Atualizado `dbCredentials` para usar arquivo local:
  ```typescript
  dbCredentials: {
    url: "./database.sqlite",
  }
  ```
- ✅ Alterado `out` para `./drizzle/migrations`
- ✅ Removido dependência de `process.env.DATABASE_URL`

## Banco de Dados Criado

✅ **database.sqlite** foi criado com sucesso na raiz do projeto

## Migração Gerada

✅ **drizzle/migrations/0000_tiresome_beyonder.sql** contém todas as tabelas:
- users
- works
- equipments
- daily_tasks
- task_equipments
- schedule_items
- productivity_history
- alerts

## Diferenças Importantes SQLite vs MySQL

### 1. **Tipos de Dados**
- SQLite usa apenas: `INTEGER`, `REAL`, `TEXT`, `BLOB`
- Decimal/Numeric → `REAL` (ponto flutuante)
- Date → `TEXT` (formato ISO 8601: "YYYY-MM-DD")
- Timestamp → `INTEGER` (Unix timestamp em milissegundos)

### 2. **ENUM**
- MySQL tem `ENUM` nativo
- SQLite simula com `TEXT` + validação no aplicativo

### 3. **Auto Increment**
- MySQL: `AUTO_INCREMENT`
- SQLite: `AUTOINCREMENT` (opcional, `PRIMARY KEY` já é auto-incrementado)

### 4. **Default Values**
- MySQL: `.defaultNow()`, `.onUpdateNow()`
- SQLite: `.$defaultFn(() => new Date())` (sem suporte a `onUpdateNow`)

### 5. **Upsert**
- MySQL: `.onDuplicateKeyUpdate()`
- SQLite: `.onConflictDoUpdate()` com `target` obrigatório

## Como Usar

### Gerar novas migrações
```bash
npm run db:push
```

### Aplicar migrações manualmente
```bash
npx drizzle-kit migrate
```

### Reconstruir better-sqlite3 (se necessário)
```bash
npm rebuild better-sqlite3
```

### Verificar tipos TypeScript
```bash
npm run check
```

## Observações

1. **Dados**: Nenhum dado foi migrado automaticamente. Você precisará exportar do MySQL e importar no SQLite se necessário.

2. **Timestamps**: SQLite armazena timestamps como inteiros (Unix epoch em ms), mas o Drizzle converte automaticamente para `Date` objects.

3. **Decimais**: SQLite usa `REAL` (float), então pode haver pequenas diferenças de precisão em cálculos financeiros comparado ao `DECIMAL` do MySQL.

4. **Foreign Keys**: As tabelas não têm foreign keys explícitas. Você pode adicioná-las depois se necessário.

## Status

✅ Migração Completa  
✅ Schema Convertido  
✅ Banco de Dados Criado  
✅ TypeScript Validado  
✅ Pronto para Uso
