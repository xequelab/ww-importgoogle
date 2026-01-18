<template>
  <div class="calendar-selector" :style="containerStyle">
    <div class="selector-header">
      <div class="header-icon" :style="iconStyle">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
      <div>
        <h2 class="selector-title" :style="titleStyle">{{ title }}</h2>
        <p class="selector-description" :style="descriptionStyle">{{ description }}</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner" :style="spinnerStyle"></div>
      <p :style="mutedTextStyle">{{ loadingText }}</p>
    </div>

    <!-- Lista de calendários -->
    <div v-else-if="calendars.length > 0" class="calendars-list">
      <div
        v-for="calendar in calendars"
        :key="calendar.id"
        class="calendar-item"
        :class="{ 'is-active': isCalendarActive(calendar) }"
        @click="handleCalendarClick(calendar)"
      >
        <div class="calendar-radio">
          <input
            type="radio"
            :checked="isCalendarActive(calendar)"
            :disabled="isChanging"
            tabindex="-1"
          />
        </div>

        <div class="calendar-info">
          <div class="calendar-name">
            {{ calendar.summary_override || calendar.calendar_summary }}
            <span v-if="calendar.is_primary" class="primary-badge">Principal</span>
          </div>
          <div class="calendar-meta" :style="mutedTextStyle">
            {{ calendar.calendar_id }}
          </div>
        </div>

        <div v-if="isCalendarSynced(calendar)" class="sync-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Sincronizado</span>
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else class="empty-state">
      <p :style="mutedTextStyle">{{ emptyText }}</p>
      <button
        class="btn btn-secondary"
        :style="secondaryButtonStyle"
        @click="handleFetchCalendars"
        :disabled="isLoading"
      >
        {{ fetchButtonText }}
      </button>
    </div>

    <!-- Seção de Webhook (Layout Horizontal) -->
    <div v-if="hasActiveCalendar && normalizedWebhook" class="webhook-section-horizontal" :style="webhookSectionStyle">
      <div class="webhook-left">
        <div class="webhook-icon-small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </div>
        <div class="webhook-info">
          <span class="webhook-title-small">{{ webhookSectionTitle }}</span>
          <span class="webhook-status-badge" :style="getWebhookStatusStyle()">
            {{ getWebhookStatusText() }}
          </span>
        </div>
      </div>

      <div class="webhook-right">
        <button
          class="btn-small"
          :style="getWebhookButtonStyle()"
          @click="handleWebhookToggle"
        >
          {{ getWebhookButtonText() }}
        </button>
      </div>
    </div>

    <!-- Ações -->
    <div class="actions" :style="actionsStyle">
      <button
        v-if="temporarySelectedId !== null && !calendars.find(c => c.id === temporarySelectedId)?.recebe_agendamentos"
        class="btn btn-primary"
        :style="primaryButtonStyle"
        @click="handleConfirmSelection"
        :disabled="isChanging"
      >
        {{ confirmButtonText }}
      </button>
      <button
        v-else-if="hasActiveCalendar"
        class="btn btn-primary"
        :style="primaryButtonStyle"
        @click="handleContinue"
        :disabled="isChanging"
      >
        {{ continueButtonText }}
      </button>
      <button
        v-else
        class="btn btn-secondary"
        :style="secondaryButtonStyle"
        @click="handleFetchCalendars"
        :disabled="isLoading"
      >
        {{ fetchButtonText }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';

export default {
  name: 'CalendarSelector',
  props: {
    calendars: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: 'Selecionar Calendário'
    },
    description: {
      type: String,
      default: 'Escolha qual calendário do Google deseja sincronizar com seus agendamentos.'
    },
    loadingText: {
      type: String,
      default: 'Buscando calendários...'
    },
    emptyText: {
      type: String,
      default: 'Nenhum calendário encontrado. Clique no botão abaixo para buscar seus calendários do Google.'
    },
    fetchButtonText: {
      type: String,
      default: 'Buscar Calendários'
    },
    continueButtonText: {
      type: String,
      default: 'Continuar'
    },
    confirmButtonText: {
      type: String,
      default: 'Confirmar Seleção'
    },
    webhookStatus: {
      type: Object,
      default: () => null
      // { status: 'active'|'inactive'|'error', url: '', lastSync: '', message: '' }
    },
    webhookSectionTitle: {
      type: String,
      default: 'Sincronização Automática'
    },
    webhookButtonActive: {
      type: String,
      default: 'Pausar Sincronização'
    },
    webhookButtonInactive: {
      type: String,
      default: 'Ativar Sincronização'
    },
    webhookButtonRetry: {
      type: String,
      default: 'Reativar Webhook'
    },
    styles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['calendar-selected', 'calendar-preselected', 'fetch-calendars', 'continue', 'webhook-toggle'],
  setup(props, { emit }) {
    const isLoading = ref(false);
    const isChanging = ref(false);
    const temporarySelectedId = ref(null);

    const hasActiveCalendar = computed(() => {
      return props.calendars.some(cal => cal.recebe_agendamentos);
    });

    const isCalendarActiveInDb = (calendar) => {
      return calendar.recebe_agendamentos === true;
    };

    const isCalendarActive = (calendar) => {
      // Se há seleção temporária, usa ela
      if (temporarySelectedId.value !== null) {
        return calendar.id === temporarySelectedId.value;
      }
      // Senão, usa o recebe_agendamentos do banco
      return isCalendarActiveInDb(calendar);
    };

    // Helper para normalizar o status (pode vir como objeto ou array)
    const normalizedWebhook = computed(() => {
      const data = props.webhookStatus;
      if (Array.isArray(data)) {
        return data.length > 0 ? data[0] : null;
      }
      return data;
    });

    // Badge "Sincronizado" só aparece para o que está REALMENTE no banco E tem webhook ativo
    const isCalendarSynced = (calendar) => {
      const wb = normalizedWebhook.value;
      if (!wb) return false;
      const status = wb.status || wb.renewal_status;
      
      return calendar.recebe_agendamentos === true && status === 'active';
    };

    const handleCalendarClick = (calendar) => {
      if (isChanging.value) return;

      // Marca como selecionado temporariamente
      temporarySelectedId.value = calendar.id;

      // Emite evento de pré-seleção (para atualizar variáveis, mas não confirmar)
      emit('calendar-preselected', calendar);
    };

    const handleConfirmSelection = () => {
      if (isChanging.value) return;
      if (temporarySelectedId.value === null) return;

      // Encontra o calendário selecionado
      const selectedCalendar = props.calendars.find(cal => cal.id === temporarySelectedId.value);
      if (!selectedCalendar) return;

      // Agora sim, emite o evento de seleção confirmada
      isChanging.value = true;
      emit('calendar-selected', selectedCalendar);
    };

    // Watch para limpar seleção temporária quando o banco atualizar
    watch(() => props.calendars, (newCalendars) => {
      // Se algum calendário agora tem recebe_agendamentos true, limpa a seleção temporária
      if (newCalendars.some(cal => cal.recebe_agendamentos === true)) {
        temporarySelectedId.value = null;
        isChanging.value = false;
      }
    }, { deep: true });

    const handleFetchCalendars = () => {
      if (isLoading.value) return;
      isLoading.value = true;
      emit('fetch-calendars');
      // Reset loading após 3 segundos (fallback)
      setTimeout(() => {
        isLoading.value = false;
      }, 3000);
    };

    const handleContinue = () => {
      if (isChanging.value) return;
      emit('continue');
    };

    const handleWebhookToggle = () => {
      emit('webhook-toggle');
    };

    const getWebhookStatusText = (status) => {
      // Se status vier undefined (ex: passando objeto inteiro sem extrair status)
      // tenta extrair do normalizedWebhook se não foi passado argumento
      if (!status && normalizedWebhook.value) {
        status = normalizedWebhook.value?.status || normalizedWebhook.value?.renewal_status;
      }

      const statusMap = {
        'active': '✓ Ativo',
        'inactive': 'Inativo',
        'error': '⚠ Erro'
      };
      return statusMap[status] || 'Desconhecido';
    };

    const getWebhookStatusStyle = (status) => {
      if (!status && normalizedWebhook.value) {
        status = normalizedWebhook.value?.status || normalizedWebhook.value?.renewal_status;
      }

      const valid = status === 'active';
      return {
        backgroundColor: valid ? '#C6F6D5' : '#FED7D7',
        color: valid ? '#22543D' : '#822727',
      };
    };

    const getWebhookButtonStyle = (status) => {
      if (!status && normalizedWebhook.value) {
        status = normalizedWebhook.value?.status || normalizedWebhook.value?.renewal_status;
      }

      const isActive = status === 'active';
      return {
        backgroundColor: isActive ? '#EDF2F7' : '#2B6CB0',
        color: isActive ? '#2D3748' : '#FFFFFF',
        border: isActive ? '1px solid #CBD5E0' : 'none'
      };
    };

    const getWebhookButtonText = (status) => {
      if (!status && normalizedWebhook.value) {
        status = normalizedWebhook.value?.status || normalizedWebhook.value?.renewal_status;
      }

      if (status === 'active') return props.webhookButtonActive;
      if (status === 'error') return props.webhookButtonRetry;
      return props.webhookButtonInactive;
    };

    const containerStyle = computed(() => ({
      padding: props.styles.containerPadding || '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: props.styles.sectionGap || '20px'
    }));

    const iconStyle = computed(() => ({
      width: '64px',
      height: '64px',
      backgroundColor: `${props.styles.primaryColor || '#081B4E'}15`,
      color: props.styles.primaryColor || '#081B4E',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }));

    const titleStyle = computed(() => ({
      fontSize: props.styles.titleFontSize || '20px',
      fontWeight: '600',
      color: props.styles.textColor || '#1A202C',
      margin: '0 0 4px 0'
    }));

    const descriptionStyle = computed(() => ({
      fontSize: props.styles.baseFontSize || '14px',
      color: props.styles.textMutedColor || '#718096',
      lineHeight: '1.5',
      margin: '0'
    }));

    const mutedTextStyle = computed(() => ({
      fontSize: props.styles.baseFontSize || '14px',
      color: props.styles.textMutedColor || '#718096'
    }));

    const spinnerStyle = computed(() => ({
      borderColor: `${props.styles.primaryColor || '#081B4E'}20`,
      borderTopColor: props.styles.primaryColor || '#081B4E'
    }));

    const primaryButtonStyle = computed(() => ({
      backgroundColor: props.styles.primaryColor || '#081B4E',
      color: '#FFFFFF',
      padding: props.styles.buttonPadding || '12px 24px',
      fontSize: props.styles.buttonFontSize || '14px',
      fontWeight: props.styles.buttonFontWeight || '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer'
    }));

    const secondaryButtonStyle = computed(() => ({
      backgroundColor: 'transparent',
      color: props.styles.primaryColor || '#081B4E',
      padding: props.styles.buttonPadding || '12px 24px',
      fontSize: props.styles.buttonFontSize || '14px',
      fontWeight: props.styles.buttonFontWeight || '600',
      borderRadius: '8px',
      border: `2px solid ${props.styles.primaryColor || '#081B4E'}`,
      cursor: 'pointer'
    }));

    const actionsStyle = computed(() => ({
      display: 'flex',
      gap: '12px',
      justifyContent: 'flex-end',
      marginTop: '8px'
    }));

    // Estilos do Webhook
    const webhookSectionStyle = computed(() => ({
      marginTop: props.styles.sectionGap || '20px',
      padding: '20px',
      backgroundColor: props.styles.surfaceColor || '#F7FAFC',
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`
    }));



    return {
      isLoading,
      isChanging,
      hasActiveCalendar,
      isCalendarActive,
      isCalendarSynced,
      temporarySelectedId,
      handleCalendarClick,
      handleConfirmSelection,
      handleFetchCalendars,
      handleContinue,
      handleWebhookToggle,
      getWebhookStatusText,
      getWebhookButtonText,
      getWebhookStatusStyle,
      getWebhookMessageStyle,
      getWebhookButtonStyle,
      containerStyle,
      iconStyle,
      titleStyle,
      descriptionStyle,
      mutedTextStyle,
      spinnerStyle,
      primaryButtonStyle,
      secondaryButtonStyle,
      actionsStyle,
      webhookSectionStyle
    };
  }
};
</script>

<style scoped>
.calendar-selector {
  box-sizing: border-box;
}

.selector-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon svg {
  width: 100%;
  height: 100%;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.calendars-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.calendar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: #F7FAFC;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.calendar-item:hover {
  background: #EDF2F7;
  border-color: #CBD5E0;
}

.calendar-item.is-active {
  background: #E6FFFA;
  border-color: #38A169;
}

.calendar-radio {
  display: flex;
  align-items: center;
}

.calendar-radio input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin: 0;
  pointer-events: none;
}

.calendar-info {
  flex: 1;
  min-width: 0;
}

.calendar-name {
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 2px;
}

.primary-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background-color: #DBEAFE;
  color: #1E40AF;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.calendar-meta {
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background-color: #38A169;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.sync-badge svg {
  width: 14px;
  height: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 40px 20px;
  text-align: center;
}

.actions {
  padding-top: 8px;
}

.btn {
  transition: all 0.2s ease;
}

.btn:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.btn:not(:disabled):active {
  transform: translateY(0);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Webhook Section */
/* Webhook Section Horizontal */
.webhook-section-horizontal {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.webhook-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.webhook-icon-small {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  color: #4A5568;
}

.webhook-icon-small svg {
  width: 18px;
  height: 18px;
}

.webhook-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.webhook-title-small {
  font-size: 14px;
  font-weight: 600;
  color: #2D3748;
}

.webhook-status-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(0,0,0,0.03);
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-small:hover {
  opacity: 0.9;
}

/* Responsividade */
@media (max-width: 768px) {
  .calendars-list {
    gap: 8px;
  }

  .calendar-item {
    padding: 12px;
  }

  .calendar-name {
    font-size: 13px;
  }

  .calendar-meta {
    font-size: 11px;
  }

  .webhook-section {
    padding: 16px;
  }

  .webhook-status .status-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .webhook-status .status-row span:last-child {
    text-align: left;
  }
}

@media (max-width: 480px) {
  .selector-header {
    gap: 12px;
  }

  .header-icon {
    width: 32px;
    height: 32px;
  }

  .calendar-item {
    padding: 10px;
    gap: 10px;
  }

  .calendar-radio input[type="radio"] {
    width: 18px;
    height: 18px;
  }

  .sync-badge {
    padding: 3px 8px;
    font-size: 11px;
  }

  .webhook-section {
    padding: 12px;
  }

  .webhook-icon {
    width: 20px;
    height: 20px;
  }

  .webhook-title {
    font-size: 14px !important;
  }

  .webhook-status .status-row {
    font-size: 13px;
  }
}
</style>
