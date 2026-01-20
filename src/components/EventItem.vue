<template>
  <div
    class="event-item"
    :class="{ selected, imported: isImported }"
    :style="itemStyle"
    @click="isImported ? null : $emit('toggle')"
  >
    <div v-if="isImported" class="event-imported-badge" :style="importedBadgeStyle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>Importado</span>
    </div>
    <div v-else class="event-checkbox" :style="checkboxContainerStyle">
      <input
        type="checkbox"
        :checked="selected"
        :style="checkboxInputStyle"
        @click.stop
        @change="$emit('toggle')"
      />
      <div class="checkbox-custom" :class="{ checked: selected }" :style="checkboxCustomStyle">
        <svg v-if="selected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
    </div>

    <div class="event-content">
      <div class="event-header">
        <span class="event-title" :style="titleStyle">{{ event.titulo || 'Sem título' }}</span>
        <span v-if="event.event_type && event.event_type !== 'default'" class="event-badge" :style="badgeStyle">
          {{ eventTypeLabel }}
        </span>
      </div>

      <div class="event-details" :style="detailsStyle">
        <span class="event-datetime">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ formattedDateTime }}
        </span>

        <span v-if="event.duracao_real_minutos" class="event-duration">
          ({{ formattedDuration }})
        </span>

        <span v-if="event.nome_cliente" class="event-client">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          {{ event.nome_cliente }}
        </span>
      </div>

      <div class="event-meta" :style="detailsStyle">
        <span v-if="event.link_meet" class="event-meet">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          Google Meet
        </span>

        <span v-if="event.location" class="event-location">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          {{ event.location }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EventItem',
  props: {
    event: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    isImported: {
      type: Boolean,
      default: false
    },
    styles: {
      type: Object,
      default: () => ({})
    },
    checkboxStyles: {
      type: Object,
      default: () => ({})
    },
    badgeColors: {
      type: Object,
      default: () => ({})
    },
    timeZone: {
      type: String,
      default: 'America/Sao_Paulo'
    }
  },
  emits: ['toggle'],
  setup(props) {
    const eventTypeLabels = {
      default: 'Padrão',
      birthday: 'Aniversário',
      focusTime: 'Foco',
      outOfOffice: 'Ausente',
      workingLocation: 'Local',
      fromGmail: 'Gmail'
    };

    const eventTypeLabel = computed(() => {
      return eventTypeLabels[props.event.event_type] || props.event.event_type;
    });

    const formattedDateTime = computed(() => {
      if (!props.event.data_inicio) return '';

      const date = new Date(props.event.data_inicio);
      const options = {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: props.timeZone || 'America/Sao_Paulo'
      };

      return date.toLocaleDateString('pt-BR', options).replace(',', ' às');
    });

    const formattedDuration = computed(() => {
      const minutes = props.event.duracao_real_minutos;
      if (!minutes) return '';

      if (minutes < 60) {
        return `${minutes}min`;
      }

      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;

      if (remainingMinutes === 0) {
        return `${hours}h`;
      }

      return `${hours}h${remainingMinutes}min`;
    });

    const itemStyle = computed(() => ({
      padding: props.styles.padding || '12px 16px',
      borderRadius: props.styles.borderRadius || '8px',
      '--hover-color': props.styles.hoverColor || '#EDF2F7',
      '--border-color': props.styles.borderColor || '#E2E8F0'
    }));

    const titleStyle = computed(() => ({
      color: props.styles.textColor || '#1A202C',
      fontSize: props.styles.fontSize || '14px'
    }));

    const detailsStyle = computed(() => ({
      color: props.styles.mutedColor || '#718096',
      fontSize: props.styles.smallFontSize || '12px'
    }));

    const badgeStyle = computed(() => {
      const type = props.event.event_type || 'default';
      const color = props.badgeColors[type] || props.badgeColors.default || '#4299E1';

      return {
        backgroundColor: `${color}20`,
        color: color,
        fontSize: props.styles.smallFontSize || '12px'
      };
    });

    const checkboxContainerStyle = computed(() => ({
      width: props.checkboxStyles.size || '20px',
      height: props.checkboxStyles.size || '20px'
    }));

    const checkboxInputStyle = computed(() => ({
      width: props.checkboxStyles.size || '20px',
      height: props.checkboxStyles.size || '20px'
    }));

    const checkboxCustomStyle = computed(() => ({
      width: props.checkboxStyles.size || '20px',
      height: props.checkboxStyles.size || '20px',
      '--primary-color': props.checkboxStyles.primaryColor || '#081B4E',
      '--border-color': props.checkboxStyles.borderColor || '#E2E8F0',
      '--bg-color': props.checkboxStyles.backgroundColor || '#FFFFFF'
    }));

    const importedBadgeStyle = computed(() => ({
      color: '#38A169',
      fontSize: props.styles.smallFontSize || '12px'
    }));

    return {
      eventTypeLabel,
      formattedDateTime,
      formattedDuration,
      itemStyle,
      titleStyle,
      detailsStyle,
      badgeStyle,
      checkboxContainerStyle,
      checkboxInputStyle,
      checkboxCustomStyle,
      importedBadgeStyle
    };
  }
};
</script>

<style scoped lang="scss">
.event-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, opacity 0.15s ease;
  border: 1px solid transparent;

  &:hover {
    background-color: var(--hover-color);
  }

  &.selected {
    border-color: var(--border-color);
    background-color: var(--hover-color);
  }

  &.imported {
    opacity: 0.6;
    cursor: not-allowed;
    background-color: #F7FAFC;

    &:hover {
      background-color: #F7FAFC;
    }
  }
}

.event-imported-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #E6FFFA;
  border: 1px solid #38A169;
  border-radius: 6px;
  font-weight: 500;
  flex-shrink: 0;
  margin-top: 2px;

  svg {
    width: 16px;
    height: 16px;
  }
}

.event-checkbox {
  position: relative;
  flex-shrink: 0;
  margin-top: 2px;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkbox-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border-color);
    border-radius: 4px;
    background-color: var(--bg-color);
    transition: all 0.15s ease;

    svg {
      width: 12px;
      height: 12px;
      color: white;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.15s ease;
    }

    &.checked {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      svg {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}

.event-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.event-title {
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
}

.event-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.event-details,
.event-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  line-height: 1.4;
}

.event-datetime,
.event-duration,
.event-client,
.event-meet,
.event-location {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.event-duration {
  opacity: 0.8;
}

.event-meet {
  color: #4285f4;
}
</style>
