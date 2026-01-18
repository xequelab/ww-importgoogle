<template>
  <div class="import-google-calendar" :style="containerStyle">
    <!-- Navegação por Abas -->
    <TabNavigation
      :tabs="tabs"
      :active-tab="activeTab"
      :styles="tabStyles"
      @tab-change="handleTabChange"
    />

    <!-- ABA 1: Conexão/Autenticação -->
    <div v-if="activeTab === 'auth'" class="tab-content">
      <AuthPrompt
        v-if="!isAuthenticated"
        :auth-url="authUrl"
        :title="titleAuth"
        :description="descriptionAuth"
        :button-text="buttonAuth"
        :authenticating-text="labelAuthenticating"
        :styles="authPromptStyles"
        @auth-initiated="handleAuthInitiated"
      />

      <!-- Status da Conexão - Clean Tailwind Style -->
      <div v-else class="connection-clean">
        <!-- Alert Principal -->
        <div class="alert-main" :class="{ 'alert-success': isFullyConnected, 'alert-warning': !isFullyConnected }">
          <div class="alert-icon">
            <svg v-if="isFullyConnected" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <svg v-else viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="alert-content">
            <h3 class="alert-title">{{ isFullyConnected ? 'Integração Ativa' : 'Ação Necessária' }}</h3>
            <p class="alert-desc">{{ isFullyConnected ? 'Tudo funcionando corretamente' : 'Complete os itens abaixo para ativar' }}</p>
          </div>
        </div>

        <!-- Checklist com Indentação -->
        <div class="checklist">
          <div class="checklist-item checklist-success">
            <div class="checklist-marker">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="checklist-body">
              <div class="checklist-label">Autorização Google</div>
              <div v-if="userTokens?.email" class="checklist-value">{{ userTokens.email }}</div>
              <p class="checklist-desc">O app possui permissão para ler e modificar seus eventos no Google Calendar.</p>
            </div>
          </div>

          <div class="checklist-item" :class="{ 'checklist-success': isWebhookActive, 'checklist-pending': !isWebhookActive }">
            <div class="checklist-marker">
              <svg v-if="isWebhookActive" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
              </svg>
              <svg v-else viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd"/>
              </svg>
            </div>
            <div class="checklist-body">
              <div class="checklist-label">{{ isWebhookActive ? 'Agenda Sincronizada' : 'Agenda Não Sincronizada' }}</div>
              <div class="checklist-row-content">
                <div v-if="activeCalendar" class="checklist-value">{{ activeCalendar.summary_override || activeCalendar.calendar_summary }}</div>
                
                <div class="checklist-actions" v-if="!activeCalendar || !isWebhookActive">
                  <button 
                    v-if="!activeCalendar" 
                    class="checklist-action" 
                    @click="goToCalendarTab"
                  >
                    Selecionar agenda
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                  <button 
                    v-else-if="!isWebhookActive" 
                    class="checklist-action action-warning" 
                    @click="handleWebhookToggle"
                  >
                    Ativar Sincronização
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                    </svg>
                  </button>
                </div>
              </div>
              <p class="checklist-desc">Sincronização bidirecional: eventos são atualizados em tempo real entre as plataformas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ABA 2: Seleção de Calendário -->
    <div v-else-if="activeTab === 'calendar'" class="tab-content">
      <CalendarSelector
        :calendars="userCalendars"
        :title="titleSelectCalendar"
        :description="descriptionSelectCalendar"
        :loading-text="labelLoadingCalendars"
        :empty-text="labelNoCalendars"
        :fetch-button-text="labelFetchCalendars"
        :continue-button-text="buttonContinueCalendar"
        :confirm-button-text="buttonConfirmCalendar"
        :webhook-status="webhookStatus"
        :is-fetching="isFetchingCalendars"
        :webhook-section-title="labelWebhookTitle"
        :webhook-button-active="buttonWebhookPause"
        :webhook-button-inactive="buttonWebhookActivate"
        :webhook-button-retry="buttonWebhookRetry"
        :styles="calendarSelectorStyles"
        @calendar-preselected="handleCalendarPreselected"
        @calendar-selected="handleCalendarSelected"
        @fetch-calendars="handleFetchCalendars"
        @continue="handleContinueFromCalendar"
        @webhook-toggle="handleWebhookToggle"
      />
    </div>

    <!-- ABA 3: Importação de Eventos -->
    <div v-else-if="activeTab === 'import'" class="tab-content">
      <!-- STEP 1: Seleção de Período -->
    <div v-if="step === 'select-period'" class="step-content">
      <h2 class="step-title" :style="titleStyle">{{ titleStep1 }}</h2>

      <PeriodSelector
        :time-min="timeMin"
        :time-max="timeMax"
        :label-from="labelDateFrom"
        :label-to="labelDateTo"
        :quick-period-30="quickPeriod30"
        :quick-period-90="quickPeriod90"
        :quick-period-180="quickPeriod180"
        :styles="inputStyles"
        @update:time-min="timeMin = $event"
        @update:time-max="timeMax = $event"
      />

      <div class="actions">
        <button
          class="btn btn-primary"
          :style="primaryButtonStyle"
          :disabled="!canFetch"
          @click="fetchEvents"
        >
          {{ buttonFetch }}
        </button>
      </div>
    </div>

    <!-- STEP 2: Loading -->
    <div v-else-if="step === 'loading'" class="step-content step-centered">
      <div class="spinner" :style="spinnerStyle"></div>
      <p class="loading-text" :style="textStyle">{{ labelLoading }}</p>
    </div>

    <!-- STEP 3: Seleção de Eventos -->
    <div v-else-if="step === 'select-events'" class="step-content">
      <div class="step-header">
        <h2 class="step-title" :style="titleStyle">{{ titleStep3 }}</h2>
        <span class="events-count" :style="mutedTextStyle">
          {{ filteredEvents.length }} {{ labelEventsFound }}
        </span>
      </div>

      <EventFilters
        v-if="events.length > 0"
        :search-query="searchQuery"
        :filter-event-type="filterEventType"
        :all-selected="allFilteredSelected"
        :some-selected="someFilteredSelected"
        :available-event-types="availableEventTypes"
        :label-search="labelSearch"
        :label-select-all="labelSelectAll"
        :label-filter-type="labelFilterType"
        :styles="inputStyles"
        :checkbox-styles="checkboxStyles"
        @update:search-query="searchQuery = $event"
        @update:filter-event-type="filterEventType = $event"
        @toggle-all="toggleAllFiltered"
      />

      <!-- Lista de eventos (agrupados) -->
      <div v-if="events.length > 0" class="events-list" :style="eventsListStyle">
        <template v-for="item in paginatedGroupedEvents" :key="item.type === 'group' ? `group-${item.title}` : item.event.google_event_id">
          <!-- Grupo de eventos recorrentes -->
          <EventGroup
            v-if="item.type === 'group'"
            :group-title="item.title"
            :events="item.events"
            :selected-ids="selectedEventIds"
            :imported-ids="importedGoogleIds"
            :styles="eventItemStyles"
            :checkbox-styles="checkboxStyles"
            :badge-colors="badgeColors"
            @toggle="toggleEventSelection"
            @toggle-group="toggleGroupSelection"
          />

          <!-- Evento único -->
          <EventItem
            v-else
            :event="item.event"
            :selected="selectedEventIds.includes(item.event.google_event_id)"
            :is-imported="importedGoogleIds.has(item.event.google_event_id)"
            :styles="eventItemStyles"
            :checkbox-styles="checkboxStyles"
            :badge-colors="badgeColors"
            @toggle="toggleEventSelection(item.event.google_event_id)"
          />
        </template>

        <!-- Mensagem se filtro não retornar resultados -->
        <div v-if="filteredEvents.length === 0 && events.length > 0" class="no-results" :style="mutedTextStyle">
          Nenhum evento corresponde aos filtros
        </div>
      </div>

      <!-- Estado vazio -->
      <div v-else class="empty-state" :style="mutedTextStyle">
        <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <p>{{ labelNoEvents }}</p>
      </div>

      <!-- Paginação -->
      <Pagination
        v-if="totalPagesGrouped > 1"
        :current-page="currentPage"
        :total-pages="totalPagesGrouped"
        :styles="paginationStyles"
        @update:current-page="currentPage = $event"
      />

      <div class="actions actions-split">
        <button
          class="btn btn-secondary"
          :style="secondaryButtonStyle"
          @click="goBack"
        >
          {{ buttonBack }}
        </button>
        <button
          class="btn btn-primary"
          :style="primaryButtonStyle"
          :disabled="selectedEventIds.length === 0"
          @click="importEvents"
        >
          {{ buttonImport }} ({{ selectedEventIds.length }})
        </button>
      </div>
    </div>

    <!-- STEP 4: Importando -->
    <div v-else-if="step === 'importing'" class="step-content step-centered">
      <div class="spinner" :style="spinnerStyle"></div>
      <p class="loading-text" :style="textStyle">{{ labelImporting }}</p>
    </div>

    <!-- STEP 5: Sucesso -->
    <div v-else-if="step === 'success'" class="step-content step-centered">
      <div class="success-icon" :style="successIconStyle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h2 class="step-title" :style="titleStyle">{{ titleSuccess }}</h2>
      <p class="success-message" :style="textStyle">
        {{ successCount }} {{ labelEventsImported }}
      </p>
      <div class="actions">
        <button
          class="btn btn-primary"
          :style="primaryButtonStyle"
          @click="handleClose"
        >
          {{ buttonClose }}
        </button>
      </div>
    </div>

      <!-- STEP 6: Erro -->
      <div v-else-if="step === 'error'" class="step-content step-centered">
        <div class="error-icon" :style="errorIconStyle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2 class="step-title" :style="titleStyle">Erro</h2>
        <p class="error-message" :style="errorTextStyle">
          {{ errorMessage }}
        </p>
        <div class="actions">
          <button
            class="btn btn-secondary"
            :style="secondaryButtonStyle"
            @click="goBack"
          >
            {{ buttonTryAgain }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import TabNavigation from './components/TabNavigation.vue';
import AuthPrompt from './components/AuthPrompt.vue';
import CalendarSelector from './components/CalendarSelector.vue';
import PeriodSelector from './components/PeriodSelector.vue';
import EventFilters from './components/EventFilters.vue';
import EventItem from './components/EventItem.vue';
import EventGroup from './components/EventGroup.vue';
import Pagination from './components/Pagination.vue';

export default {
  name: 'ImportGoogleCalendar',
  components: {
    TabNavigation,
    AuthPrompt,
    CalendarSelector,
    PeriodSelector,
    EventFilters,
    EventItem,
    EventGroup,
    Pagination
  },
  props: {
    content: {
      type: Object,
      required: true
    },
    uid: {
      type: String,
      required: true
    },
    /* wwEditor:start */
    wwEditorState: {
      type: Object,
      required: true
    }
    /* wwEditor:end */
  },
  emits: ['trigger-event'],
  setup(props, { emit }) {
    // ===== Autenticação =====
    const userTokens = computed(() => props.content?.userTokens || null);
    const isTokenExpired = computed(() => {
      // Se não tiver expires_at, assume não expirado OU expirado dependendo da lógica.
      // Melhor assumir não expirado se tiver access_token, mas vamos manter a lógica atual.
      if (!userTokens.value?.expires_at) return false;
      const expiresAt = new Date(userTokens.value.expires_at);
      return expiresAt <= new Date();
    });

    const createWebhookEndpoint = computed(() => props.content?.createWebhookEndpoint || '');
    const renewTokenEndpoint = computed(() => props.content?.renewTokenEndpoint || '');

    const isAuthenticated = computed(() => {
      if (!userTokens.value) return false;
      if (userTokens.value.status !== 'active') return false;
      if (!userTokens.value.access_token) return false;
      if (isTokenExpired.value) return false; // Token expirado = não autenticado

      return true;
    });

    // ===== Calendários do usuário =====
    const userCalendars = computed(() => {
      const calendars = props.content?.userCalendars;

      // Handle WeWeb collection object
      if (calendars && calendars.data && Array.isArray(calendars.data)) {
        return calendars.data.filter(cal => cal != null);
      }

      // Handle direct array binding
      if (Array.isArray(calendars)) {
        return calendars;
      }

      return [];
    });

    const hasActiveCalendar = computed(() => {
      return userCalendars.value.some(cal => cal.recebe_agendamentos === true);
    });

    // ===== IDs de eventos já importados =====
    const importedGoogleIds = computed(() => {
      const appointments = props.content?.existingAppointments;

      // Handle WeWeb collection object
      if (appointments && appointments.data && Array.isArray(appointments.data)) {
        const ids = appointments.data
          .filter(item => item != null)
          .map(item => item?.google_event_id)
          .filter(Boolean);
        return new Set(ids);
      }

      // Handle direct array binding
      if (Array.isArray(appointments)) {
        const ids = appointments
          .map(item => item?.google_event_id)
          .filter(Boolean);
        return new Set(ids);
      }

      return new Set();
    });

    // ===== Estado do editor =====
    const isEditing = computed(() => {
      /* wwEditor:start */
      return props.wwEditorState?.isEditing;
      /* wwEditor:end */
      // eslint-disable-next-line no-unreachable
      return false;
    });

    // ===== Estado do fluxo =====
    const getInitialStep = () => {
      if (!isAuthenticated.value) return 'not-authenticated';
      if (!hasActiveCalendar.value) return 'select-calendar';
      return 'select-period';
    };

    const step = ref(getInitialStep());
    const activeTab = ref('auth'); // Nova variável para controlar aba ativa
    const timeMin = ref(null);
    const timeMax = ref(null);
    const events = ref([]);
    const selectedEventIds = ref([]);
    const searchQuery = ref('');
    const filterEventType = ref('all');
    const errorMessage = ref('');
    const successCount = ref(0);
    const currentPage = ref(1);
    const isRenewingToken = ref(false);
    const isFetchingCalendars = ref(false);
    const temporarySelectedCalendar = ref(null);

    // ===== Variáveis expostas =====
    const { value: currentStep, setValue: setCurrentStep } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'currentStep',
      type: 'string',
      defaultValue: 'select-period'
    });

    const { value: selectedCount, setValue: setSelectedCount } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedCount',
      type: 'number',
      defaultValue: 0
    });

    const { value: totalEvents, setValue: setTotalEvents } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'totalEvents',
      type: 'number',
      defaultValue: 0
    });

    // Variáveis do calendário selecionado
    const { value: selectedCalendarId, setValue: setSelectedCalendarId } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedCalendarId',
      type: 'string',
      defaultValue: null
    });

    const { value: selectedCalendarName, setValue: setSelectedCalendarName } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedCalendarName',
      type: 'string',
      defaultValue: null
    });

    const { value: selectedCalendarObject, setValue: setSelectedCalendarObject } = wwLib.wwVariable.useComponentVariable({
      uid: props.uid,
      name: 'selectedCalendar',
      type: 'object',
      defaultValue: null
    });

    // Computed para o calendário ativo (apenas do banco, não temporário)
    const activeCalendar = computed(() => {
      return userCalendars.value.find(cal => cal.recebe_agendamentos === true) || null;
    });

    // Sincronizar calendário ativo do BANCO com variáveis expostas
    watch(activeCalendar, (calendar) => {
      if (calendar) {
        setSelectedCalendarId(calendar.calendar_id || null);
        setSelectedCalendarName(calendar.summary_override || calendar.calendar_summary || null);
        setSelectedCalendarObject(calendar);
      } else {
        setSelectedCalendarId(null);
        setSelectedCalendarName(null);
        setSelectedCalendarObject(null);
      }
    }, { immediate: true });

    // Watch na seleção temporária para atualizar variáveis IMEDIATAMENTE
    watch(temporarySelectedCalendar, (calendar) => {
      if (calendar) {
        // Atualiza as variáveis com a seleção temporária
        setSelectedCalendarId(calendar.calendar_id || null);
        setSelectedCalendarName(calendar.summary_override || calendar.calendar_summary || null);
        setSelectedCalendarObject(calendar);
      } else if (!activeCalendar.value) {
        // Só limpa se não houver calendário ativo no banco
        setSelectedCalendarId(null);
        setSelectedCalendarName(null);
        setSelectedCalendarObject(null);
      }
    });

    // Limpar seleção temporária quando o banco atualizar
    watch(userCalendars, (newCalendars) => {
      if (temporarySelectedCalendar.value) {
        // Se o calendário temporário agora tem recebe_agendamentos true, limpa
        const temp = temporarySelectedCalendar.value;
        const updated = newCalendars.find(cal => cal.id === temp.id);
        if (updated && updated.recebe_agendamentos === true) {
          temporarySelectedCalendar.value = null;
        }
      }
    }, { deep: true });

    // Sincronizar step com variável exposta
    watch(step, (newStep) => {
      setCurrentStep(newStep);
    });

    watch(selectedEventIds, (newIds) => {
      setSelectedCount(newIds.length);
    }, { deep: true });

    watch(events, (newEvents) => {
      setTotalEvents(newEvents.length);
    }, { deep: true });

    // ===== Props computadas =====
    const authUrl = computed(() => props.content?.authUrl || '');
    const calendarId = computed(() => props.content?.calendarId || 'primary');
    const fetchEventsEndpoint = computed(() => props.content?.fetchEventsEndpoint || '');
    const importEventsEndpoint = computed(() => props.content?.importEventsEndpoint || '');
    const listCalendarsEndpoint = computed(() => props.content?.listCalendarsEndpoint || '');
    const authToken = computed(() => props.content?.authToken || '');
    const eventsPerPage = computed(() => props.content?.eventsPerPage || 20);
    const preselectBirthdays = computed(() => props.content?.preselectBirthdays !== false);

    // Textos - Autenticação
    const titleAuth = computed(() => props.content?.titleAuth || 'Conectar Google Calendar');
    const descriptionAuth = computed(() => props.content?.descriptionAuth || 'Para importar eventos e criar sincronização automática, conecte sua conta do Google Calendar.');
    const buttonAuth = computed(() => props.content?.buttonAuth || 'Conectar com Google');
    const labelAuthenticating = computed(() => props.content?.labelAuthenticating || 'Autenticando...');

    // Textos - Calendário
    const titleSelectCalendar = computed(() => props.content?.titleSelectCalendar || 'Selecionar Calendário');
    const descriptionSelectCalendar = computed(() => props.content?.descriptionSelectCalendar || 'Escolha qual calendário do Google deseja sincronizar com seus agendamentos.');
    const labelFetchCalendars = computed(() => props.content?.labelFetchCalendars || 'Buscar Calendários');
    const labelNoCalendars = computed(() => props.content?.labelNoCalendars || 'Nenhum calendário encontrado. Clique no botão abaixo para buscar seus calendários do Google.');
    const labelLoadingCalendars = computed(() => props.content?.labelLoadingCalendars || 'Buscando calendários...');
    const buttonContinueCalendar = computed(() => props.content?.buttonContinueCalendar || 'Continuar');
    const buttonConfirmCalendar = computed(() => props.content?.buttonConfirmCalendar || 'Confirmar Seleção');

    // Textos - Importação
    const titleStep1 = computed(() => props.content?.titleStep1 || 'Selecionar Período');
    const titleStep3 = computed(() => props.content?.titleStep3 || 'Selecionar Eventos');
    const titleSuccess = computed(() => props.content?.titleSuccess || 'Importação Concluída');
    const labelDateFrom = computed(() => props.content?.labelDateFrom || 'De');
    const labelDateTo = computed(() => props.content?.labelDateTo || 'Até');
    const labelSearch = computed(() => props.content?.labelSearch || 'Buscar por título...');
    const labelSelectAll = computed(() => props.content?.labelSelectAll || 'Selecionar todos');
    const labelFilterType = computed(() => props.content?.labelFilterType || 'Tipo de evento');
    const buttonFetch = computed(() => props.content?.buttonFetch || 'Buscar Eventos');
    const buttonImport = computed(() => props.content?.buttonImport || 'Importar Selecionados');
    const buttonClose = computed(() => props.content?.buttonClose || 'Fechar');
    const buttonBack = computed(() => props.content?.buttonBack || 'Voltar');
    const buttonTryAgain = computed(() => props.content?.buttonTryAgain || 'Tentar Novamente');
    const labelLoading = computed(() => props.content?.labelLoading || 'Buscando eventos...');
    const labelImporting = computed(() => props.content?.labelImporting || 'Importando eventos...');
    const labelNoEvents = computed(() => props.content?.labelNoEvents || 'Nenhum evento encontrado no período selecionado');
    const labelEventsFound = computed(() => props.content?.labelEventsFound || 'eventos encontrados');
    const labelEventsImported = computed(() => props.content?.labelEventsImported || 'eventos importados com sucesso!');
    const quickPeriod30 = computed(() => props.content?.quickPeriod30 || 'Próximos 30 dias');
    const quickPeriod90 = computed(() => props.content?.quickPeriod90 || 'Próximos 3 meses');
    const quickPeriod180 = computed(() => props.content?.quickPeriod180 || 'Próximos 6 meses');

    // ===== Textos - Abas =====
    const tabLabelAuth = computed(() => props.content?.tabLabelAuth || 'Conexão');
    const tabLabelCalendar = computed(() => props.content?.tabLabelCalendar || 'Calendário');
    const tabLabelImport = computed(() => props.content?.tabLabelImport || 'Importar');

    // ===== Textos - Webhook =====
    const labelWebhookTitle = computed(() => props.content?.labelWebhookTitle || 'Sincronização Automática');
    const buttonWebhookPause = computed(() => props.content?.buttonWebhookPause || 'Pausar Sincronização');
    const buttonWebhookActivate = computed(() => props.content?.buttonWebhookActivate || 'Ativar Sincronização');
    const buttonWebhookRetry = computed(() => props.content?.buttonWebhookRetry || 'Reativar Webhook');
    const labelConfigureSync = computed(() => props.content?.labelConfigureSync || 'Configurar Sincronização');

    // Webhook Status (vindo de props bindáveis)
    const webhookStatus = computed(() => props.content?.webhookStatus || null);

    // ===== Textos - Status de Conexão (Nova UX de Requisitos) =====
    const labelConnectionTitle = computed(() => props.content?.labelConnectionTitle || 'Status da Conexão');
    const labelConnectionDescription = computed(() => props.content?.labelConnectionDescription || 'Para usar a integração, complete os 2 requisitos abaixo:');
    const labelConnectionProgressComplete = computed(() => props.content?.labelConnectionProgressComplete || 'Todos os requisitos completos');
    const labelConnectionProgressIncomplete = computed(() => props.content?.labelConnectionProgressIncomplete || 'Requisitos pendentes');
    const labelRequirement1Title = computed(() => props.content?.labelRequirement1Title || '1. Autorização Google');
    const labelRequirement1Description = computed(() => props.content?.labelRequirement1Description || 'Conecte sua conta do Google');
    const labelRequirement2Title = computed(() => props.content?.labelRequirement2Title || '2. Agenda Selecionada');
    const labelRequirement2Description = computed(() => props.content?.labelRequirement2Description || 'Escolha qual calendário sincronizar');
    const labelSelectCalendarButton = computed(() => props.content?.labelSelectCalendarButton || 'Selecionar Agenda');
    const labelConnectionComplete = computed(() => props.content?.labelConnectionComplete || '✓ Integração configurada com sucesso! Você já pode importar eventos.');

    // ===== Status de Webhook e Conexão =====
    // Helper para normalizar o status (pode vir como objeto ou array)
    const normalizedWebhook = computed(() => {
      const data = webhookStatus.value;
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      }
      return data;
    });

    const isWebhookActive = computed(() => {
      const wb = normalizedWebhook.value;
      if (!wb) return false;
      const status = wb.status || wb.renewal_status;
      return status === 'active';
    });

    const isFullyConnected = computed(() => {
      return isAuthenticated.value && hasActiveCalendar.value && isWebhookActive.value;
    });

    const connectionProgressText = computed(() => {
      return isFullyConnected.value
        ? labelConnectionProgressComplete.value
        : labelConnectionProgressIncomplete.value;
    });

    const connectionProgressCount = computed(() => {
      const completed = (isAuthenticated.value ? 1 : 0) + (hasActiveCalendar.value ? 1 : 0);
      return `${completed}/2`;
    });

    const connectionProgressStyle = computed(() => ({
      backgroundColor: isFullyConnected.value
        ? `rgba(56, 161, 105, 0.1)`
        : `rgba(229, 62, 62, 0.05)`,
      border: `2px solid ${isFullyConnected.value
        ? (props.content?.successColor || '#38A169')
        : (props.content?.borderColor || '#E2E8F0')}`,
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '24px'
    }));

    const connectionProgressBadgeStyle = computed(() => ({
      backgroundColor: isFullyConnected.value
        ? (props.content?.successColor || '#38A169')
        : (props.content?.textMutedColor || '#718096'),
      color: '#FFFFFF',
      padding: '4px 12px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '700'
    }));

    const connectionCompleteStyle = computed(() => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: `rgba(56, 161, 105, 0.1)`,
      color: props.content?.successColor || '#38A169',
      padding: '16px',
      borderRadius: '8px',
      marginTop: '24px',
      fontWeight: '600',
      fontSize: '14px'
    }));

    const requirementTitleStyle = computed(() => ({
      fontSize: '16px',
      fontWeight: '600',
      margin: '0 0 4px 0',
      color: props.content?.textColor || '#1A202C'
    }));

    const requirementDetailsStyle = computed(() => ({
      marginTop: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }));

    const getRequirementItemStyle = (isCompleted) => {
      return {
        display: 'flex',
        gap: '16px',
        padding: '20px',
        backgroundColor: props.content?.surfaceColor || '#F7FAFC',
        border: `2px solid ${isCompleted
          ? (props.content?.successColor || '#38A169')
          : (props.content?.borderColor || '#E2E8F0')}`,
        borderRadius: '8px',
        marginBottom: '16px',
        opacity: isCompleted ? '1' : '0.8'
      };
    };

    const getRequirementNumberStyle = (isCompleted) => {
      return {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isCompleted
          ? (props.content?.successColor || '#38A169')
          : (props.content?.borderColor || '#E2E8F0'),
        color: isCompleted ? '#FFFFFF' : (props.content?.textMutedColor || '#718096'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
        fontWeight: '700',
        flexShrink: '0'
      };
    };

    // Novos estilos V2 (design bonito)
    const connectionProgressBadgeStyleV2 = computed(() => ({
      backgroundColor: isFullyConnected.value
        ? (props.content?.successColor || '#38A169')
        : (props.content?.secondaryColor || '#4A5568'),
      color: '#FFFFFF',
      padding: '6px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '700',
      letterSpacing: '0.5px'
    }));

    const selectCalendarButtonStyleV2 = computed(() => ({
      backgroundColor: props.content?.primaryColor || '#081B4E',
      color: '#FFFFFF',
      padding: '10px 16px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      transition: 'all 0.2s ease',
      width: '100%',
      justifyContent: 'center'
    }));


    // ===== Sistema de Abas =====
    const tabs = computed(() => [
      {
        id: 'auth',
        label: tabLabelAuth.value,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>`,
        disabled: false
      },
      {
        id: 'calendar',
        label: tabLabelCalendar.value,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
          <line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/>
          <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>`,
        disabled: !isAuthenticated.value,
        badge: !isAuthenticated.value ? '!' : null
      },
      {
        id: 'import',
        label: tabLabelImport.value,
        icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>`,
        disabled: !isAuthenticated.value || !hasActiveCalendar.value,
        badge: (!isAuthenticated.value || !hasActiveCalendar.value) ? '!' : null
      }
    ]);

    // Sincronizar aba ativa com autenticação e calendário
    watch([isAuthenticated, hasActiveCalendar], ([authenticated, hasCalendar]) => {
      if (isEditing.value) return;

      // Se não está autenticado, força aba de autenticação
      if (!authenticated && activeTab.value !== 'auth') {
        activeTab.value = 'auth';
      }

      // Se está autenticado mas não tem calendário e está na aba de importação, volta para calendário
      if (authenticated && !hasCalendar && activeTab.value === 'import') {
        activeTab.value = 'calendar';
      }
    });

    const handleTabChange = (tabId) => {
      if (isEditing.value) return;
      activeTab.value = tabId;

      // Atualizar step baseado na aba
      if (tabId === 'auth') {
        step.value = isAuthenticated.value ? 'select-period' : 'not-authenticated';
      } else if (tabId === 'calendar') {
        step.value = 'select-calendar';
      } else if (tabId === 'import') {
        step.value = 'select-period';
      }
    };

    // ===== Estilos =====
    const containerStyle = computed(() => ({
      '--primary-color': props.content?.primaryColor || '#081B4E',
      '--secondary-color': props.content?.secondaryColor || '#4A5568',
      '--background-color': props.content?.backgroundColor || '#FFFFFF',
      '--surface-color': props.content?.surfaceColor || '#F7FAFC',
      '--border-color': props.content?.borderColor || '#E2E8F0',
      '--success-color': props.content?.successColor || '#38A169',
      '--error-color': props.content?.errorColor || '#E53E3E',
      '--text-color': props.content?.textColor || '#1A202C',
      '--text-muted-color': props.content?.textMutedColor || '#718096',
      '--event-item-hover': props.content?.eventItemHoverColor || '#EDF2F7',
      fontFamily: props.content?.fontFamily || 'inherit',
      fontSize: props.content?.baseFontSize || '14px',
      padding: props.content?.containerPadding || '24px',
      backgroundColor: props.content?.backgroundColor || '#FFFFFF',
      color: props.content?.textColor || '#1A202C',
      gap: props.content?.sectionGap || '20px'
    }));

    const titleStyle = computed(() => ({
      fontSize: props.content?.titleFontSize || '20px',
      fontWeight: '600',
      color: props.content?.textColor || '#1A202C',
      margin: '0 0 4px 0'
    }));

    const textStyle = computed(() => ({
      fontSize: props.content?.baseFontSize || '14px',
      color: props.content?.textColor || '#1A202C'
    }));

    const mutedTextStyle = computed(() => ({
      fontSize: props.content?.smallFontSize || '12px',
      color: props.content?.textMutedColor || '#718096'
    }));

    const primaryButtonStyle = computed(() => ({
      backgroundColor: props.content?.primaryColor || '#081B4E',
      color: '#FFFFFF',
      padding: props.content?.buttonPadding || '12px 24px',
      fontSize: props.content?.buttonFontSize || '14px',
      fontWeight: props.content?.buttonFontWeight || '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }));

    const secondaryButtonStyle = computed(() => ({
      backgroundColor: 'transparent',
      color: props.content?.secondaryColor || '#4A5568',
      padding: props.content?.buttonPadding || '12px 24px',
      fontSize: props.content?.buttonFontSize || '14px',
      fontWeight: props.content?.buttonFontWeight || '600',
      borderRadius: '8px',
      border: `1px solid ${props.content?.borderColor || '#E2E8F0'}`,
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }));

    const spinnerStyle = computed(() => ({
      borderColor: props.content?.borderColor || '#E2E8F0',
      borderTopColor: props.content?.primaryColor || '#081B4E'
    }));

    const successIconStyle = computed(() => ({
      backgroundColor: `${props.content?.successColor || '#38A169'}20`,
      color: props.content?.successColor || '#38A169'
    }));

    const errorIconStyle = computed(() => ({
      backgroundColor: `${props.content?.errorColor || '#E53E3E'}20`,
      color: props.content?.errorColor || '#E53E3E'
    }));

    const errorTextStyle = computed(() => ({
      fontSize: props.content?.baseFontSize || '14px',
      color: props.content?.errorColor || '#E53E3E'
    }));

    const eventsListStyle = computed(() => ({
      gap: props.content?.itemGap || '12px'
    }));

    // Estilos para sub-componentes
    const inputStyles = computed(() => ({
      padding: props.content?.inputPadding || '10px 14px',
      fontSize: props.content?.inputFontSize || '14px',
      borderRadius: '8px',
      borderColor: props.content?.borderColor || '#E2E8F0',
      backgroundColor: props.content?.backgroundColor || '#FFFFFF',
      color: props.content?.textColor || '#1A202C',
      primaryColor: props.content?.primaryColor || '#081B4E',
      surfaceColor: props.content?.surfaceColor || '#F7FAFC'
    }));

    const checkboxStyles = computed(() => ({
      size: props.content?.checkboxSize || '20px',
      primaryColor: props.content?.primaryColor || '#081B4E',
      borderColor: props.content?.borderColor || '#E2E8F0',
      backgroundColor: props.content?.backgroundColor || '#FFFFFF'
    }));

    const eventItemStyles = computed(() => ({
      padding: props.content?.eventItemPadding || '12px 16px',
      borderRadius: '8px',
      borderColor: props.content?.borderColor || '#E2E8F0',
      hoverColor: props.content?.eventItemHoverColor || '#EDF2F7',
      textColor: props.content?.textColor || '#1A202C',
      mutedColor: props.content?.textMutedColor || '#718096',
      fontSize: props.content?.baseFontSize || '14px',
      smallFontSize: props.content?.smallFontSize || '12px'
    }));

    const badgeColors = computed(() => ({
      default: props.content?.badgeDefaultColor || '#4299E1',
      birthday: props.content?.badgeBirthdayColor || '#ED64A6',
      focusTime: props.content?.badgeFocusTimeColor || '#9F7AEA',
      outOfOffice: props.content?.badgeOutOfOfficeColor || '#F6AD55',
      workingLocation: props.content?.badgeWorkingLocationColor || '#48BB78',
      fromGmail: props.content?.badgeFromGmailColor || '#FC8181'
    }));

    const paginationStyles = computed(() => ({
      buttonSize: props.content?.paginationButtonSize || '36px',
      primaryColor: props.content?.primaryColor || '#081B4E',
      borderColor: props.content?.borderColor || '#E2E8F0',
      textColor: props.content?.textColor || '#1A202C',
      fontSize: props.content?.smallFontSize || '12px'
    }));

    const tabStyles = computed(() => ({
      borderColor: props.content?.borderColor || '#E2E8F0',
      backgroundColor: props.content?.backgroundColor || '#FFFFFF',
      primaryColor: props.content?.primaryColor || '#081B4E',
      textColor: props.content?.textColor || '#1A202C',
      textMutedColor: props.content?.textMutedColor || '#718096',
      errorColor: props.content?.errorColor || '#E53E3E',
      fontFamily: props.content?.fontFamily || 'inherit',
      baseFontSize: props.content?.baseFontSize || '14px',
      sectionGap: props.content?.sectionGap || '20px'
    }));

    const surfaceStyle = computed(() => ({
      backgroundColor: props.content?.surfaceColor || '#F7FAFC',
      borderRadius: '8px',
      padding: '16px',
      marginTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }));

    const successColor = computed(() => props.content?.successColor || '#38A169');

    const authPromptStyles = computed(() => ({
      containerPadding: props.content?.containerPadding || '24px',
      primaryColor: props.content?.primaryColor || '#081B4E',
      textColor: props.content?.textColor || '#1A202C',
      textMutedColor: props.content?.textMutedColor || '#718096',
      errorColor: props.content?.errorColor || '#E53E3E',
      titleFontSize: props.content?.titleFontSize || '20px',
      baseFontSize: props.content?.baseFontSize || '14px',
      smallFontSize: props.content?.smallFontSize || '12px',
      buttonPadding: props.content?.buttonPadding || '12px 24px',
      buttonFontSize: props.content?.buttonFontSize || '14px',
      buttonFontWeight: props.content?.buttonFontWeight || '600'
    }));

    const calendarSelectorStyles = computed(() => ({
      containerPadding: props.content?.containerPadding || '24px',
      sectionGap: props.content?.sectionGap || '20px',
      primaryColor: props.content?.primaryColor || '#081B4E',
      textColor: props.content?.textColor || '#1A202C',
      textMutedColor: props.content?.textMutedColor || '#718096',
      titleFontSize: props.content?.titleFontSize || '20px',
      baseFontSize: props.content?.baseFontSize || '14px',
      buttonPadding: props.content?.buttonPadding || '12px 24px',
      buttonFontSize: props.content?.buttonFontSize || '14px',
      buttonFontWeight: props.content?.buttonFontWeight || '600'
    }));

    // Estilos para a aba de conexão
    const statusItemStyle = computed(() => ({
      backgroundColor: props.content?.surfaceColor || '#F7FAFC',
      border: `1px solid ${props.content?.borderColor || '#E2E8F0'}`,
      borderRadius: '8px',
      padding: '20px',
      marginTop: '16px'
    }));

    const statusDetailsStyle = computed(() => ({
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: `1px solid ${props.content?.borderColor || '#E2E8F0'}`,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }));

    const getStatusIconStyle = (isActive) => {
      return {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: isActive
          ? `rgba(56, 161, 105, 0.1)`
          : `rgba(229, 62, 62, 0.1)`,
        color: isActive
          ? (props.content?.successColor || '#38A169')
          : (props.content?.errorColor || '#E53E3E'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: '0'
      };
    };

    // ===== Computed para eventos =====
    const filteredEvents = computed(() => {
      let result = events.value;

      // Filtro por busca
      if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(event =>
          event.titulo?.toLowerCase().includes(query) ||
          event.nome_cliente?.toLowerCase().includes(query) ||
          event.descricao?.toLowerCase().includes(query)
        );
      }

      // Filtro por tipo
      if (filterEventType.value !== 'all') {
        result = result.filter(event => event.event_type === filterEventType.value);
      }

      return result;
    });

    const totalPages = computed(() =>
      Math.ceil(filteredEvents.value.length / eventsPerPage.value)
    );

    const paginatedEvents = computed(() => {
      const start = (currentPage.value - 1) * eventsPerPage.value;
      const end = start + eventsPerPage.value;
      return filteredEvents.value.slice(start, end);
    });

    const allFilteredSelected = computed(() => {
      // Considera apenas eventos que podem ser selecionados (não importados)
      const selectableEvents = filteredEvents.value.filter(
        e => !importedGoogleIds.value.has(e.google_event_id)
      );

      if (selectableEvents.length === 0) return false;
      return selectableEvents.every(event =>
        selectedEventIds.value.includes(event.google_event_id)
      );
    });

    const someFilteredSelected = computed(() => {
      const selectableEvents = filteredEvents.value.filter(
        e => !importedGoogleIds.value.has(e.google_event_id)
      );

      if (selectableEvents.length === 0) return false;
      const selectedInFiltered = selectableEvents.filter(event =>
        selectedEventIds.value.includes(event.google_event_id)
      );
      return selectedInFiltered.length > 0 && selectedInFiltered.length < selectableEvents.length;
    });

    const canFetch = computed(() => {
      return timeMin.value && timeMax.value && timeMin.value <= timeMax.value;
    });

    // Tipos de eventos disponíveis (apenas os que têm pelo menos 1 evento)
    const availableEventTypes = computed(() => {
      const types = new Set();
      events.value.forEach(event => {
        if (event.event_type) {
          types.add(event.event_type);
        }
      });
      return Array.from(types);
    });

    // Agrupar eventos recorrentes (mesmo título)
    const groupedEvents = computed(() => {
      const groups = {};

      // Agrupar por título normalizado
      filteredEvents.value.forEach(event => {
        const originalTitle = event.titulo || 'Sem título';
        // Normalizar: remover espaços extras, converter para minúsculas
        const normalizedKey = originalTitle.trim().toLowerCase().replace(/\s+/g, ' ');

        if (!groups[normalizedKey]) {
          groups[normalizedKey] = {
            displayTitle: originalTitle, // Manter o título original para exibição
            events: []
          };
        }
        groups[normalizedKey].events.push(event);
      });


      // Separar grupos (2+ eventos) de eventos únicos
      const result = [];
      Object.values(groups).forEach(group => {
        if (group.events.length > 1) {
          // Ordenar eventos do grupo por data
          group.events.sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
          result.push({
            type: 'group',
            title: group.displayTitle,
            events: group.events,
            firstDate: group.events[0].data_inicio
          });
        } else {
          result.push({
            type: 'single',
            event: group.events[0],
            firstDate: group.events[0].data_inicio
          });
        }
      });

      // Ordenar tudo por data do primeiro evento
      result.sort((a, b) => new Date(a.firstDate) - new Date(b.firstDate));

      return result;
    });

    // Paginação baseada em grupos
    const totalGroupedItems = computed(() => groupedEvents.value.length);

    const totalPagesGrouped = computed(() =>
      Math.ceil(totalGroupedItems.value / eventsPerPage.value)
    );

    const paginatedGroupedEvents = computed(() => {
      const start = (currentPage.value - 1) * eventsPerPage.value;
      const end = start + eventsPerPage.value;
      const result = groupedEvents.value.slice(start, end);

      return result;
    });

    // ===== Métodos =====
    const renewToken = async () => {
      if (isEditing.value) return false;
      if (!renewTokenEndpoint.value) {
        console.warn('renewTokenEndpoint não configurado');
        return false;
      }
      if (isRenewingToken.value) return false;

      isRenewingToken.value = true;

      try {
        // Prepara o header de autorização
        const authHeader = authToken.value
          ? (authToken.value.startsWith('Bearer ')
              ? authToken.value
              : `Bearer ${authToken.value}`)
          : null;

        const response = await fetch(renewTokenEndpoint.value, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {})
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao renovar token');
        }

        // Emitir evento de sucesso
        emit('trigger-event', {
          name: 'token-renewed',
          event: {
            expires_at: data.data.expires_at
          }
        });

        return true;

      } catch (error) {
        console.error('Erro ao renovar token:', error);

        emit('trigger-event', {
          name: 'token-renewal-failed',
          event: {
            error: error.message
          }
        });

        return false;
      } finally {
        isRenewingToken.value = false;
      }
    };

    const fetchEvents = async () => {
      if (isEditing.value) return;
      if (!canFetch.value) return;

      step.value = 'loading';
      errorMessage.value = '';

      try {
        const response = await fetch(fetchEventsEndpoint.value, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken.value ? { 'Authorization': `Bearer ${authToken.value}` } : {})
          },
          body: JSON.stringify({
            calendarId: calendarId.value,
            timeMin: new Date(timeMin.value).toISOString(),
            timeMax: new Date(timeMax.value).toISOString()
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao buscar eventos');
        }

        events.value = data.events || [];

        // Pré-selecionar eventos (exceto aniversários se configurado e eventos já importados)
        const selectableEvents = events.value.filter(
          e => !importedGoogleIds.value.has(e.google_event_id)
        );

        if (preselectBirthdays.value) {
          selectedEventIds.value = selectableEvents.map(e => e.google_event_id);
        } else {
          selectedEventIds.value = selectableEvents
            .filter(e => e.event_type !== 'birthday')
            .map(e => e.google_event_id);
        }

        currentPage.value = 1;
        step.value = 'select-events';

      } catch (error) {
        errorMessage.value = error.message || 'Erro ao buscar eventos do Google Calendar';
        step.value = 'error';

        emit('trigger-event', {
          name: 'fetch-error',
          event: { message: errorMessage.value }
        });
      }
    };

    const importEvents = async () => {
      if (isEditing.value) return;
      if (selectedEventIds.value.length === 0) return;

      step.value = 'importing';
      errorMessage.value = '';

      try {
        const selectedEvents = events.value.filter(e =>
          selectedEventIds.value.includes(e.google_event_id)
        );

        const response = await fetch(importEventsEndpoint.value, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken.value ? { 'Authorization': `Bearer ${authToken.value}` } : {})
          },
          body: JSON.stringify({
            calendarId: calendarId.value,
            events: selectedEvents
          })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao importar eventos');
        }

        successCount.value = data.imported || selectedEvents.length;
        step.value = 'success';

        emit('trigger-event', {
          name: 'import-success',
          event: {
            count: successCount.value,
            events: selectedEvents
          }
        });

      } catch (error) {
        errorMessage.value = error.message || 'Erro ao importar eventos';
        step.value = 'error';

        emit('trigger-event', {
          name: 'import-error',
          event: { message: errorMessage.value }
        });
      }
    };

    const toggleEventSelection = (eventId) => {
      if (isEditing.value) return;
      if (importedGoogleIds.value.has(eventId)) return; // Ignora eventos já importados

      const index = selectedEventIds.value.indexOf(eventId);
      if (index === -1) {
        selectedEventIds.value.push(eventId);
      } else {
        selectedEventIds.value.splice(index, 1);
      }
    };

    const toggleGroupSelection = ({ ids, select }) => {
      if (isEditing.value) return;

      if (select) {
        // Adicionar todos os IDs que não estão selecionados
        const newIds = [...new Set([...selectedEventIds.value, ...ids])];
        selectedEventIds.value = newIds;
      } else {
        // Remover todos os IDs do grupo
        selectedEventIds.value = selectedEventIds.value.filter(id => !ids.includes(id));
      }
    };

    const toggleAllFiltered = () => {
      if (isEditing.value) return;

      // Filtra apenas eventos que NÃO foram importados
      const selectableFilteredEvents = filteredEvents.value.filter(
        e => !importedGoogleIds.value.has(e.google_event_id)
      );

      if (allFilteredSelected.value) {
        // Desmarcar todos os filtrados (exceto importados)
        const selectableIds = selectableFilteredEvents.map(e => e.google_event_id);
        selectedEventIds.value = selectedEventIds.value.filter(id => !selectableIds.includes(id));
      } else {
        // Marcar todos os filtrados (exceto importados)
        const selectableIds = selectableFilteredEvents.map(e => e.google_event_id);
        const newIds = [...new Set([...selectedEventIds.value, ...selectableIds])];
        selectedEventIds.value = newIds;
      }
    };

    const goBack = () => {
      if (isEditing.value) return;

      if (step.value === 'select-events' || step.value === 'error') {
        step.value = 'select-period';
      }
    };

    const formatExpiryDate = (dateString) => {
      try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = date - now;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 1) {
          return `${diffDays} dias`;
        } else if (diffHours > 1) {
          return `${diffHours} horas`;
        } else {
          return 'Menos de 1 hora';
        }
      } catch {
        return 'Data inválida';
      }
    };

    const handleAuthInitiated = () => {
      if (isEditing.value) return;

      emit('trigger-event', {
        name: 'auth-initiated',
        event: {}
      });
    };

    const handleCalendarPreselected = (calendar) => {
      if (isEditing.value) return;

      // Marca calendário como temporariamente selecionado (apenas para variáveis)
      temporarySelectedCalendar.value = calendar;
    };

    const handleCalendarSelected = (calendar) => {
      if (isEditing.value) return;

      const calendarId = calendar?.calendar_id;
      
      console.log('📅 Calendário selecionado:', { calendarId, name: calendar?.summary_override || calendar?.calendar_summary });

      // IMPORTANTE: Emitir evento ANTES de limpar temporário
      // para evitar race condition com o watch
      emit('trigger-event', {
        name: 'calendar-selected',
        event: { 
          calendar,
          calendarId,
          calendarName: calendar?.summary_override || calendar?.calendar_summary
        }
      });

      // Limpa temporário DEPOIS de emitir o evento
      temporarySelectedCalendar.value = null;
    };

    const handleFetchCalendars = async () => {
      if (isEditing.value) return;
      if (!listCalendarsEndpoint.value) {
        console.warn('listCalendarsEndpoint não configurado');
        return;
      }
      
      if (isFetchingCalendars.value) return;
      isFetchingCalendars.value = true;

      try {
        const authHeader = authToken.value
          ? (authToken.value.startsWith('Bearer ')
              ? authToken.value
              : `Bearer ${authToken.value}`)
          : null;

        const response = await fetch(listCalendarsEndpoint.value, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authHeader ? { 'Authorization': authHeader } : {})
          }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Erro ao buscar calendários');
        }

        console.log('✅ Calendários buscados com sucesso:', data.calendars?.length || 0);
        console.log('⚠️ IMPORTANTE: Configure um workflow no WeWeb para recarregar a coleção userCalendars após este evento');

        emit('trigger-event', {
          name: 'calendars-fetched',
          event: {
            success: true,
            count: data.calendars?.length || 0,
            calendars: data.calendars || []
          }
        });

      } catch (error) {
        console.error('Erro ao buscar calendários:', error);

        emit('trigger-event', {
          name: 'calendars-fetch-error',
          event: {
            error: error.message
          }
        });
      } finally {
        isFetchingCalendars.value = false;
      }
    };

    const handleContinueFromCalendar = () => {
      if (isEditing.value) return;
      if (!hasActiveCalendar.value) return;

      step.value = 'select-period';
    };

    const handleWebhookToggle = async () => {
      if (isEditing.value) return;

      const calendarId = activeCalendar.value?.calendar_id;
      const action = isWebhookActive.value ? 'pause' : 'activate';

      console.log('🔔 Webhook Toggle:', { action, calendarId, activeCalendar: activeCalendar.value });

      if (!calendarId) {
        console.error('❌ Erro: Nenhum calendário ativo encontrado. Certifique-se de selecionar um calendário primeiro.');
        emit('trigger-event', { 
          name: 'fetch-error', 
          event: { message: 'Nenhum calendário selecionado. Selecione um calendário na aba "Calendário" primeiro.' } 
        });
        return;
      }

      // SEMPRE emitir o evento para permitir Workflows no WeWeb
      // O usuário pode bindar esse evento e rodar a lógica inteira por fora se quiser
      emit('trigger-event', { 
        name: 'webhook-toggle', 
        event: { 
          action, 
          calendarId,  // ⚠️ USE ESTE VALOR no workflow, não a variável selectedCalendarId
          calendar: activeCalendar.value,
          status: webhookStatus.value?.status 
        } 
      });

      // Se for pausa, paramos aqui (por enquanto assumimos que o workflow lida ou não tem endpoint de pause)
      if (action === 'pause') return;

      // Lógica de Ativação interna (opcional)
      // Só executa se o usuário tiver configurado o endpoint no componente
      if (action === 'activate' && createWebhookEndpoint.value) {
        if (!calendarId) {
          console.error('No active calendar selected');
          return;
        }

        if (!authToken.value) {
          emit('trigger-event', { name: 'fetch-error', event: { message: 'Token de autenticação não fornecido' } });
          return;
        }

        try {
          isRenewingToken.value = true;
          
          const response = await fetch(createWebhookEndpoint.value, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken.value}`
            },
            body: JSON.stringify({
              calendarId
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(`Erro na API (${response.status}): ${errText}`);
          }

          const result = await response.json();

          if (result.success) {
            // Emite evento extra de sucesso se a chamada interna funcionou
             emit('trigger-event', { 
               name: 'webhook-toggle', 
               event: { 
                 action: 'activated_success', 
                 result 
               } 
             });
          } else {
            throw new Error(result.error || 'Erro desconhecido ao criar webhook');
          }

        } catch (error) {
          console.error('Erro ao ativar webhook internamente:', error);
          emit('trigger-event', { name: 'fetch-error', event: { message: error.message } });
        } finally {
          isRenewingToken.value = false;
        }
      } else if (action === 'activate') {
        // Se entrou aqui, é porque não tem endpoint configurado, então confiamos 100% no Workflow e logamos info
        console.log('Webhook toggle clicked. Event emitted. Create Webhook Endpoint not configured, relying on Workflow.');
      }
    };

    const goToCalendarTab = () => {
      if (isEditing.value) return;
      activeTab.value = 'calendar';
    };

    const getWebhookStatusLabel = (status) => {
      const statusMap = {
        'active': '✓ Ativo',
        'inactive': 'Inativo',
        'error': '⚠ Erro'
      };
      return statusMap[status] || 'Desconhecido';
    };

    const getWebhookStatusTextStyle = (status) => {
      const colors = {
        'active': props.content?.successColor || '#38A169',
        'inactive': props.content?.textMutedColor || '#718096',
        'error': props.content?.errorColor || '#E53E3E'
      };
      return {
        color: colors[status] || colors.inactive,
        fontWeight: '600'
      };
    };

    const handleClose = () => {
      if (isEditing.value) return;

      emit('trigger-event', {
        name: 'close',
        event: {}
      });
    };

    const reset = () => {
      step.value = 'select-period';
      timeMin.value = null;
      timeMax.value = null;
      events.value = [];
      selectedEventIds.value = [];
      searchQuery.value = '';
      filterEventType.value = 'all';
      errorMessage.value = '';
      successCount.value = 0;
      currentPage.value = 1;
    };

    const goToStep = (targetStep) => {
      if (isEditing.value) return;

      const validSteps = ['select-period', 'select-events', 'success', 'error'];
      if (validSteps.includes(targetStep)) {
        step.value = targetStep;
      }
    };

    // Reset na página quando filtros mudam
    watch([searchQuery, filterEventType], () => {
      currentPage.value = 1;
    });

    // Atualizar step quando autenticação ou calendário mudar
    watch([isAuthenticated, hasActiveCalendar], ([authenticated, hasCalendar]) => {
      if (isEditing.value) return;

      // Não autenticado → tela de auth
      if (!authenticated && step.value !== 'not-authenticated') {
        step.value = 'not-authenticated';
        return;
      }

      // Autenticado mas sem calendário → tela de seleção de calendário
      if (authenticated && !hasCalendar && step.value === 'not-authenticated') {
        step.value = 'select-calendar';
        return;
      }

      // Autenticado com calendário → tela de seleção de período
      if (authenticated && hasCalendar && (step.value === 'not-authenticated' || step.value === 'select-calendar')) {
        step.value = 'select-period';
      }
    }, { immediate: true });

    return {
      // Estado
      step,
      activeTab,
      timeMin,
      timeMax,
      events,
      selectedEventIds,
      searchQuery,
      filterEventType,
      errorMessage,
      successCount,
      currentPage,
      isEditing,

      // Sistema de Abas
      tabs,
      handleTabChange,

      // Computed
      importedGoogleIds,
      userCalendars,
      userTokens,
      hasActiveCalendar,
      activeCalendar,
      filteredEvents,
      paginatedEvents,
      totalPages,
      allFilteredSelected,
      someFilteredSelected,
      canFetch,
      availableEventTypes,
      groupedEvents,
      paginatedGroupedEvents,
      totalPagesGrouped,

      // Autenticação
      authUrl,
      isAuthenticated,

      // Textos - Auth
      titleAuth,
      descriptionAuth,
      buttonAuth,
      labelAuthenticating,

      // Textos - Abas
      tabLabelAuth,
      tabLabelCalendar,
      tabLabelImport,

      // Textos - Calendário
      titleSelectCalendar,
      descriptionSelectCalendar,
      labelFetchCalendars,
      labelNoCalendars,
      labelLoadingCalendars,
      buttonContinueCalendar,
      buttonConfirmCalendar,

      // Textos - Webhook
      labelWebhookTitle,
      buttonWebhookPause,
      buttonWebhookActivate,
      buttonWebhookRetry,
      webhookStatus,

      // Textos - Status de Conexão (Nova UX)
      labelConnectionTitle,
      labelConnectionDescription,
      labelConnectionProgressComplete,
      labelConnectionProgressIncomplete,
      labelRequirement1Title,
      labelRequirement1Description,
      labelRequirement2Title,
      labelRequirement2Description,
      labelSelectCalendarButton,
      labelConnectionComplete,
      isWebhookActive,
      isFullyConnected,
      connectionProgressText,
      connectionProgressCount,
      connectionProgressStyle,
      connectionProgressBadgeStyle,
      connectionCompleteStyle,
      requirementTitleStyle,
      requirementDetailsStyle,
      getRequirementItemStyle,
      getRequirementNumberStyle,
      connectionProgressBadgeStyleV2,
      selectCalendarButtonStyleV2,

      // Textos - Importação
      titleStep1,
      titleStep3,
      titleSuccess,
      labelDateFrom,
      labelDateTo,
      labelSearch,
      labelSelectAll,
      labelFilterType,
      buttonFetch,
      buttonImport,
      buttonClose,
      buttonBack,
      buttonTryAgain,
      labelLoading,
      labelImporting,
      labelNoEvents,
      labelEventsFound,
      labelEventsImported,
      quickPeriod30,
      quickPeriod90,
      quickPeriod180,

      // Estilos
      containerStyle,
      titleStyle,
      textStyle,
      mutedTextStyle,
      surfaceStyle,
      successColor,
      primaryButtonStyle,
      secondaryButtonStyle,
      spinnerStyle,
      successIconStyle,
      errorIconStyle,
      errorTextStyle,
      eventsListStyle,
      inputStyles,
      checkboxStyles,
      eventItemStyles,
      badgeColors,
      paginationStyles,
      tabStyles,
      authPromptStyles,
      calendarSelectorStyles,
      statusItemStyle,
      statusDetailsStyle,
      getStatusIconStyle,

      // Métodos
      handleAuthInitiated,
      handleCalendarPreselected,
      handleCalendarSelected,
      handleFetchCalendars,
      handleContinueFromCalendar,
      handleWebhookToggle,
      goToCalendarTab,
      getWebhookStatusLabel,
      getWebhookStatusTextStyle,
      renewToken,
      fetchEvents,
      importEvents,
      toggleEventSelection,
      toggleGroupSelection,
      toggleAllFiltered,
      goBack,
      formatExpiryDate,
      handleClose,
      reset,
      goToStep
    };
  }
};
</script>

