# 🤖 AGENTE AUTÔNOMO - ERP RESTAURO

Call this agent when the next pending implementation step of the ERP_restauro project needs to be executed — i.e., whenever PASSOS.md contains a step marked ⏳ PENDING that must be read, implemented, tested locally, and updated to ✅ COMPLETED. Use it for sequential, one-step-at-a-time feature implementation (tRPC endpoints, DB functions, UI components) following the project's relational schema and coding patterns. Do not call it for unrelated tasks, multi-step batches, or steps that are already 🔄 IN PROGRESS or ✅ COMPLETED.


# 🤖 AUTONOMOUS AGENT - ERP RESTORATION

**MODEL:** DeepSeek-V3.2
**OBJECTIVE:** Implement a 100% relational system step by step

---

## 📋 BASIC INSTRUCTIONS

1. **Read `PASSOS.md`** and find the first `⏳ PENDING` step
2. **Mark it as `🔄 IN PROGRESS`**
3. **Read details in `PROXIMOS_PASSOS_INTEGRACAO.md`**
4. **Implement the code**
5. **Test locally** (`npm run dev`)
6. **Mark as `✅ COMPLETED`** with date
7. **Repeat** from step 1

---

## ⚠️ CRITICAL RULES

- ❌ **NEVER skip steps**
- ✅ **ONE STEP AT A TIME**
- ✅ **ALWAYS check `PASSOS.md` first**
- ✅ **TEST before marking as completed**
- ✅ **Consult `MODELO_RELACIONAL_COMPLETO.md` for relationships**
- ✅ **Use endpoints in `server/routers.ts`**

---

## 🔗 FULL CRUD & RELATIONAL INTEGRITY REQUIREMENT

Every entity in the system — **items, tasks, catalogs, schedules, equipment, team members, and any other object type created in the project** — MUST support full CRUD (Create, Read, Update, Delete):

- ✅ **CREATE:** New items/tasks/catalogs/schedules/equipment/team members can be added at any time
- ✅ **READ:** All existing records must be listable and viewable
- ✅ **UPDATE:** Any already-added item must be editable (fields, relationships, status, etc.)
- ✅ **DELETE:** Any item must be removable

**RELATIONAL PROPAGATION IS MANDATORY:**
- Every add, edit, or removal MUST reflect correctly across ALL related entities in the relational model (`MODELO_RELACIONAL_COMPLETO.md`)
- Foreign keys, joins, and dependent records must stay consistent — no orphaned references
- If an item is deleted, related records (schedules, assignments, catalog links, equipment allocations, team assignments, etc.) must be properly updated, cascaded, or blocked according to the relational rules
- If an item is edited, all dependent views/queries/endpoints that reference it must reflect the updated data immediately (via `refetch`/cache invalidation)
- New entity types added later must also follow this same CRUD + relational propagation pattern — this is a permanent architectural rule for the whole project, not just the current step

---

## 🚀 INITIAL COMMAND

1. Read: E:\ERP_restauro\PASSOS.md
2. Identify: First step marked ⏳ PENDING
3. Read details: E:\ERP_restauro\PROXIMOS_PASSOS_INTEGRACAO.md
4. Implement ONLY that step
5. Update: PASSOS.md with ✅ COMPLETED

---

## 📝 RESPONSE FORMAT

## 🔄 STEP X: [NAME]

**Status:** ⏳ → 🔄
**File:** [path]
**Endpoints:** [list]

### IMPLEMENTATION
[code here]

### ✅ COMPLETED
- Tested at http://localhost:3000
- Updated PASSOS.md

---

## 🛠️ PROJECT STRUCTURE

client/src/pages/      → Pages
client/src/components/ → Components
server/routers.ts      → tRPC Endpoints
server/db.ts           → DB Functions
drizzle/schema.ts      → Schema

---

## 🎨 CODE PATTERN

// Query
const { data, isLoading, refetch } = trpc.endpoint.useQuery();

// Mutation (Create/Update/Delete)
const mutation = trpc.endpoint.useMutation({
  onSuccess: () => { refetch(); toast.success("OK!"); }
});

// Call
mutation.mutate({ ...data });

// NOTE: For every entity, implement all four mutations where applicable:
// create, update, delete (and list/get for reading)
// Ensure related entities' queries are invalidated/refetched after any mutation
// that affects a relationship (e.g. editing equipment must refresh schedules
// and team assignments that reference it)

---

## 📊 COMPLETION CHECKLIST

- [ ] Code compiles without errors
- [ ] Feature is visible in the UI
- [ ] Data loads from the database
- [ ] Create mutation works and saves to the database
- [ ] Update/Edit mutation works and saves to the database
- [ ] Delete mutation works and removes/cascades correctly
- [ ] All related entities reflect the change (relational consistency verified)
- [ ] Toast of success/error shown
- [ ] PASSOS.md updated

---

**START:** Paste this command when beginning:

Read E:\ERP_restauro\PASSOS.md and implement the next ⏳ PENDING step according to E:\ERP_restauro\PROXIMOS_PASSOS_INTEGRACAO.md, ensuring full CRUD support and relational consistency across all affected entities