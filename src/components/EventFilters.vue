<template>
  <div class="event-filters">
    <div class="filters-row">
      <!-- Campo de busca -->
      <div class="search-input-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          type="text"
          :value="searchQuery"
          :placeholder="labelSearch"
          :style="searchInputStyle"
          @input="$emit('update:search-query', $event.target.value)"
        />
        <button
          v-if="searchQuery"
          class="clear-search"
          :style="clearButtonStyle"
          @click="$emit('update:search-query', '')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- Filtro por tipo -->
      <div class="select-wrapper">
        <select
          :value="filterEventType"
          :style="selectStyle"
          @change="$emit('update:filter-event-type', $event.target.value)"
        >
          <option value="all">{{ labelFilterType }}: Todos</option>
          <option value="default">Padrão</option>
          <option value="birthday">Aniversário</option>
          <option value="focusTime">Tempo de foco</option>
          <option value="outOfOffice">Fora do escritório</option>
          <option value="workingLocation">Local de trabalho</option>
          <option value="fromGmail">Do Gmail</option>
        </select>
        <svg class="select-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <!-- Checkbox selecionar todos -->
    <div class="select-all-row">
      <label class="checkbox-label" :style="checkboxLabelStyle" @click="$emit('toggle-all')">
        <div class="checkbox-wrapper" :style="checkboxWrapperStyle">
          <input
            type="checkbox"
            :checked="allSelected"
            :indeterminate="someSelected && !allSelected"
            @click.stop
            @change="$emit('toggle-all')"
          />
          <div
            class="checkbox-custom"
            :class="{ checked: allSelected, indeterminate: someSelected && !allSelected }"
            :style="checkboxCustomStyle"
          >
            <svg v-if="allSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <svg v-else-if="someSelected" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
        </div>
        <span>{{ labelSelectAll }}</span>
      </label>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'EventFilters',
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    filterEventType: {
      type: String,
      default: 'all'
    },
    allSelected: {
      type: Boolean,
      default: false
    },
    someSelected: {
      type: Boolean,
      default: false
    },
    labelSearch: {
      type: String,
      default: 'Buscar por título...'
    },
    labelSelectAll: {
      type: String,
      default: 'Selecionar todos'
    },
    labelFilterType: {
      type: String,
      default: 'Tipo de evento'
    },
    styles: {
      type: Object,
      default: () => ({})
    },
    checkboxStyles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:search-query', 'update:filter-event-type', 'toggle-all'],
  setup(props) {
    const searchInputStyle = computed(() => ({
      padding: props.styles.padding || '10px 14px',
      paddingLeft: '40px',
      paddingRight: props.searchQuery ? '36px' : '14px',
      fontSize: props.styles.fontSize || '14px',
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      backgroundColor: props.styles.backgroundColor || '#FFFFFF',
      color: props.styles.color || '#1A202C'
    }));

    const selectStyle = computed(() => ({
      padding: props.styles.padding || '10px 14px',
      paddingRight: '36px',
      fontSize: props.styles.fontSize || '14px',
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      backgroundColor: props.styles.backgroundColor || '#FFFFFF',
      color: props.styles.color || '#1A202C'
    }));

    const clearButtonStyle = computed(() => ({
      color: props.styles.color || '#1A202C'
    }));

    const checkboxLabelStyle = computed(() => ({
      fontSize: props.styles.fontSize || '14px',
      color: props.styles.color || '#1A202C'
    }));

    const checkboxWrapperStyle = computed(() => ({
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

    return {
      searchInputStyle,
      selectStyle,
      clearButtonStyle,
      checkboxLabelStyle,
      checkboxWrapperStyle,
      checkboxCustomStyle
    };
  }
};
</script>

<style scoped lang="scss">
.event-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filters-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 560px) {
    flex-direction: column;
  }
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  min-width: 200px;

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: var(--text-muted-color, #718096);
    pointer-events: none;
  }

  input {
    width: 100%;
    outline: none;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      border-color: var(--primary-color, #081B4E);
      box-shadow: 0 0 0 3px rgba(8, 27, 78, 0.1);
    }

    &::placeholder {
      color: var(--text-muted-color, #718096);
    }
  }

  .clear-search {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s ease;
    padding: 0;

    svg {
      width: 16px;
      height: 16px;
    }

    &:hover {
      opacity: 1;
    }
  }
}

.select-wrapper {
  position: relative;
  min-width: 180px;

  select {
    width: 100%;
    appearance: none;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      border-color: var(--primary-color, #081B4E);
      box-shadow: 0 0 0 3px rgba(8, 27, 78, 0.1);
    }
  }

  .select-arrow {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    width: 16px;
    height: 16px;
    color: var(--text-muted-color, #718096);
    pointer-events: none;
  }
}

.select-all-row {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  font-weight: 500;

  &:hover .checkbox-custom:not(.checked):not(.indeterminate) {
    border-color: var(--primary-color, #081B4E);
  }
}

.checkbox-wrapper {
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
</style>
