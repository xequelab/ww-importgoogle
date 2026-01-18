# 🔧 CORREÇÃO DO BUG - Calendários não aparecem após buscar

## Problema
Você está enfrentando 2 bugs relacionados:

1. **Aba 2 mostra "Nenhum calendário encontrado"** mesmo após autenticar
2. **Botão "Buscar Calendários" chama a edge function mas não atualiza a lista**

## Causa Raiz
O componente **emite eventos** quando busca calendários, mas o **WeWeb não atualiza automaticamente as coleções** do banco de dados. Você precisa configurar **Workflows** para fazer o refresh.

## ✅ Solução - Passo a Passo

### 1. Configure o Workflow para "Buscar Calendários"

No **WeWeb Editor**:

1. Selecione o componente **Import Google Calendar**
2. Vá na aba **Events** (lado direito)
3. Encontre o evento: **On calendars fetched** (Ao buscar calendários)
4. Clique em **+ Add action**
5. Selecione: **Collections** → **Refresh collection**
6. Escolha a coleção: **userCalendars** (ou o nome que você deu)
7. Salve

**Resultado**: Agora quando clicar em "Buscar Calendários", a lista será atualizada automaticamente!

---

### 2. Configure o Workflow para "Selecionar Calendário"

Quando o usuário confirma a seleção de um calendário:

1. No mesmo componente, vá em **Events**
2. Encontre: **On calendar selected** (Ao selecionar calendário)
3. Adicione ação: **Refresh collection** → **userCalendars**
4. Salve

**Resultado**: O badge "Sincronizado" aparecerá no calendário correto.

---

### 3. Configure o Workflow para "Importar Eventos"

Quando eventos são importados com sucesso:

1. Vá em **Events** → **On import success**
2. Adicione ação: **Refresh collection** → **existingAppointments** (sua coleção de agendamentos)
3. Salve

**Resultado**: Eventos importados aparecerão com o badge "Importado" e não poderão ser reimportados.

---

### 4. Configure o Workflow para "Webhook Toggle"

Quando ativar/pausar sincronização:

1. Vá em **Events** → **On webhook toggle**
2. Adicione ação: **Refresh collection** → **userCalendars**
3. (Opcional) Se tiver coleção de webhooks separada, adicione refresh dela também
4. Salve

**Resultado**: O status do webhook será atualizado na interface.

---

## 🎯 Resumo dos Workflows Necessários

| Evento | Ação | Coleção a Atualizar |
|--------|------|---------------------|
| `On calendars fetched` | Refresh collection | `userCalendars` |
| `On calendar selected` | Refresh collection | `userCalendars` |
| `On import success` | Refresh collection | `existingAppointments` |
| `On webhook toggle` | Refresh collection | `userCalendars` |

---

## 🔍 Como Verificar se Funcionou

1. **Abra o Console do navegador** (F12)
2. Clique em "Buscar Calendários"
3. Você deve ver no console:
   ```
   ✅ Calendários buscados com sucesso: X
   ⚠️ IMPORTANTE: Configure um workflow no WeWeb para recarregar a coleção userCalendars após este evento
   ```
4. Se a lista **não aparecer**, verifique se o workflow está configurado
5. Se a lista **aparecer**, parabéns! O bug foi corrigido 🎉

---

## 📝 Notas Importantes

- **WeWeb não atualiza coleções automaticamente** quando dados mudam no banco
- Você **sempre precisa** adicionar ações de "Refresh collection" nos workflows
- Isso é uma limitação do WeWeb, não do componente
- O componente já emite todos os eventos necessários, basta configurar os workflows

---

## 🆘 Ainda não funcionou?

Verifique:

1. ✅ A coleção `userCalendars` está **bindada** no componente?
2. ✅ O endpoint `listCalendarsEndpoint` está **configurado**?
3. ✅ O `authToken` está **correto**?
4. ✅ A edge function está **salvando no banco**?
5. ✅ O workflow de refresh está **ativo** (não desabilitado)?

Se tudo estiver correto e ainda não funcionar, verifique os logs da edge function no Supabase.