<style scoped lang="scss">
.import-google-calendar {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;

  * {
    box-sizing: border-box;
  }
}

.step-content {
  display: flex;
  flex-direction: column;
  gap: inherit;
}

.step-centered {
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
}

.step-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.step-title {
  line-height: 1.3;
}

.events-count {
  white-space: nowrap;
}

.events-list {
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 8px;
}

.no-results {
  padding: 24px;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 20px;
  text-align: center;

  .empty-icon {
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
}

.actions-split {
  justify-content: space-between;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  text-decoration: none;
  outline: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 12px;
}

.success-icon,
.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;

  svg {
    width: 32px;
    height: 32px;
  }
}

.success-message,
.error-message {
  margin: 8px 0 16px;
}

// ===== Estilos das Abas =====
.tab-content {
  width: 100%;
}

// Connection Clean - Tailwind Style
.connection-clean {
  .alert-main {
    display: flex;
    align-items: flex-start;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    gap: 12px;

    &.alert-success {
      background-color: #F0FDF4; /* Green-50 */
      border: 1px solid #BBF7D0; /* Green-200 */

      .alert-icon {
        color: #15803D; /* Green-700 */
      }

      .alert-title {
        color: #14532D; /* Green-900 */
      }

      .alert-desc {
        color: #166534; /* Green-800 */
      }
    }

    &.alert-warning {
      background-color: #FEF3C7;
      border: 1px solid #FCD34D;

      .alert-icon {
        color: #D97706;
      }

      .alert-title {
        color: #92400E;
      }

      .alert-desc {
        color: #B45309;
      }
    }
  }

  .alert-icon {
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .alert-content {
    flex: 1;
    min-width: 0;
  }

  .alert-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 2px 0;
    line-height: 1.4;
  }

  .alert-desc {
    font-size: 13px;
    margin: 0;
    line-height: 1.4;
  }
}

.checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 32px;
}

.checklist-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 14px;
  background: white;
  border: 1.5px solid #E5E7EB;
  border-radius: 6px;
  gap: 10px;
  transition: all 0.2s ease;

  &.checklist-success {
    border-color: #E5E7EB;
    background: #FFFFFF;

    .checklist-marker {
      background: #ECFDF5;
      color: #10B981;
    }

    .checklist-label {
      color: #1F2937;
    }

    .checklist-value {
      color: #047857;
    }
  }

  &.checklist-pending {
    .checklist-marker {
      background: #F3F4F6;
      color: #9CA3AF;
    }

    .checklist-label {
      color: #6B7280;
    }
  }
}

.checklist-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 16px;
    height: 16px;
  }
}

.checklist-body {
  flex: 1;
  min-width: 0;
}

.checklist-label {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.checklist-value {
  font-size: 13px;
  margin: 0;
  font-weight: 500;
}


.checklist-desc {
  font-size: 12px;
  color: #6B7280;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.checklist-action {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #2563EB;
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-top: 2px;
  font-family: inherit;
  transition: all 0.2s ease;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    color: #1D4ED8;
    gap: 6px;
  }

  &.action-warning {
    color: #D97706;  /* Amber-600 */
    
    &:hover {
      color: #B45309; /* Amber-700 */
    }
  }
}

