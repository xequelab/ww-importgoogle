<template>
  <div class="event-group" :style="groupStyle" data-component="EventGroup" style="border: 3px solid blue !important; min-height: 50px !important; background: lightblue !important;">
    <!-- Header do grupo (clicável para expandir/colapsar) -->
    <div class="group-header" :style="headerStyle" style="border: 2px solid green !important; padding: 10px !important;">
      <div class="group-checkbox" :style="checkboxContainerStyle" @click.stop="() => {}">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate="someSelected && !allSelected"
          @change="toggleAll"
        />
        <div
          class="checkbox-custom"
          :class="{ checked: allSelected, indeterminate: someSelected && !allSelected }"
          :style="checkboxCustomStyle"
          @click="toggleAll"
        >
          <svg v-if="allSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="someSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>

      <div class="group-content" @click="toggleExpanded">
        <div class="group-title-row">
          <span class="group-title" :style="titleStyle">{{ groupTitle }}</span>
          <span class="group-count" :style="countStyle">({{ events.length }} ocorrências)</span>
          <span v-if="eventType && eventType !== 'default'" class="event-badge" :style="badgeStyle">
            {{ eventTypeLabel }}
          </span>
        </div>
        <div class="group-dates" :style="datesStyle">
          {{ dateRange }}
        </div>
      </div>

      <div class="expand-icon" :class="{ expanded: isExpanded }" @click="toggleExpanded">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <!-- Debug isExpanded -->
    <div style="background: orange; padding: 5px; font-size: 11px;">
      DEBUG: isExpanded = {{ isExpanded }}, events.length = {{ events.length }}
    </div>

    <!-- Lista de eventos individuais (expandida) -->
    <div v-if="isExpanded" class="group-events" style="background: pink !important; border: 2px solid purple !important; min-height: 100px !important;">
      <div style="background: lime; padding: 5px; font-size: 10px;">
        DEBUG: Dentro do v-if. Renderizando {{ events.length }} eventos
      </div>
      <div
        v-for="event in events"
        :key="event.google_event_id"
        class="group-event-item"
        :style="eventItemStyle"
        @click="$emit('toggle', event.google_event_id)"
        style="background: white !important; border: 1px solid black !important; margin: 2px !important; padding: 5px !important;"
      >
        <div class="event-checkbox" :style="checkboxContainerStyle" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.includes(event.google_event_id)"
            @change="$emit('toggle', event.google_event_id)"
          />
          <div
            class="checkbox-custom"
            :class="{ checked: selectedIds.includes(event.google_event_id) }"
            :style="checkboxCustomStyle"
            @click="$emit('toggle', event.google_event_id)"
          >
            <svg v-if="selectedIds.includes(event.google_event_id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <div class="event-info">
          <span class="event-date" :style="datesStyle">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ formatDate(event.data_inicio) }}
          </span>
          <span v-if="event.duracao_real_minutos" class="event-duration" :style="datesStyle">
            ({{ formatDuration(event.duracao_real_minutos) }})
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'EventGroup',
  props: {
    groupTitle: {
      type: String,
      required: true
    },
    events: {
      type: Array,
      required: true
    },
    selectedIds: {
      type: Array,
      default: () => []
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
    }
  },
  emits: ['toggle', 'toggle-group'],
  setup(props, { emit }) {
    console.log('[EventGroup] Montando componente');
    console.log('[EventGroup] Props recebidas:', props);
    console.log('[EventGroup] groupTitle:', props.groupTitle);
    console.log('[EventGroup] events:', props.events);
    console.log('[EventGroup] events.length:', props.events?.length);

    const isExpanded = ref(false);

    const eventTypeLabels = {
      default: 'Padrão',
      birthday: 'Aniversário',
      focusTime: 'Foco',
      outOfOffice: 'Ausente',
      workingLocation: 'Local',
      fromGmail: 'Gmail'
    };

    const eventType = computed(() => props.events[0]?.event_type || 'default');
    const eventTypeLabel = computed(() => eventTypeLabels[eventType.value] || eventType.value);

    const allSelected = computed(() => {
      return props.events.every(e => props.selectedIds.includes(e.google_event_id));
    });

    const someSelected = computed(() => {
      const count = props.events.filter(e => props.selectedIds.includes(e.google_event_id)).length;
      return count > 0 && count < props.events.length;
    });

    const dateRange = computed(() => {
      if (props.events.length === 0) return '';

      const dates = props.events
        .map(e => new Date(e.data_inicio))
        .sort((a, b) => a - b);

      const first = dates[0];
      const last = dates[dates.length - 1];

      const formatShort = (date) => {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      };

      if (first.getTime() === last.getTime()) {
        return formatShort(first);
      }

      return `${formatShort(first)} - ${formatShort(last)}`;
    });

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
      console.log('[EventGroup] toggleExpanded chamado. isExpanded agora é:', isExpanded.value);
    };

    const toggleAll = () => {
      const eventIds = props.events.map(e => e.google_event_id);
      emit('toggle-group', { ids: eventIds, select: !allSelected.value });
    };

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(',', ' às');
    };

    const formatDuration = (minutes) => {
      if (minutes < 60) return `${minutes}min`;
      const hours = Math.floor(minutes / 60);
      const remaining = minutes % 60;
      if (remaining === 0) return `${hours}h`;
      return `${hours}h${remaining}min`;
    };

    // Estilos
    const groupStyle = computed(() => ({
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      overflow: 'hidden'
    }));

    const headerStyle = computed(() => ({
      padding: props.styles.padding || '12px 16px',
      backgroundColor: someSelected.value || allSelected.value
        ? props.styles.hoverColor || '#EDF2F7'
        : 'transparent',
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    }));

    const titleStyle = computed(() => ({
      color: props.styles.textColor || '#1A202C',
      fontSize: props.styles.fontSize || '14px',
      fontWeight: '500'
    }));

    const countStyle = computed(() => ({
      color: props.styles.mutedColor || '#718096',
      fontSize: props.styles.smallFontSize || '12px',
      marginLeft: '8px'
    }));

    const datesStyle = computed(() => ({
      color: props.styles.mutedColor || '#718096',
      fontSize: props.styles.smallFontSize || '12px'
    }));

    const badgeStyle = computed(() => {
      const color = props.badgeColors[eventType.value] || props.badgeColors.default || '#4299E1';
      return {
        backgroundColor: `${color}20`,
        color: color,
        fontSize: props.styles.smallFontSize || '12px',
        padding: '2px 8px',
        borderRadius: '12px',
        marginLeft: '8px'
      };
    });

    const checkboxContainerStyle = computed(() => ({
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

    const eventItemStyle = computed(() => ({
      padding: '8px 16px 8px 48px',
      borderTop: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      cursor: 'pointer',
      transition: 'background-color 0.15s ease'
    }));

    return {
      isExpanded,
      eventType,
      eventTypeLabel,
      allSelected,
      someSelected,
      dateRange,
      toggleExpanded,
      toggleAll,
      formatDate,
      formatDuration,
      groupStyle,
      headerStyle,
      titleStyle,
      countStyle,
      datesStyle,
      badgeStyle,
      checkboxContainerStyle,
      checkboxCustomStyle,
      eventItemStyle
    };
  }
};
</script>

<style scoped lang="scss">
.event-group {
  background-color: var(--background-color, #FFFFFF);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background-color: var(--surface-color, #F7FAFC) !important;
  }
}

.group-checkbox {
  position: relative;
  flex-shrink: 0;

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
    cursor: pointer;

    svg {
      width: 12px;
      height: 12px;
      color: white;
      opacity: 0;
      transform: scale(0.5);
      transition: all 0.15s ease;
    }

    &.checked,
    &.indeterminate {
      background-color: var(--primary-color);
      border-color: var(--primary-color);

      svg {
        opacity: 1;
        transform: scale(1);
      }
    }
  }
}

.group-content {
  flex: 1;
  min-width: 0;
}

.group-title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.group-title {
  line-height: 1.3;
}

.group-dates {
  margin-top: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.expand-icon {
  width: 20px;
  height: 20px;
  color: var(--text-muted-color, #718096);
  transition: transform 0.2s ease;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }

  &.expanded {
    transform: rotate(180deg);
  }
}

.group-events {
  background-color: var(--surface-color, #F7FAFC);
}

.group-event-item {
  display: flex;
  align-items: center;
  gap: 12px;

  &:hover {
    background-color: var(--event-item-hover, #EDF2F7);
  }
}

.event-checkbox {
  position: relative;
  flex-shrink: 0;

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
    cursor: pointer;

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

.event-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.event-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.icon {
  width: 14px;
  height: 14px;
}

.event-duration {
  opacity: 0.8;
}
</style>
