---
name: Import Google Calendar
description: Componente WeWeb para importar eventos do Google Calendar. Permite selecionar período, visualizar eventos e importar os selecionados para o sistema.
keywords: google, calendar, import, events, agenda, psicólogos, agendamento
---

# Import Google Calendar

## Propósito

Componente completo de integração com Google Calendar para aplicação de agendamentos de psicólogos. Permite ao usuário:

1. **Conectar** - Autorizar acesso ao Google Calendar
2. **Selecionar Agenda** - Escolher qual calendário sincronizar
3. **Importar Eventos** - Selecionar período, visualizar e importar eventos

Interface de abas (tabs) facilita navegação entre as funcionalidades principais.

## Estrutura de Arquivos

```
ww-importgooglecalendar/
├── src/
│   ├── wwElement.vue              # Componente principal com sistema de abas
│   └── components/
│       ├── TabNavigation.vue      # Navegação por abas
│       ├── AuthPrompt.vue         # Prompt de autenticação
│       ├── CalendarSelector.vue   # Seleção de calendário + webhook
│       ├── EventItem.vue          # Item individual de evento
│       ├── EventFilters.vue       # Filtros de busca e tipo
│       ├── PeriodSelector.vue     # Seletor de período com atalhos
│       └── Pagination.vue         # Controles de paginação
├── ww-config.js                   # Configuração WeWeb
├── package.json
└── CLAUDE.md                      # Esta documentação
```

## Fluxo do Componente

### Sistema de Abas

O componente possui 3 abas principais:

#### Aba 1: Conexão
- **Não autenticado**: Mostra prompt para conectar com Google
- **Autenticado**: Mostra status da integração
  - **Autorização Google**: Status da conta conectada (email, expiração)
  - **Agenda Selecionada**: Qual calendário está ativo para sincronização

#### Aba 2: Calendário
- Lista de calendários do usuário (vindos do Google)
- Seleção com radio buttons
- Badge "Sincronizado" no calendário ativo
- Botão "Confirmar Seleção" para persistir escolha
- Seção de webhook (gerenciar sincronização automática)

#### Aba 3: Importar
- Seleção de período (com atalhos rápidos)
- Busca e listagem de eventos
- Filtros por tipo e busca textual
- Seleção de eventos para importar
- Indicador visual de eventos já importados

### ⚠️ CONFIGURAÇÃO IMPORTANTE - Atualização de Coleções

**Problema**: Quando o botão "Buscar Calendários" é clicado, a edge function é chamada e salva os calendários no banco, mas a coleção `userCalendars` no WeWeb não é atualizada automaticamente.

**Solução**: Configure um **Workflow** no WeWeb para o evento `On calendars fetched`:

1. No componente, vá em **Events** → `On calendars fetched`
2. Adicione uma ação: **Refresh collection** → selecione a coleção `userCalendars`
3. Isso fará com que a lista de calendários apareça imediatamente após a busca

**Eventos que precisam de refresh de coleção**:
- `calendars-fetched` → Refresh `userCalendars`
- `calendar-selected` → Refresh `userCalendars` (para atualizar o campo `recebe_agendamentos`)
- `webhook-toggle` → Refresh da coleção de webhooks (se aplicável)
- `import-success` → Refresh `existingAppointments` (para marcar eventos como importados)

### Steps Internos (Aba de Importação)

1. **select-period** - Usuário seleciona período de busca
2. **loading** - Buscando eventos da API
3. **select-events** - Lista de eventos para seleção
4. **importing** - Importando eventos selecionados
5. **success** - Importação concluída
6. **error** - Erro na busca ou importação

## Propriedades (Props)

### Configuração

| Propriedade | Tipo | Padrão | Descrição |
|-------------|------|--------|-----------|
| calendarId | String | 'primary' | ID do calendário Google |
| fetchEventsEndpoint | String | '' | URL da Edge Function para buscar eventos |
| importEventsEndpoint | String | '' | URL da Edge Function para importar eventos |
| authToken | String | '' | Token de autenticação (Bearer/JWT) |
| eventsPerPage | Number | 20 | Eventos por página (5-100) |
| preselectBirthdays | Boolean | false | Pré-selecionar aniversários |

### Textos (Todos Configuráveis)

