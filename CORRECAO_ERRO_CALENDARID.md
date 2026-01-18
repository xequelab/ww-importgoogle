# 🔧 CORREÇÃO - Erro "calendarId é obrigatório" ao criar webhook

## ❌ Erro que você está vendo:
```
status: 400
success: false
error: "calendarId é obrigatório."
```

## 🔍 Causa do Problema

Você está usando a **variável do componente** `selectedCalendarId` no workflow, mas ela está `undefined` porque:

1. A variável `selectedCalendarId` só tem valor quando existe um calendário com `recebe_agendamentos = true` **salvo no banco**
2. Quando você clica para confirmar a seleção, ainda não foi salvo no banco
3. Por isso a variável está `undefined`

## ✅ Solução Correta

**NÃO USE** a variável `selectedCalendarId` do componente.

**USE** o valor `calendarId` que vem **dentro do evento**.

---

## 📋 Cenário 1: Usando `On calendar selected` (Seu caso!)

Quando o usuário **confirma a seleção** de um calendário, você quer criar o webhook automaticamente.

### Passo a Passo no WeWeb:

1. **Selecione o componente** Import Google Calendar
2. Vá em **Events** → **On calendar selected**
3. Adicione ação: **Invoke an Edge Function**
4. Selecione a função: `cria_webhook_google`
5. No **Body**, configure:

```javascript
{
  "calendarId": "event.calendarId"  // ← Pegue do evento!
}
```

### Como fazer no WeWeb Editor:

1. No campo **Body** da ação "Invoke an Edge Function"
2. Clique em **Edit formula** (ícone de fórmula)
3. No campo `calendarId`, clique no ícone de binding
4. Navegue até: 
   - **FROM COMPONENTS IN CURRENT PAGE** 
   - → **Import Google Calendar** 
   - → **On calendar selected** 
   - → **event** 
   - → **calendarId** ✅

### Estrutura do Evento `calendar-selected`:

```javascript
{
  calendar: { /* objeto completo */ },
  calendarId: "primary" | "email@gmail.com",  // ← USE ESTE!
  calendarName: "Meu Calendário"
}
```

---

## 📋 Cenário 2: Usando `On webhook toggle` (Alternativa)

Se você preferir criar o webhook quando o usuário clicar no botão "Ativar Sincronização" na aba de conexão.

### Passo a Passo:

1. Vá em **Events** → **On webhook toggle**
2. Adicione ação: **Invoke an Edge Function** → `cria_webhook_google`
3. No **Body**:

```javascript
{
  "calendarId": "event.calendarId"  // ← Do evento webhook-toggle
}
```

### Estrutura do Evento `webhook-toggle`:

```javascript
{
  action: "activate" | "pause",
  calendarId: "primary" | "email@gmail.com",  // ← USE ESTE!
  calendar: { /* objeto completo */ },
  status: "active" | "inactive" | "error"
}
```

**Dica**: Você pode adicionar uma condição para só chamar a edge function quando `event.action === "activate"`.

---

## 🔍 Como Verificar se Está Correto

1. Abra o **Console do navegador** (F12)
2. Clique no botão de ativar webhook
3. Você deve ver no console:
   ```
   🔔 Webhook Toggle: { action: 'activate', calendarId: 'primary', activeCalendar: {...} }
   ```
4. Se aparecer `calendarId: undefined`, significa que você não selecionou um calendário ainda

## 🆘 Ainda dando erro?

### Cenário 1: `calendarId` está `undefined` no console

**Problema**: Você não selecionou nenhum calendário ainda.

**Solução**:
1. Vá na aba **Calendário**
2. Clique em "Buscar Calendários" (se a lista estiver vazia)
3. Selecione um calendário
4. Clique em "Confirmar Seleção"
5. Agora tente ativar o webhook novamente

### Cenário 2: `calendarId` aparece no console mas dá erro 400

**Problema**: O workflow está usando a variável errada.

**Solução**:
1. Vá no workflow do evento `On webhook toggle`
2. Verifique o Body da requisição
3. Certifique-se de usar `event.calendarId` (do evento)
4. NÃO use `selectedCalendarId` (variável do componente)

### Cenário 3: Erro persiste mesmo usando `event.calendarId`

**Problema**: A edge function pode estar esperando outro formato.

**Solução**: Verifique o código da edge function `cria_webhook_google`. Ela deve aceitar:
```javascript
{
  "calendarId": "string"
}
```

Se ela espera outro campo (ex: `calendar_id`), ajuste o Body da requisição:
```javascript
{
  "calendar_id": "event.calendarId"  // ou o nome que a edge espera
}
```

## 📝 Resumo

| Item | Valor Correto |
|------|---------------|
| **Evento** | `On webhook toggle` |
| **Campo no Body** | `calendarId` |
| **Valor a usar** | `event.calendarId` (do evento) |
| **NÃO usar** | `selectedCalendarId` (variável do componente) |

## 🎉 Depois de Corrigir

Após fazer a correção:
1. O webhook será criado com sucesso
2. Você verá no console: `✅ Webhook criado com sucesso`
3. O status mudará para "Ativo"
4. A sincronização automática estará funcionando

---

**Dica**: Se você quiser usar a variável do componente em outros lugares (ex: para mostrar qual calendário está selecionado), tudo bem! Mas para criar o webhook, **sempre use o valor do evento**.
