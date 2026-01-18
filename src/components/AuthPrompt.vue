<template>
  <div class="auth-prompt" :style="containerStyle">
    <div class="auth-icon" :style="iconStyle">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"></path>
      </svg>
    </div>

    <h2 class="auth-title" :style="titleStyle">{{ title }}</h2>
    <p class="auth-description" :style="descriptionStyle">{{ description }}</p>

    <button
      class="auth-button"
      :style="buttonStyle"
      @click="handleAuth"
      :disabled="!authUrl || isAuthenticating"
    >
      <svg v-if="!isAuthenticating" class="google-icon" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span v-if="isAuthenticating">{{ authenticatingText }}</span>
      <span v-else>{{ buttonText }}</span>
    </button>

    <p v-if="!authUrl" class="auth-warning" :style="warningStyle">
      ⚠️ URL de autenticação não configurada
    </p>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'AuthPrompt',
  props: {
    authUrl: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Conectar Google Calendar'
    },
    description: {
      type: String,
      default: 'Para importar eventos e criar sincronização automática, conecte sua conta do Google Calendar.'
    },
    buttonText: {
      type: String,
      default: 'Conectar com Google'
    },
    authenticatingText: {
      type: String,
      default: 'Autenticando...'
    },
    styles: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['auth-initiated'],
  setup(props, { emit }) {
    const isAuthenticating = ref(false);

    const handleAuth = () => {
      if (!props.authUrl || isAuthenticating.value) return;

      isAuthenticating.value = true;
      emit('auth-initiated');

      // Abre URL de autenticação em nova aba
      window.open(props.authUrl, '_blank');
      // window.location.href = props.authUrl;
      
      // Reseta estado de autenticação após breve delay (já que é nova aba)
      setTimeout(() => {
        isAuthenticating.value = false;
      }, 3000);
    };

    const containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '20px',
      padding: props.styles.containerPadding || '48px 24px',
      textAlign: 'center',
      minHeight: '300px'
    };

    const iconStyle = {
      width: '80px',
      height: '80px',
      backgroundColor: `${props.styles.primaryColor || '#081B4E'}15`,
      color: props.styles.primaryColor || '#081B4E',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    };

    const titleStyle = {
      fontSize: props.styles.titleFontSize || '24px',
      fontWeight: '600',
      color: props.styles.textColor || '#1A202C',
      margin: '0'
    };

    const descriptionStyle = {
      fontSize: props.styles.baseFontSize || '14px',
      color: props.styles.textMutedColor || '#718096',
      lineHeight: '1.6',
      maxWidth: '500px',
      margin: '0'
    };

    const buttonStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: props.styles.primaryColor || '#081B4E',
      color: '#FFFFFF',
      padding: props.styles.buttonPadding || '14px 32px',
      fontSize: props.styles.buttonFontSize || '16px',
      fontWeight: props.styles.buttonFontWeight || '600',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      marginTop: '8px'
    };

    const warningStyle = {
      fontSize: props.styles.smallFontSize || '12px',
      color: props.styles.errorColor || '#E53E3E',
      margin: '0'
    };

    return {
      isAuthenticating,
      handleAuth,
      containerStyle,
      iconStyle,
      titleStyle,
      descriptionStyle,
      buttonStyle,
      warningStyle
    };
  }
};
</script>

<style scoped>
.auth-prompt {
  box-sizing: border-box;
}

.auth-icon svg {
  width: 100%;
  height: 100%;
}

.google-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.auth-button:not(:disabled):hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.auth-button:not(:disabled):active {
  transform: translateY(0);
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
