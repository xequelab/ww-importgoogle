<template>
  <div class="pagination" :style="containerStyle">
    <button
      class="pagination-btn"
      :style="buttonStyle(false)"
      :disabled="currentPage <= 1"
      @click="$emit('update:current-page', currentPage - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <div class="pagination-info" :style="infoStyle">
      <span class="current-page">{{ currentPage }}</span>
      <span class="separator">/</span>
      <span class="total-pages">{{ totalPages }}</span>
    </div>

    <button
      class="pagination-btn"
      :style="buttonStyle(false)"
      :disabled="currentPage >= totalPages"
      @click="$emit('update:current-page', currentPage + 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'Pagination',
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    styles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:current-page'],
  setup(props) {
    const containerStyle = computed(() => ({
      gap: '8px'
    }));

    const buttonStyle = (isActive) => ({
      width: props.styles.buttonSize || '36px',
      height: props.styles.buttonSize || '36px',
      borderRadius: '8px',
      border: `1px solid ${props.styles.borderColor || '#E2E8F0'}`,
      backgroundColor: isActive ? props.styles.primaryColor || '#081B4E' : 'transparent',
      color: isActive ? '#FFFFFF' : props.styles.textColor || '#1A202C'
    });

    const infoStyle = computed(() => ({
      fontSize: props.styles.fontSize || '14px',
      color: props.styles.textColor || '#1A202C'
    }));

    return {
      containerStyle,
      buttonStyle,
      infoStyle
    };
  }
};
</script>

<style scoped lang="scss">
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 16px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;

  svg {
    width: 18px;
    height: 18px;
  }

  &:not(:disabled):hover {
    background-color: var(--surface-color, #F7FAFC);
    border-color: var(--primary-color, #081B4E);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &:not(:disabled):active {
    transform: scale(0.95);
  }
}

.pagination-info {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  font-weight: 500;

  .current-page {
    font-weight: 600;
  }

  .separator {
    opacity: 0.5;
  }

  .total-pages {
    opacity: 0.7;
  }
}
</style>
