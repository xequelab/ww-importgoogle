# 🎯 RESUMO RÁPIDO - Como usar calendarId nos eventos

## ❌ NUNCA FAÇA ISSO:
```javascript
{
  "calendarId": "Import Google Calendar - selectedCalendarId"  // ← ERRADO! Vai dar undefined
}
```

## ✅ SEMPRE FAÇA ISSO:

### No evento `On calendar selected`:
```javascript
{
  "calendarId": "event.calendarId"  // ← Do evento calendar-selected
}
```

### No evento `On webhook toggle`:
```javascript
{
  "calendarId": "event.calendarId"  // ← Do evento webhook-toggle
}
```

---

## 📊 Tabela de Referência Rápida

| Evento | Caminho no WeWeb | O que usar |
|--------|------------------|------------|
| **On calendar selected** | Components → Import Google Calendar → On calendar selected → event → **calendarId** | `event.calendarId` |
| **On webhook toggle** | Components → Import Google Calendar → On webhook toggle → event → **calendarId** | `event.calendarId` |

---

## 🔍 Como saber se está correto?

Abra o Console (F12) e veja as mensagens:

### ✅ Correto:
```
📅 Calendário selecionado: { calendarId: 'primary', name: 'Meu Calendário', ... }
```

### ❌ Errado:
```
📅 Calendário selecionado: { calendarId: undefined, ... }
```

---

## 💡 Dica Final

**Regra de ouro**: Sempre que precisar do `calendarId` em um workflow, pegue do **evento**, nunca da **variável do componente**.

- ✅ `event.calendarId` (do evento)
- ❌ `selectedCalendarId` (variável do componente)

A variável `selectedCalendarId` só serve para **exibir** informações na tela, não para usar em workflows que modificam dados.
