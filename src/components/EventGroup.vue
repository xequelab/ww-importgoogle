<template>
  <div class="event-group-wrapper">
    <!-- Header clicável -->
    <div class="event-group-header" @click="toggleExpanded">
      <input
        type="checkbox"
        :checked="allSelected"
        :indeterminate.prop="someSelected"
        @click.stop
        @change="handleToggleAll"
      />

      <div class="event-group-info">
        <strong>{{ groupTitle }}</strong>
        <span class="event-count">({{ events.length }} ocorrências)</span>
        <span class="event-dates">{{ dateRange }}</span>
      </div>

      <svg
        class="expand-arrow"
        :class="{ rotated: isExpanded }"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </div>

    <!-- Lista expandida -->
    <div v-show="isExpanded" class="event-group-list">
      <div
        v-for="event in events"
        :key="event.google_event_id"
        class="event-group-item"
        @click="handleToggleEvent(event.google_event_id)"
      >
        <input
          type="checkbox"
          :checked="selectedIds.includes(event.google_event_id)"
          @click.stop
          @change="handleToggleEvent(event.google_event_id)"
        />

        <div class="event-item-info">
          <span class="event-date">{{ formatDate(event.data_inicio) }}</span>
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
    groupTitle: String,
    events: Array,
    selectedIds: Array
  },
  emits: ['toggle', 'toggle-group'],
  setup(props, { emit }) {
    const isExpanded = ref(false);

    const allSelected = computed(() => {
      return props.events.every(e => props.selectedIds.includes(e.google_event_id));
    });

    const someSelected = computed(() => {
      const count = props.events.filter(e => props.selectedIds.includes(e.google_event_id)).length;
      return count > 0 && count < props.events.length;
    });

    const dateRange = computed(() => {
      if (!props.events.length) return '';

      const dates = props.events.map(e => new Date(e.data_inicio)).sort((a, b) => a - b);
      const first = dates[0];
      const last = dates[dates.length - 1];

      const format = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      return first.getTime() === last.getTime()
        ? format(first)
        : `${format(first)} - ${format(last)}`;
    });

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
    };

    const handleToggleAll = () => {
      const eventIds = props.events.map(e => e.google_event_id);
      emit('toggle-group', { ids: eventIds, select: !allSelected.value });
    };

    const handleToggleEvent = (eventId) => {
      emit('toggle', eventId);
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
      return remaining === 0 ? `${hours}h` : `${hours}h${remaining}min`;
    };

    return {
      isExpanded,
      allSelected,
      someSelected,
      dateRange,
      toggleExpanded,
      handleToggleAll,
      handleToggleEvent,
      formatDate,
      formatDuration
    };
  }
};
</script>

<style scoped>
.event-group-wrapper {
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  margin-bottom: 8px;
  background: white;
}

.event-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  user-select: none;
}

.event-group-header:hover {
  background: #F7FAFC;
}

.event-group-header input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.event-group-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.event-group-info strong {
  font-size: 14px;
  color: #1A202C;
}

.event-count {
  font-size: 12px;
  color: #718096;
  margin-left: 8px;
}

.event-dates {
  font-size: 12px;
  color: #718096;
}

.expand-arrow {
  width: 20px;
  height: 20px;
  color: #718096;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-arrow.rotated {
  transform: rotate(180deg);
}

.event-group-list {
  border-top: 1px solid #E2E8F0;
  background: #F7FAFC;
}

.event-group-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 48px;
  border-bottom: 1px solid #E2E8F0;
  cursor: pointer;
}

.event-group-item:last-child {
  border-bottom: none;
}

.event-group-item:hover {
  background: #EDF2F7;
}

.event-group-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.event-item-info {
  flex: 1;
  font-size: 13px;
  color: #4A5568;
}

.event-date {
  font-weight: 500;
}

.event-duration {
  color: #718096;
  margin-left: 8px;
}
</style>
