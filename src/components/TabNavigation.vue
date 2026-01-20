<template>
  <div class="tab-navigation" :style="containerStyle">
    <div class="tabs-wrapper">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-button"
        :class="{ 'active': activeTab === tab.id, 'disabled': tab.disabled }"
        :style="getTabStyle(tab)"
        :disabled="tab.disabled"
        @click="handleTabClick(tab.id)"
      >
        <span class="tab-icon" v-if="tab.icon" v-html="tab.icon"></span>
        <span class="tab-label">{{ tab.label }}</span>
        <span v-if="tab.badge" class="tab-badge" :style="badgeStyle">{{ tab.badge }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'TabNavigation',
  props: {
    tabs: {
      type: Array,
      required: true,
      // [ { id: 'auth', label: 'Conexão', icon: '<svg>...</svg>', disabled: false, badge: '!' } ]
    },
    activeTab: {
      type: String,
      required: true
    },
    styles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['tab-change'],
  setup(props, { emit }) {
    const handleTabClick = (tabId) => {
      if (tabId === props.activeTab) return;

      const tab = props.tabs.find(t => t.id === tabId);
      if (tab && !tab.disabled) {
        emit('tab-change', tabId);
      }
    };

    const containerStyle = computed(() => ({
      width: '100%',
      borderBottom: `2px solid ${props.styles.borderColor || '#E2E8F0'}`,
      backgroundColor: props.styles.backgroundColor || '#FFFFFF',
      marginBottom: props.styles.sectionGap || '20px'
    }));

    const getTabStyle = (tab) => {
      const isActive = props.activeTab === tab.id;
      const isDisabled = tab.disabled;

      return {
        flex: '1',
        minWidth: '0',
        padding: '12px 16px',
        border: 'none',
        background: 'none',
        color: isDisabled
          ? (props.styles.textMutedColor || '#CBD5E0')
          : isActive
            ? (props.styles.primaryColor || '#081B4E')
            : (props.styles.textColor || '#1A202C'),
        fontFamily: props.styles.fontFamily || 'inherit',
        fontSize: props.styles.baseFontSize || '14px',
        fontWeight: isActive ? '600' : '500',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        borderBottom: isActive ? `2px solid ${props.styles.primaryColor || '#081B4E'}` : '2px solid transparent',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: isDisabled ? '0.5' : '1',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      };
    };

    const badgeStyle = computed(() => ({
      backgroundColor: props.styles.errorColor || '#E53E3E',
      color: '#FFFFFF',
      fontSize: '10px',
      fontWeight: '700',
      padding: '2px 6px',
      borderRadius: '10px',
      minWidth: '18px',
      textAlign: 'center'
    }));

    return {
      handleTabClick,
      containerStyle,
      getTabStyle,
      badgeStyle
    };
  }
};
</script>

<style scoped>
.tab-navigation {
  position: relative;
}

.tabs-wrapper {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
}

.tabs-wrapper::-webkit-scrollbar {
  height: 4px;
}

.tabs-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.tabs-wrapper::-webkit-scrollbar-thumb {
  background: #CBD5E0;
  border-radius: 2px;
}

.tab-button {
  position: relative;
  white-space: nowrap;
}

.tab-button:not(.disabled):hover {
  background-color: rgba(0, 0, 0, 0.02);
}

.tab-button.active {
  margin-bottom: -2px;
}

.tab-icon {
  display: inline-flex;
  align-items: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
  fill: currentColor;
  stroke: currentColor;
}

.tab-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tab-badge {
  flex-shrink: 0;
}

/* Mobile responsivo */
@media (max-width: 640px) {
  .tabs-wrapper {
    gap: 0;
  }

  .tab-button {
    padding: 10px 12px !important;
    font-size: 13px !important;
  }

  .tab-icon {
    width: 16px;
    height: 16px;
  }

  .tab-label {
    display: none;
  }

  .tab-button:only-child .tab-label,
  .tabs-wrapper:has(.tab-button:nth-child(-n+3)) .tab-label {
    display: inline;
  }
}

@media (max-width: 480px) {
  .tab-button {
    padding: 8px 10px !important;
    font-size: 12px !important;
    gap: 6px !important;
  }
}
</style>
