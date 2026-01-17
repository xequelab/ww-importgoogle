<template>
  <div class="period-selector">
    <div class="date-inputs">
      <div class="input-group">
        <label :style="labelStyle">{{ labelFrom }}</label>
        <input
          type="date"
          :value="formatDateForInput(timeMin)"
          :style="inputStyle"
          @input="$emit('update:time-min', $event.target.value)"
        />
      </div>

      <div class="input-group">
        <label :style="labelStyle">{{ labelTo }}</label>
        <input
          type="date"
          :value="formatDateForInput(timeMax)"
          :style="inputStyle"
          @input="$emit('update:time-max', $event.target.value)"
        />
      </div>
    </div>

    <div class="quick-periods">
      <button
        v-for="period in quickPeriods"
        :key="period.days"
        class="quick-period-btn"
        :class="{ active: isActivePeriod(period.days) }"
        :style="quickPeriodStyle(period.days)"
        @click="selectQuickPeriod(period.days)"
      >
        {{ period.label }}
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'PeriodSelector',
  props: {
    timeMin: {
      type: [String, Date],
      default: null
    },
    timeMax: {
      type: [String, Date],
      default: null
    },
    labelFrom: {
      type: String,
      default: 'De'
    },
    labelTo: {
      type: String,
      default: 'Até'
    },
    quickPeriod30: {
      type: String,
      default: 'Próximos 30 dias'
    },
    quickPeriod90: {
      type: String,
      default: 'Próximos 3 meses'
    },
    quickPeriod180: {
      type: String,
      default: 'Próximos 6 meses'
    },
    styles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:time-min', 'update:time-max'],
  setup(props, { emit }) {
    const quickPeriods = computed(() => [
      { days: 30, label: props.quickPeriod30 },
      { days: 90, label: props.quickPeriod90 },
      { days: 180, label: props.quickPeriod180 }
    ]);

    const labelStyle = computed(() => ({
      fontSize: props.styles.fontSize || '14px',
      color: props.styles.color || '#1A202C',
      fontWeight: '500',
      marginBottom: '6px'
    }));

    const inputStyle = computed(() => ({
      padding: props.styles.padding || '10px 14px',
      fontSize: props.styles.fontSize || '14px',
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      backgroundColor: props.styles.backgroundColor || '#FFFFFF',
      color: props.styles.color || '#1A202C',
      width: '100%',
      outline: 'none',
      transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
    }));

    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      return d.toISOString().split('T')[0];
    };

    const selectQuickPeriod = (days) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const endDate = new Date(today);
      endDate.setDate(endDate.getDate() + days);

      emit('update:time-min', formatDateForInput(today));
      emit('update:time-max', formatDateForInput(endDate));
    };

    const isActivePeriod = (days) => {
      if (!props.timeMin || !props.timeMax) return false;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const expectedEnd = new Date(today);
      expectedEnd.setDate(expectedEnd.getDate() + days);

      const currentMin = new Date(props.timeMin);
      const currentMax = new Date(props.timeMax);

      currentMin.setHours(0, 0, 0, 0);
      currentMax.setHours(0, 0, 0, 0);

      return (
        currentMin.getTime() === today.getTime() &&
        currentMax.getTime() === expectedEnd.getTime()
      );
    };

    const quickPeriodStyle = (days) => {
      const isActive = isActivePeriod(days);

      return {
        padding: '8px 16px',
        fontSize: props.styles.fontSize || '14px',
        borderRadius: '8px',
        border: `1px solid ${isActive ? props.styles.primaryColor || '#081B4E' : props.styles.borderColor || '#E2E8F0'}`,
        backgroundColor: isActive ? props.styles.primaryColor || '#081B4E' : 'transparent',
        color: isActive ? '#FFFFFF' : props.styles.color || '#1A202C',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        fontWeight: '500'
      };
    };

    return {
      quickPeriods,
      labelStyle,
      inputStyle,
      formatDateForInput,
      selectQuickPeriod,
      isActivePeriod,
      quickPeriodStyle
    };
  }
};
</script>

<style scoped lang="scss">
.period-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.date-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.input-group {
  display: flex;
  flex-direction: column;

  label {
    display: block;
  }

  input {
    &:focus {
      border-color: var(--primary-color, #081B4E);
      box-shadow: 0 0 0 3px rgba(8, 27, 78, 0.1);
    }

    &::-webkit-calendar-picker-indicator {
      cursor: pointer;
      opacity: 0.6;
      transition: opacity 0.15s ease;

      &:hover {
        opacity: 1;
      }
    }
  }
}

.quick-periods {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-period-btn {
  &:hover:not(.active) {
    background-color: var(--surface-color, #F7FAFC);
  }

  &:active {
    transform: scale(0.98);
  }
}
</style>
