<template>
  <div class="event-group-wrapper">
    <!-- Header -->
    <div class="event-group-header">
      <!-- Checkbox do grupo -->
      <label class="checkbox-label" @click.stop>
        <input
          type="checkbox"
          :checked="allSelected"
          :indeterminate.prop="someSelected"
          @change="onGroupCheckboxChange"
        />
      </label>

      <!-- Área clicável para expandir -->
      <div class="group-info-area" @click="isExpanded = !isExpanded">
        <div class="group-text">
          <strong>{{ groupTitle }}</strong>
          <span class="group-meta">({{ events.length }} ocorrências) • {{ dateRange }}</span>
        </div>

        <svg
          class="expand-icon"
          :class="{ expanded: isExpanded }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <!-- Lista de eventos expandida -->
    <div v-if="isExpanded" class="event-list">
      <div
        v-for="event in events"
        :key="event.google_event_id"
        class="event-item"
      >
        <!-- Checkbox do evento -->
        <label class="checkbox-label" @click.stop>
          <input
            type="checkbox"
            :checked="selectedIds.includes(event.google_event_id)"
            @change="onEventCheckboxChange(event.google_event_id)"
          />
        </label>

        <!-- Info do evento (clicável) -->
        <div class="event-details" @click="toggleEvent(event.google_event_id)">
          <span class="event-time">{{ formatDate(event.data_inicio) }}</span>
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
    groupTitle: { type: String, required: true },
    events: { type: Array, required: true },
    selectedIds: { type: Array, default: () => [] }
  },
  emits: ['toggle', 'toggle-group'],
  setup(props, { emit }) {
    const isExpanded = ref(false);

    const allSelected = computed(() => {
      if (props.events.length === 0) return false;
      return props.events.every(e => props.selectedIds.includes(e.google_event_id));
    });

    const someSelected = computed(() => {
      const selected = props.events.filter(e => props.selectedIds.includes(e.google_event_id));
      return selected.length > 0 && selected.length < props.events.length;
    });

    const dateRange = computed(() => {
      if (props.events.length === 0) return '';
      const dates = props.events.map(e => new Date(e.data_inicio)).sort((a, b) => a - b);
      const first = dates[0];
      const last = dates[dates.length - 1];
      const fmt = (d) => d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      return first.getTime() === last.getTime() ? fmt(first) : `${fmt(first)} - ${fmt(last)}`;
    });

    const onGroupCheckboxChange = (e) => {
      const shouldSelect = e.target.checked;
      const eventIds = props.events.map(ev => ev.google_event_id);
      emit('toggle-group', { ids: eventIds, select: shouldSelect });
    };

    const onEventCheckboxChange = (eventId) => {
      emit('toggle', eventId);
    };

    const toggleEvent = (eventId) => {
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
      const mins = minutes % 60;
      return mins === 0 ? `${hours}h` : `${hours}h${mins}min`;
    };

    return {
      isExpanded,
      allSelected,
      someSelected,
      dateRange,
      onGroupCheckboxChange,
      onEventCheckboxChange,
      toggleEvent,
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
  background: white;
  margin-bottom: 8px;
}

.event-group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  margin: 0;
}

.group-info-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  user-select: none;
  min-width: 0;
}

.group-info-area:hover {
  opacity: 0.7;
}

.group-text {
  flex: 1;
  min-width: 0;
}

.group-text strong {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1A202C;
  margin-bottom: 2px;
}

.group-meta {
  display: block;
  font-size: 12px;
  color: #718096;
}

.expand-icon {
  width: 20px;
  height: 20px;
  color: #718096;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.event-list {
  border-top: 1px solid #E2E8F0;
  background: #F7FAFC;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px 10px 48px;
  border-bottom: 1px solid #E2E8F0;
}

.event-item:last-child {
  border-bottom: none;
}

.event-item:hover {
  background: #EDF2F7;
}

.event-details {
  flex: 1;
  font-size: 13px;
  color: #4A5568;
  cursor: pointer;
}

.event-time {
  font-weight: 500;
}

.event-duration {
  color: #718096;
  margin-left: 6px;
}
</style>
