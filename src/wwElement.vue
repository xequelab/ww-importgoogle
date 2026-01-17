<template>
  <div class="import-google-calendar" :style="containerStyle">
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
</template>

<script>
import { ref, computed, watch } from 'vue';
import PeriodSelector from './components/PeriodSelector.vue';
import EventFilters from './components/EventFilters.vue';
import EventItem from './components/EventItem.vue';
import EventGroup from './components/EventGroup.vue';
import Pagination from './components/Pagination.vue';

export default {
  name: 'ImportGoogleCalendar',
  components: {
    PeriodSelector,
    EventFilters,
    EventItem,
    EventGroup,
    Pagination
  },
  props: {
    existingAppointments: {
      type: Array,
      default: () => []
    },
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
    // ===== IDs de eventos já importados =====
    const importedGoogleIds = computed(() => {
      if (!Array.isArray(props.existingAppointments)) return new Set();
      const ids = props.existingAppointments
        .map(item => item?.google_event_id)
        .filter(Boolean);
      return new Set(ids);
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
    const step = ref('select-period');
    const timeMin = ref(null);
    const timeMax = ref(null);
    const events = ref([]);
    const selectedEventIds = ref([]);
    const searchQuery = ref('');
    const filterEventType = ref('all');
    const errorMessage = ref('');
    const successCount = ref(0);
    const currentPage = ref(1);

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
    const calendarId = computed(() => props.content?.calendarId || 'primary');
    const fetchEventsEndpoint = computed(() => props.content?.fetchEventsEndpoint || '');
    const importEventsEndpoint = computed(() => props.content?.importEventsEndpoint || '');
    const authToken = computed(() => props.content?.authToken || '');
    const eventsPerPage = computed(() => props.content?.eventsPerPage || 20);
    const preselectBirthdays = computed(() => props.content?.preselectBirthdays !== false);

    // Textos
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

    return {
      // Estado
      step,
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

      // Computed
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

      // Textos
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

      // Métodos
      fetchEvents,
      importEvents,
      toggleEventSelection,
      toggleGroupSelection,
      toggleAllFiltered,
      goBack,
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
</style>