- `titleStep1`: Título da etapa de seleção de período
- `titleStep3`: Título da etapa de seleção de eventos
- `titleSuccess`: Título da tela de sucesso
- `labelDateFrom`, `labelDateTo`: Labels dos inputs de data
- `labelSearch`, `labelSelectAll`, `labelFilterType`: Labels dos filtros
- `buttonFetch`, `buttonImport`, `buttonClose`, `buttonBack`, `buttonTryAgain`: Textos dos botões
- `labelLoading`, `labelImporting`: Mensagens de loading
- `labelNoEvents`, `labelEventsFound`, `labelEventsImported`: Mensagens de estado
- `quickPeriod30`, `quickPeriod90`, `quickPeriod180`: Labels dos atalhos de período

### Estilos

#### Cores Principais
- `primaryColor`: Cor primária (#081B4E)
- `secondaryColor`: Cor secundária (#4A5568)
- `backgroundColor`: Fundo (#FFFFFF)
- `surfaceColor`: Superfícies elevadas (#F7FAFC)
- `borderColor`: Bordas (#E2E8F0)
- `successColor`: Sucesso (#38A169)
- `errorColor`: Erro (#E53E3E)
- `textColor`: Texto principal (#1A202C)
- `textMutedColor`: Texto secundário (#718096)

#### Cores dos Badges (por tipo de evento)
- `badgeDefaultColor`: Evento padrão (#4299E1)
- `badgeBirthdayColor`: Aniversário (#ED64A6)
- `badgeFocusTimeColor`: Tempo de foco (#9F7AEA)
- `badgeOutOfOfficeColor`: Fora do escritório (#F6AD55)
- `badgeWorkingLocationColor`: Local de trabalho (#48BB78)
- `badgeFromGmailColor`: Do Gmail (#FC8181)

#### Tipografia
- `fontFamily`: Família da fonte ('inherit')
- `titleFontSize`: Tamanho do título (20px)
- `baseFontSize`: Tamanho base (14px)
- `smallFontSize`: Tamanho pequeno (12px)

#### Espaçamento
- `containerPadding`: Padding do container (24px)
- `itemGap`: Espaço entre itens (12px)
- `sectionGap`: Espaço entre seções (20px)

#### Componentes
- `buttonPadding`: Padding dos botões (12px 24px)
- `buttonFontSize`: Fonte dos botões (14px)
- `buttonFontWeight`: Peso da fonte (600)
- `inputPadding`: Padding dos inputs (10px 14px)
- `inputFontSize`: Fonte dos inputs (14px)
- `checkboxSize`: Tamanho do checkbox (20px)
- `eventItemPadding`: Padding do item de evento (12px 16px)
- `eventItemHoverColor`: Cor de hover (#EDF2F7)
- `paginationButtonSize`: Tamanho botões paginação (36px)

## Eventos Emitidos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| close | {} | Usuário fechou o componente |
| import-success | { count: number, events: array } | Importação concluída |
| import-error | { message: string } | Erro na importação |
| fetch-error | { message: string } | Erro ao buscar eventos |

## Ações Expostas

| Ação | Argumentos | Descrição |
|------|------------|-----------|
| reset | - | Reseta o componente ao estado inicial |
| goToStep | step: string | Navega para um step específico |

## Variáveis Expostas

| Variável | Tipo | Descrição |
|----------|------|-----------|
| currentStep | string | Step atual do componente |
| selectedCount | number | Quantidade de eventos selecionados |
| totalEvents | number | Total de eventos carregados |
| selectedCalendarId | string | ID do calendário sincronizado (calendar_id do Google) |
| selectedCalendarName | string | Nome do calendário sincronizado |
| selectedCalendar | object | Objeto completo do calendário sincronizado |

Acesso via: `variables['uid-currentStep']`, `variables['uid-selectedCount']`, `variables['uid-totalEvents']`, `variables['uid-selectedCalendarId']`, `variables['uid-selectedCalendarName']`, `variables['uid-selectedCalendar']`

## Integração com Edge Functions

### 1. Buscar Eventos (buscar-eventos-google)

**Request:**
```json
POST /buscar-eventos-google
Authorization: Bearer <token>
Content-Type: application/json

{
  "calendarId": "primary",
  "timeMin": "2025-01-01T00:00:00.000Z",
  "timeMax": "2025-03-31T23:59:59.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "events": [
    {
      "google_event_id": "abc123xyz",
      "data_inicio": "2025-01-15T10:00:00.000Z",
      "data_fim": "2025-01-15T11:00:00.000Z",
      "titulo": "Consulta Maria Silva",
      "descricao": "Sessão de terapia",
      "status": "confirmed",
      "duracao_real_minutos": 60,
      "link_meet": "https://meet.google.com/abc-defg-hij",
      "location": "Consultório 3",
      "event_type": "default",
      "email_cliente": "maria@email.com",
      "nome_cliente": "Maria Silva"
    }
  ],
  "stats": {
    "totalEvents": 45,
    "calendarId": "primary",
    "timeMin": "2025-01-01T00:00:00.000Z",
    "timeMax": "2025-03-31T23:59:59.000Z"
  }
}
```

### 2. Importar Eventos (importar-eventos-selecionados)

**Request:**
```json
POST /importar-eventos-selecionados
Authorization: Bearer <token>
Content-Type: application/json

{
  "calendarId": "primary",
  "events": [
    {
      "google_event_id": "abc123xyz",
      "data_inicio": "2025-01-15T10:00:00.000Z",
      "data_fim": "2025-01-15T11:00:00.000Z",
      "titulo": "Consulta Maria Silva",
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 12,
  "errors": []
}
```

## Tipos de Evento (event_type)

| Valor | Label | Descrição |
|-------|-------|-----------|
| default | Padrão | Evento normal |
| birthday | Aniversário | Calendário de contatos |
| focusTime | Foco | Tempo de foco |
| outOfOffice | Ausente | Fora do escritório |
| workingLocation | Local | Local de trabalho |
| fromGmail | Gmail | Criado automaticamente |

## Comportamentos Especiais

### Pré-seleção de Eventos
- Por padrão, eventos de aniversário (`birthday`) vêm **desmarcados**
- Configure `preselectBirthdays: true` para pré-selecionar todos

### Filtros
- Busca por título, nome do cliente e descrição
- Filtro por tipo de evento
- Checkbox "Selecionar todos" afeta apenas eventos filtrados

### Paginação
- Ativada automaticamente quando há mais eventos que `eventsPerPage`
- Reset automático da página ao alterar filtros

### Estilo
- Border-radius fixo de 8px em todos os elementos
- Paleta baseada em branco (#FFFFFF) e azul escuro (#081B4E)
- Todos os estilos configuráveis via propriedades

## Exemplo de Uso no WeWeb

```html
<!-- O componente vai dentro de um popup -->
<ww-popup v-if="showImportPopup">
  <ImportGoogleCalendar
    :calendar-id="selectedCalendarId"
    :fetch-events-endpoint="supabaseUrl + '/functions/v1/buscar-eventos-google'"
    :import-events-endpoint="supabaseUrl + '/functions/v1/importar-eventos-selecionados'"
    :auth-token="userToken"
    :existing-appointments="existingAppointments"
    @close="showImportPopup = false"
    @import-success="handleImportSuccess"
    @import-error="handleImportError"
  />
</ww-popup>
```

### Evitando Reimportação de Eventos

Para impedir que eventos já importados sejam importados novamente, passe a propriedade `existingAppointments`:

```javascript
// Estrutura esperada: array de objetos com google_event_id
existingAppointments = [
  {
    google_event_id: "abc123xyz",
    // ... outros campos do agendamento
  },
  {
    google_event_id: "def456uvw",
    // ... outros campos
  }
]
```

**Comportamento:**
- ✅ Eventos com `google_event_id` já existente são identificados automaticamente
- ✅ Badge verde "Importado" é exibido no lugar do checkbox
- ✅ Eventos importados não podem ser selecionados
- ✅ Ignorados na pré-seleção e no "Selecionar todos"
- ✅ Estilo visual diferenciado (opacidade reduzida)

## Notas de Implementação

1. O componente não inclui overlay/backdrop - deve ser colocado dentro de um popup do WeWeb
2. Todas as requisições incluem o header `Authorization: Bearer <token>` se `authToken` for fornecido
3. A lista de eventos tem scroll interno com altura máxima de 400px
4. Modo de edição do WeWeb (`isEditing`) bloqueia todas as ações
