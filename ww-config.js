export default {
  options: {
    displayAllowedValues: ['flex', 'inline-flex']
  },
  editor: {
    label: {
      en: 'Import Google Calendar',
      pt: 'Importar Google Calendar'
    },
    icon: 'calendar'
  },
  triggerEvents: [
    {
      name: 'auth-initiated',
      label: { en: 'On auth initiated', pt: 'Ao iniciar autenticação' },
      event: {},
      default: false
    },
    {
      name: 'token-renewed',
      label: { en: 'On token renewed', pt: 'Ao renovar token' },
      event: { expires_at: '' },
      default: false
    },
    {
      name: 'token-renewal-failed',
      label: { en: 'On token renewal failed', pt: 'Ao falhar renovação' },
      event: { error: '' },
      default: false
    },
    {
      name: 'close',
      label: { en: 'On close', pt: 'Ao fechar' },
      event: {},
      default: true
    },
    {
      name: 'import-success',
      label: { en: 'On import success', pt: 'Ao importar com sucesso' },
      event: {
        count: 0,
        events: []
      }
    },
    {
      name: 'import-error',
      label: { en: 'On import error', pt: 'Ao erro na importação' },
      event: {
        message: ''
      }
    },
    {
      name: 'fetch-error',
      label: { en: 'On fetch error', pt: 'Ao erro na busca' },
      event: {
        message: ''
      }
    },
    {
      name: 'calendar-selected',
      label: { en: 'On calendar selected', pt: 'Ao selecionar calendário' },
      event: {
        calendar: {}
      },
      default: false
    },
    {
      name: 'calendars-fetched',
      label: { en: 'On calendars fetched', pt: 'Ao buscar calendários' },
      event: {
        calendars: []
      },
      default: false
    },
    {
      name: 'calendars-fetch-error',
      label: { en: 'On calendars fetch error', pt: 'Ao erro buscar calendários' },
      event: {
        error: ''
      },
      default: false
    },
    {
      name: 'webhook-toggle',
      label: { en: 'On webhook toggle', pt: 'Ao alternar webhook' },
      event: {},
      default: false
    }
  ],
  actions: [
    {
      label: { en: 'Reset', pt: 'Resetar' },
      action: 'reset'
    },
    {
      label: { en: 'Go to step', pt: 'Ir para etapa' },
      action: 'goToStep',
      args: [
        {
          name: 'step',
          type: 'string'
        }
      ]
    }
  ],
  properties: {
    // ===== DADOS =====
    existingAppointments: {
      label: { en: 'Existing Appointments', pt: 'Agendamentos Existentes' },
      type: 'Object',
      section: 'settings',
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Coleção de agendamentos já importados (para evitar reimportação)'
      },
      propertyHelp: {
        tooltip: 'Bind a coleção de agendamentos para identificar quais eventos já foram importados. O componente irá desabilitar eventos que já possuem google_event_id.'
      }
      /* wwEditor:end */
    },
    userTokens: {
      label: { en: 'User Tokens', pt: 'Tokens do Usuário' },
      type: 'Object',
      section: 'settings',
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      bindingValidation: {
        type: 'object',
        tooltip: 'Objeto com tokens OAuth do Google (access_token, refresh_token, expires_at, status)'
      },
      propertyHelp: {
        tooltip: 'Tokens de autenticação OAuth do Google Calendar salvos na tabela user_tokens'
      }
      /* wwEditor:end */
    },
    userCalendars: {
      label: { en: 'User Calendars', pt: 'Calendários do Usuário' },
      type: 'Array',
      section: 'settings',
      bindable: true,
      defaultValue: [],
      /* wwEditor:start */
      bindingValidation: {
        type: 'array',
        tooltip: 'Coleção de calendários salvos da tabela calendarios_usuario'
      },
      propertyHelp: {
        tooltip: 'Bind a coleção calendarios_usuario filtrada pelo user_id atual. O componente mostrará os calendários disponíveis.'
      }
      /* wwEditor:end */
    },

    // ===== CONFIGURAÇÃO =====
    authUrl: {
      label: { en: 'Auth URL', pt: 'URL de Autenticação' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'https://seu-projeto.supabase.co/functions/v1/google-oauth'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL completa para iniciar OAuth com Google Calendar'
      },
      propertyHelp: {
        tooltip: 'Endpoint que redireciona o usuário para autenticação OAuth do Google e salva os tokens'
      }
      /* wwEditor:end */
    },
    renewTokenEndpoint: {
      label: { en: 'Renew Token Endpoint', pt: 'Endpoint Renovar Token' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'https://seu-projeto.supabase.co/functions/v1/renovar-token-google'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL da Edge Function para renovar tokens OAuth expirados'
      },
      propertyHelp: {
        tooltip: 'Endpoint que renova o access_token usando o refresh_token'
      }
      /* wwEditor:end */
    },
    listCalendarsEndpoint: {
      label: { en: 'List Calendars Endpoint', pt: 'Endpoint Listar Calendários' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'https://seu-projeto.supabase.co/functions/v1/salvar_todos_calendarios'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL da Edge Function que busca e salva calendários do Google'
      },
      propertyHelp: {
        tooltip: 'Endpoint que lista calendários do Google e salva na tabela calendarios_usuario'
      }
      /* wwEditor:end */
    },
    calendarId: {
      label: { en: 'Calendar ID', pt: 'ID do Calendário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'primary',
      options: {
        placeholder: 'primary'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'ID do calendário Google (ex: "primary" ou "abc@group.calendar.google.com")'
      },
      propertyHelp: {
        tooltip: 'Identificador do calendário do Google Calendar'
      }
      /* wwEditor:end */
    },
    fetchEventsEndpoint: {
      label: { en: 'Fetch Events Endpoint', pt: 'Endpoint Buscar Eventos' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'https://seu-projeto.supabase.co/functions/v1/buscar-eventos-google'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL completa da Edge Function para buscar eventos'
      },
      propertyHelp: {
        tooltip: 'Endpoint da Edge Function que busca eventos do Google Calendar'
      }
      /* wwEditor:end */
    },
    importEventsEndpoint: {
      label: { en: 'Import Events Endpoint', pt: 'Endpoint Importar Eventos' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'https://seu-projeto.supabase.co/functions/v1/importar-eventos-selecionados'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'URL completa da Edge Function para importar eventos selecionados'
      },
      propertyHelp: {
        tooltip: 'Endpoint da Edge Function que salva os eventos selecionados'
      }
      /* wwEditor:end */
    },
    authToken: {
      label: { en: 'Auth Token', pt: 'Token de Autenticação' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: '',
      options: {
        placeholder: 'Bearer token ou JWT'
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'string',
        tooltip: 'Token de autenticação para as requisições às Edge Functions'
      },
      propertyHelp: {
        tooltip: 'Token JWT ou Bearer para autenticar nas Edge Functions'
      }
      /* wwEditor:end */
    },
    eventsPerPage: {
      label: { en: 'Events per page', pt: 'Eventos por página' },
      type: 'Number',
      section: 'settings',
      bindable: true,
      defaultValue: 20,
      options: {
        min: 5,
        max: 100
      },
      /* wwEditor:start */
      bindingValidation: {
        type: 'number',
        tooltip: 'Número de eventos exibidos por página (5-100)'
      },
      propertyHelp: {
        tooltip: 'Quantidade de eventos mostrados por página na lista'
      }
      /* wwEditor:end */
    },
    preselectBirthdays: {
      label: { en: 'Pre-select birthdays', pt: 'Pré-selecionar aniversários' },
      type: 'OnOff',
      section: 'settings',
      bindable: true,
      defaultValue: false,
      /* wwEditor:start */
      bindingValidation: {
        type: 'boolean',
        tooltip: 'Se aniversários devem vir pré-selecionados'
      },
      propertyHelp: {
        tooltip: 'Quando desativado, eventos de aniversário vêm desmarcados por padrão'
      }
      /* wwEditor:end */
    },

    // ===== TEXTOS =====
    titleStep1: {
      label: { en: 'Title - Step 1', pt: 'Título - Etapa 1' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Selecionar Período',
      options: {
        placeholder: 'Selecionar Período'
      }
    },
    titleStep3: {
      label: { en: 'Title - Step 3', pt: 'Título - Etapa 3' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Selecionar Eventos',
      options: {
        placeholder: 'Selecionar Eventos'
      }
    },
    titleSuccess: {
      label: { en: 'Title - Success', pt: 'Título - Sucesso' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Importação Concluída',
      options: {
        placeholder: 'Importação Concluída'
      }
    },
    labelDateFrom: {
      label: { en: 'Label - Date from', pt: 'Label - Data de' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'De',
      options: {
        placeholder: 'De'
      }
    },
    labelDateTo: {
      label: { en: 'Label - Date to', pt: 'Label - Data até' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Até',
      options: {
        placeholder: 'Até'
      }
    },
    labelSearch: {
      label: { en: 'Label - Search', pt: 'Label - Busca' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Buscar por título...',
      options: {
        placeholder: 'Buscar por título...'
      }
    },
    labelSelectAll: {
      label: { en: 'Label - Select all', pt: 'Label - Selecionar todos' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Selecionar todos',
      options: {
        placeholder: 'Selecionar todos'
      }
    },
    labelFilterType: {
      label: { en: 'Label - Filter type', pt: 'Label - Filtrar tipo' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Tipo de evento',
      options: {
        placeholder: 'Tipo de evento'
      }
    },
    buttonFetch: {
      label: { en: 'Button - Fetch', pt: 'Botão - Buscar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Buscar Eventos',
      options: {
        placeholder: 'Buscar Eventos'
      }
    },
    buttonImport: {
      label: { en: 'Button - Import', pt: 'Botão - Importar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Importar Selecionados',
      options: {
        placeholder: 'Importar Selecionados'
      }
    },
    buttonClose: {
      label: { en: 'Button - Close', pt: 'Botão - Fechar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Fechar',
      options: {
        placeholder: 'Fechar'
      }
    },
    buttonBack: {
      label: { en: 'Button - Back', pt: 'Botão - Voltar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Voltar',
      options: {
        placeholder: 'Voltar'
      }
    },
    buttonTryAgain: {
      label: { en: 'Button - Try again', pt: 'Botão - Tentar novamente' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Tentar Novamente',
      options: {
        placeholder: 'Tentar Novamente'
      }
    },
    labelLoading: {
      label: { en: 'Label - Loading', pt: 'Label - Carregando' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Buscando eventos...',
      options: {
        placeholder: 'Buscando eventos...'
      }
    },
    labelImporting: {
      label: { en: 'Label - Importing', pt: 'Label - Importando' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Importando eventos...',
      options: {
        placeholder: 'Importando eventos...'
      }
    },
    labelNoEvents: {
      label: { en: 'Label - No events', pt: 'Label - Sem eventos' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Nenhum evento encontrado no período selecionado',
      options: {
        placeholder: 'Nenhum evento encontrado...'
      }
    },
    labelEventsFound: {
      label: { en: 'Label - Events found', pt: 'Label - Eventos encontrados' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'eventos encontrados',
      options: {
        placeholder: 'eventos encontrados'
      }
    },
    labelEventsImported: {
      label: { en: 'Label - Events imported', pt: 'Label - Eventos importados' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'eventos importados com sucesso!',
      options: {
        placeholder: 'eventos importados com sucesso!'
      }
    },
    quickPeriod30: {
      label: { en: 'Quick period - 30 days', pt: 'Período rápido - 30 dias' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Próximos 30 dias',
      options: {
        placeholder: 'Próximos 30 dias'
      }
    },
    quickPeriod90: {
      label: { en: 'Quick period - 90 days', pt: 'Período rápido - 90 dias' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Próximos 3 meses',
      options: {
        placeholder: 'Próximos 3 meses'
      }
    },
    quickPeriod180: {
      label: { en: 'Quick period - 180 days', pt: 'Período rápido - 180 dias' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Próximos 6 meses',
      options: {
        placeholder: 'Próximos 6 meses'
      }
    },
    titleSelectCalendar: {
      label: { en: 'Title - Select Calendar', pt: 'Título - Selecionar Calendário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Selecionar Calendário',
      options: {
        placeholder: 'Selecionar Calendário'
      }
    },
    descriptionSelectCalendar: {
      label: { en: 'Description - Select Calendar', pt: 'Descrição - Selecionar Calendário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Escolha qual calendário do Google deseja sincronizar com seus agendamentos.',
      options: {
        placeholder: 'Escolha qual calendário...'
      }
    },
    labelFetchCalendars: {
      label: { en: 'Label - Fetch Calendars', pt: 'Label - Buscar Calendários' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Buscar Calendários',
      options: {
        placeholder: 'Buscar Calendários'
      }
    },
    labelNoCalendars: {
      label: { en: 'Label - No Calendars', pt: 'Label - Sem Calendários' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Nenhum calendário encontrado. Clique no botão abaixo para buscar seus calendários do Google.',
      options: {
        placeholder: 'Nenhum calendário encontrado...'
      }
    },
    labelLoadingCalendars: {
      label: { en: 'Label - Loading Calendars', pt: 'Label - Carregando Calendários' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Buscando calendários...',
      options: {
        placeholder: 'Buscando calendários...'
      }
    },
    buttonContinueCalendar: {
      label: { en: 'Button - Continue', pt: 'Botão - Continuar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Continuar',
      options: {
        placeholder: 'Continuar'
      }
    },
    buttonConfirmCalendar: {
      label: { en: 'Button - Confirm Calendar', pt: 'Botão - Confirmar Calendário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Confirmar Seleção',
      options: {
        placeholder: 'Confirmar Seleção'
      }
    },

    // ===== TEXTOS - ABAS =====
    tabLabelAuth: {
      label: { en: 'Tab Label - Auth', pt: 'Label Aba - Conexão' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Conexão',
      options: {
        placeholder: 'Conexão'
      }
    },
    tabLabelCalendar: {
      label: { en: 'Tab Label - Calendar', pt: 'Label Aba - Calendário' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Calendário',
      options: {
        placeholder: 'Calendário'
      }
    },
    tabLabelImport: {
      label: { en: 'Tab Label - Import', pt: 'Label Aba - Importar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Importar',
      options: {
        placeholder: 'Importar'
      }
    },

    // ===== TEXTOS - WEBHOOK =====
    labelWebhookTitle: {
      label: { en: 'Webhook - Section Title', pt: 'Webhook - Título da Seção' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Sincronização Automática',
      options: {
        placeholder: 'Sincronização Automática'
      }
    },
    buttonWebhookPause: {
      label: { en: 'Webhook - Button Pause', pt: 'Webhook - Botão Pausar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Pausar Sincronização',
      options: {
        placeholder: 'Pausar Sincronização'
      }
    },
    buttonWebhookActivate: {
      label: { en: 'Webhook - Button Activate', pt: 'Webhook - Botão Ativar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Ativar Sincronização',
      options: {
        placeholder: 'Ativar Sincronização'
      }
    },
    buttonWebhookRetry: {
      label: { en: 'Webhook - Button Retry', pt: 'Webhook - Botão Reativar' },
      type: 'Text',
      section: 'settings',
      bindable: true,
      defaultValue: 'Reativar Webhook',
      options: {
        placeholder: 'Reativar Webhook'
      }
    },
    webhookStatus: {
      label: { en: 'Webhook Status', pt: 'Status do Webhook' },
      type: 'Object',
      section: 'settings',
      bindable: true,
      defaultValue: null,
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Objeto com { status: "active"|"inactive"|"error", url: "", lastSync: "", message: "" }'
      }
      /* wwEditor:end */
    },

    // ===== CORES PRINCIPAIS =====
    primaryColor: {
      label: { en: 'Primary Color', pt: 'Cor Primária' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#081B4E',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor principal usada em botões e elementos de destaque'
      }
      /* wwEditor:end */
    },
    secondaryColor: {
      label: { en: 'Secondary Color', pt: 'Cor Secundária' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#4A5568',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor secundária usada em textos e elementos menos destacados'
      }
      /* wwEditor:end */
    },
    backgroundColor: {
      label: { en: 'Background Color', pt: 'Cor de Fundo' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#FFFFFF',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor de fundo do componente'
      }
      /* wwEditor:end */
    },
    surfaceColor: {
      label: { en: 'Surface Color', pt: 'Cor de Superfície' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#F7FAFC',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor de fundo de cards e áreas elevadas'
      }
      /* wwEditor:end */
    },
    borderColor: {
      label: { en: 'Border Color', pt: 'Cor da Borda' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#E2E8F0',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor das bordas e divisores'
      }
      /* wwEditor:end */
    },
    successColor: {
      label: { en: 'Success Color', pt: 'Cor de Sucesso' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#38A169',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor para estados de sucesso'
      }
      /* wwEditor:end */
    },
    errorColor: {
      label: { en: 'Error Color', pt: 'Cor de Erro' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#E53E3E',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor para estados de erro'
      }
      /* wwEditor:end */
    },
    textColor: {
      label: { en: 'Text Color', pt: 'Cor do Texto' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#1A202C',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor principal do texto'
      }
      /* wwEditor:end */
    },
    textMutedColor: {
      label: { en: 'Muted Text Color', pt: 'Cor Texto Secundário' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#718096',
      options: {
        nullable: false
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Cor para textos secundários e descrições'
      }
      /* wwEditor:end */
    },

    // ===== CORES DOS BADGES DE TIPO =====
    badgeDefaultColor: {
      label: { en: 'Badge - Default', pt: 'Badge - Padrão' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#4299E1',
      options: {
        nullable: false
      }
    },
    badgeBirthdayColor: {
      label: { en: 'Badge - Birthday', pt: 'Badge - Aniversário' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#ED64A6',
      options: {
        nullable: false
      }
    },
    badgeFocusTimeColor: {
      label: { en: 'Badge - Focus Time', pt: 'Badge - Tempo de Foco' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#9F7AEA',
      options: {
        nullable: false
      }
    },
    badgeOutOfOfficeColor: {
      label: { en: 'Badge - Out of Office', pt: 'Badge - Fora do Escritório' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#F6AD55',
      options: {
        nullable: false
      }
    },
    badgeWorkingLocationColor: {
      label: { en: 'Badge - Working Location', pt: 'Badge - Local de Trabalho' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#48BB78',
      options: {
        nullable: false
      }
    },
    badgeFromGmailColor: {
      label: { en: 'Badge - From Gmail', pt: 'Badge - Do Gmail' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#FC8181',
      options: {
        nullable: false
      }
    },

    // ===== TIPOGRAFIA =====
    fontFamily: {
      label: { en: 'Font Family', pt: 'Família da Fonte' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: 'inherit',
      options: {
        placeholder: 'inherit'
      },
      /* wwEditor:start */
      propertyHelp: {
        tooltip: 'Fonte do componente (use "inherit" para herdar do pai)'
      }
      /* wwEditor:end */
    },
    titleFontSize: {
      label: { en: 'Title Font Size', pt: 'Tamanho Título' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '20px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 12, max: 48 }
        ]
      }
    },
    baseFontSize: {
      label: { en: 'Base Font Size', pt: 'Tamanho Base' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '14px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 10, max: 24 }
        ]
      }
    },
    smallFontSize: {
      label: { en: 'Small Font Size', pt: 'Tamanho Pequeno' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '12px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 8, max: 18 }
        ]
      }
    },

    // ===== ESPAÇAMENTO =====
    containerPadding: {
      label: { en: 'Container Padding', pt: 'Padding do Container' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '24px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 0, max: 64 }
        ]
      }
    },
    itemGap: {
      label: { en: 'Item Gap', pt: 'Espaço entre Itens' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '12px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 0, max: 32 }
        ]
      }
    },
    sectionGap: {
      label: { en: 'Section Gap', pt: 'Espaço entre Seções' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '20px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 0, max: 48 }
        ]
      }
    },

    // ===== BOTÕES =====
    buttonPadding: {
      label: { en: 'Button Padding', pt: 'Padding do Botão' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '12px 24px',
      options: {
        placeholder: '12px 24px'
      }
    },
    buttonFontSize: {
      label: { en: 'Button Font Size', pt: 'Tamanho Fonte Botão' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '14px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 10, max: 24 }
        ]
      }
    },
    buttonFontWeight: {
      label: { en: 'Button Font Weight', pt: 'Peso Fonte Botão' },
      type: 'TextSelect',
      section: 'style',
      bindable: true,
      defaultValue: '600',
      options: {
        options: [
          { value: '400', label: 'Normal (400)' },
          { value: '500', label: 'Medium (500)' },
          { value: '600', label: 'Semibold (600)' },
          { value: '700', label: 'Bold (700)' }
        ]
      }
    },

    // ===== INPUTS =====
    inputPadding: {
      label: { en: 'Input Padding', pt: 'Padding do Input' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '10px 14px',
      options: {
        placeholder: '10px 14px'
      }
    },
    inputFontSize: {
      label: { en: 'Input Font Size', pt: 'Tamanho Fonte Input' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '14px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 10, max: 24 }
        ]
      }
    },

    // ===== CHECKBOX =====
    checkboxSize: {
      label: { en: 'Checkbox Size', pt: 'Tamanho Checkbox' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '20px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 14, max: 32 }
        ]
      }
    },

    // ===== EVENT ITEM =====
    eventItemPadding: {
      label: { en: 'Event Item Padding', pt: 'Padding Item Evento' },
      type: 'Text',
      section: 'style',
      bindable: true,
      defaultValue: '12px 16px',
      options: {
        placeholder: '12px 16px'
      }
    },
    eventItemHoverColor: {
      label: { en: 'Event Item Hover', pt: 'Hover Item Evento' },
      type: 'Color',
      section: 'style',
      bindable: true,
      defaultValue: '#EDF2F7',
      options: {
        nullable: false
      }
    },

    // ===== PAGINAÇÃO =====
    paginationButtonSize: {
      label: { en: 'Pagination Button Size', pt: 'Tamanho Botão Paginação' },
      type: 'Length',
      section: 'style',
      bindable: true,
      defaultValue: '36px',
      options: {
        unitChoices: [
          { value: 'px', label: 'px', min: 24, max: 48 }
        ]
      }
    }
  }
};
