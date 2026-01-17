<template>
  <div class="event-group">
    <!-- Header do grupo -->
    <div class="group-header" @click="toggleExpanded">
      <div class="group-checkbox" @click.stop="toggleAll">
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate.prop="someSelected && !allSelected"
          @change="toggleAll"
        />
        <div class="checkbox-custom" :class="{ checked: allSelected, indeterminate: someSelected && !allSelected }">
          <svg v-if="allSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else-if="someSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </div>
      </div>

      <div class="group-content">
        <div class="group-title-row">
          <span class="group-title">{{ groupTitle }}</span>
          <span class="group-count">({{ events.length }} ocorrências)</span>
          <span v-if="eventType && eventType !== 'default'" class="event-badge" :style="badgeStyle">
            {{ eventTypeLabel }}
          </span>
        </div>
        <div class="group-dates">
          {{ dateRange }}
        </div>
      </div>

      <div class="expand-icon" :class="{ expanded: isExpanded }">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <!-- Lista de eventos individuais (expandida) -->
    <div v-if="isExpanded" class="group-events">
      <div
        v-for="event in events"
        :key="event.google_event_id"
        class="group-event-item"
        @click="$emit('toggle', event.google_event_id)"
      >
        <div class="event-checkbox" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.includes(event.google_event_id)"
            @change="$emit('toggle', event.google_event_id)"
          />
          <div class="checkbox-custom" :class="{ checked: selectedIds.includes(event.google_event_id) }">
            <svg v-if="selectedIds.includes(event.google_event_id)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>

        <div class="event-info">
          <span class="event-date">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ formatDate(event.data_inicio) }}
          </span>
          <span v-if="event.duracao_real_minutos" class="event-duration">
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
      badgeStyle
    };
  }
};
</script>

<style scoped lang="scss">
.event-group {
  border-radius: 8px;
  border: 1px solid #E2E8F0;
  overflow: hidden;
  background-color: #FFFFFF;
}

.group-header {
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #F7FAFC;
  }
}

.group-checkbox {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkbox-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid #E2E8F0;
    border-radius: 4px;
    background-color: #FFFFFF;
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
      background-color: #081B4E;
      border-color: #081B4E;

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
  font-size: 14px;
  font-weight: 500;
  color: #1A202C;
  line-height: 1.3;
}

.group-count {
  font-size: 12px;
  color: #718096;
  margin-left: 8px;
}

.group-dates {
  font-size: 12px;
  color: #718096;
  margin-top: 2px;
}

.expand-icon {
  width: 20px;
  height: 20px;
  color: #718096;
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
  background-color: #F7FAFC;
}

.group-event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px 8px 48px;
  border-top: 1px solid #E2E8F0;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #EDF2F7;
  }
}

.event-checkbox {
  position: relative;
  flex-shrink: 0;
  width: 20px;
  height: 20px;

  input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }

  .checkbox-custom {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border: 2px solid #E2E8F0;
    border-radius: 4px;
    background-color: #FFFFFF;
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
      background-color: #081B4E;
      border-color: #081B4E;

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
  font-size: 12px;
  color: #718096;
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
