<template>
  <div class="w-full">
    <div 
      ref="turnstileContainer" 
      class="cf-turnstile"
    ></div>
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  siteKey: string;
}>();

const emit = defineEmits<{
  (e: 'verified', token: string): void;
  (e: 'error', error: string): void;
  (e: 'expired'): void;
}>();

const turnstileContainer = ref<HTMLElement | null>(null);
const error = ref('');
const widgetId = ref<string | null>(null);

// 加载 Turnstile 脚本
const loadTurnstileScript = () => {
  return new Promise<void>((resolve, reject) => {
    if ((window as any).turnstile) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Turnstile script'));
    document.head.appendChild(script);
  });
};

// 渲染 Turnstile widget
const renderTurnstile = async () => {
  if (!turnstileContainer.value) return;

  try {
    await loadTurnstileScript();

    const turnstile = (window as any).turnstile;
    if (!turnstile) {
      throw new Error('Turnstile not available');
    }

    widgetId.value = turnstile.render(turnstileContainer.value, {
      sitekey: props.siteKey,
      callback: (token: string) => {
        error.value = '';
        emit('verified', token);
      },
      'error-callback': () => {
        error.value = '验证失败，请重试';
        emit('error', '验证失败');
      },
      'expired-callback': () => {
        error.value = '验证已过期，请重新验证';
        emit('expired');
      },
      theme: 'light',
      size: 'flexible', // 使用 flexible 尺寸以适应容器宽度
    });
  } catch (e: any) {
    error.value = '加载验证码失败';
    emit('error', e.message || '加载验证码失败');
  }
};

// 重置 widget
const reset = () => {
  if (widgetId.value !== null && (window as any).turnstile) {
    (window as any).turnstile.reset(widgetId.value);
    error.value = '';
  }
};

// 获取响应 token
const getResponse = (): string | null => {
  if (widgetId.value !== null && (window as any).turnstile) {
    return (window as any).turnstile.getResponse(widgetId.value);
  }
  return null;
};

// 暴露方法给父组件
defineExpose({
  reset,
  getResponse,
});

onMounted(() => {
  renderTurnstile();
});

onUnmounted(() => {
  if (widgetId.value !== null && (window as any).turnstile) {
    (window as any).turnstile.remove(widgetId.value);
  }
});
</script>

<style scoped>
.cf-turnstile {
  width: 100%;
  display: block;
}

/* 强制设置 Turnstile 容器宽度 */
.cf-turnstile :deep(> div) {
  width: 100% !important;
  min-width: 100% !important;
}

/* 强制设置 iframe 宽度 */
.cf-turnstile :deep(iframe) {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}
</style>