.checklist-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checklist-row-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  gap: 12px;
  flex-wrap: wrap;
}

// Connection Status V2 (Design Bonito - Manter)
.connection-status-v2 {
  padding: 0;

  .connection-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
    gap: 16px;
  }

  .connection-title {
    margin: 0 0 4px 0;
  }

  .connection-description {
    margin: 0;
    font-size: 14px;
  }

  .progress-badge-v2 {
    flex-shrink: 0;
  }
}

.requirements-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.req-card {
  background: var(--surface-color, #F7FAFC);
  border: 2px solid var(--border-color, #E2E8F0);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;

  &.req-card-complete {
    border-color: var(--success-color, #38A169);
    background: rgba(56, 161, 105, 0.02);
  }

  &.req-card-pending {
    border-color: var(--border-color, #E2E8F0);
    opacity: 0.85;
  }
}

.req-card-header {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.req-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s ease;

  &.req-icon-complete {
    background-color: var(--success-color, #38A169);
    color: white;

    svg {
      width: 22px;
      height: 22px;
    }
  }

  &.req-icon-pending {
    background-color: var(--border-color, #E2E8F0);
    color: var(--text-muted, #718096);
  }

  .req-number-badge {
    font-size: 20px;
    font-weight: 700;
  }
}

.req-info {
  flex: 1;
  min-width: 0;
}

.req-number {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted, #718096);
  margin-bottom: 4px;
}

.req-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-color, #1A202C);
  line-height: 1.3;
}

.req-body {
  .req-desc {
    font-size: 13px;
    margin: 0 0 12px 0;
    line-height: 1.5;
  }
}

.req-detail-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 0, 0, 0.04);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-color, #1A202C);
  font-weight: 500;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    opacity: 0.7;
  }

  span {
    word-break: break-word;
  }
}

.btn-select-v2 {
  font-family: inherit;
  margin-top: 4px;

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

.success-banner-v2 {
  background: linear-gradient(135deg, rgba(56, 161, 105, 0.1) 0%, rgba(56, 161, 105, 0.05) 100%);
  border: 2px solid var(--success-color, #38A169);
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--success-color, #38A169);
  font-weight: 600;
  font-size: 14px;

  .success-icon-v2 {
    width: 32px;
    height: 32px;
    background: var(--success-color, #38A169);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    svg {
      width: 20px;
      height: 20px;
      color: white;
    }
  }
}

// Connection Status (Antigo - manter)
.connection-status {
  padding: 20px 0;

  .step-title {
    margin-bottom: 8px;
  }
}

.connection-progress {
  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}

.requirements-list {
  margin-top: 0;
}

.requirement-item {
  .requirement-content {
    flex: 1;
    min-width: 0;
  }

  .requirement-title {
    line-height: 1.4;
  }

  .requirement-description {
    margin: 0;
    font-size: 14px;
  }

  .requirement-details {
    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;

      svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        stroke: currentColor;
      }

      span {
        word-break: break-word;
      }
    }
  }
}

.requirement-number {
  svg {
    width: 20px;
    height: 20px;
  }
}

.connection-complete {
  svg {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
  }
}

// Estilos antigos (manter para compatibilidade)
.status-item {
  box-sizing: border-box;

  .status-item-header {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .status-item-icon {
    svg {
      width: 20px;
      height: 20px;
    }
  }

  .status-item-content {
    flex: 1;
    min-width: 0;
  }

  .status-item-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-color);
    margin: 0 0 4px 0;
  }

  .status-item-status {
    font-size: 14px;
    margin: 0;
  }

  .status-item-details {
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      font-size: 14px;

      span:first-child {
        flex-shrink: 0;
      }

      span:last-child {
        text-align: right;
        word-break: break-word;
      }
    }
  }

  .status-item-action {
    display: flex;
    justify-content: flex-start;
  }
}

// Mantém estilo antigo para compatibilidade
.auth-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;

  .status-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: rgba(56, 161, 105, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .step-title {
    margin-bottom: 8px;
  }

  .token-info {
    width: 100%;
    max-width: 400px;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
  }
}

// ===== Responsividade =====
@media (max-width: 768px) {
  .import-google-calendar {
    padding: 16px !important;
  }

  .step-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .actions {
    flex-direction: column-reverse;
    width: 100%;

    .btn {
      width: 100%;
    }
  }

  .auth-status {
    padding: 24px 16px;
  }

  .connection-status {
    padding: 16px 0;
  }

  .connection-clean {
    .alert-main {
      padding: 14px;

      .alert-icon svg {
        width: 18px;
        height: 18px;
      }

      .alert-title {
        font-size: 13px;
      }

      .alert-desc {
        font-size: 12px;
      }
    }

    .checklist {
      margin-left: 24px;
    }

    .checklist-item {
      padding: 10px 12px;
    }

    .checklist-label {
      font-size: 13px;
    }

    .checklist-value {
      font-size: 12px;
    }

    .checklist-action {
      font-size: 12px;
    }
  }

  .connection-status-v2 {
    .connection-header {
      flex-direction: column;
      gap: 12px;
    }

    .requirements-grid {
      grid-template-columns: 1fr;
      gap: 12px;
    }

    .req-card {
      padding: 16px;
    }

    .req-icon {
      width: 40px;
      height: 40px;

      &.req-icon-complete svg {
        width: 20px;
        height: 20px;
      }

      .req-number-badge {
        font-size: 18px;
      }
    }

    .req-title {
      font-size: 15px;
    }

    .success-banner-v2 {
      font-size: 13px;
      padding: 14px 16px;
    }
  }

  .connection-progress {
    padding: 12px !important;
  }

  .requirement-item {
    padding: 16px !important;
    gap: 12px !important;
  }

  .requirement-number {
    width: 36px !important;
    height: 36px !important;
    font-size: 16px !important;

    svg {
      width: 18px !important;
      height: 18px !important;
    }
  }

  .requirement-title {
    font-size: 15px !important;
  }

  .requirement-description {
    font-size: 13px !important;
  }

  .connection-complete {
    font-size: 13px !important;
    padding: 12px !important;
  }

  .status-item {
    padding: 16px !important;

    .status-item-header {
      gap: 12px;
    }

    .status-item-icon {
      width: 36px !important;
      height: 36px !important;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .status-item-title {
      font-size: 15px !important;
    }

    .status-item-status {
      font-size: 13px !important;
    }

    .status-item-details {
      .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;

        span:last-child {
          text-align: left;
        }
      }
    }
  }
}

@media (max-width: 480px) {
  .import-google-calendar {
    padding: 12px !important;
    font-size: 13px !important;
  }

  .step-title {
    font-size: 18px !important;
  }

  .auth-status {
    .status-icon {
      width: 48px;
      height: 48px;

      svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .connection-status {
    padding: 12px 0;
  }

  .connection-progress {
    padding: 10px !important;

    .progress-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  }

  .requirement-item {
    padding: 14px !important;
    gap: 10px !important;
  }

  .requirement-number {
    width: 32px !important;
    height: 32px !important;
    font-size: 14px !important;

    svg {
      width: 16px !important;
      height: 16px !important;
    }
  }

  .requirement-title {
    font-size: 14px !important;
  }

  .requirement-description {
    font-size: 12px !important;
  }

  .connection-complete {
    font-size: 12px !important;
    padding: 10px !important;
    flex-direction: column;
    text-align: center;

    svg {
      width: 20px !important;
      height: 20px !important;
    }
  }

  .status-item {
    padding: 14px !important;

    .status-item-icon {
      width: 32px !important;
      height: 32px !important;

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .status-item-title {
      font-size: 14px !important;
    }

    .status-item-status {
      font-size: 12px !important;
    }

    .status-item-details {
      font-size: 12px !important;
    }
  }
}
</style>
