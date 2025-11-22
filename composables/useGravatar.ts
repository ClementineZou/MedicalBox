import { ref, computed } from 'vue'

export function useGravatar(email: Ref<string | undefined> | string | undefined, size: number = 200) {
  const gravatarUrl = ref('')
  const loading = ref(false)
  const emailValue = typeof email === 'string' ? ref(email) : email

  const loadGravatar = async () => {
    if (!emailValue?.value) {
      gravatarUrl.value = `https://www.gravatar.com/avatar/?s=${size}&d=identicon`
      return
    }

    loading.value = true
    try {
      const response = await $fetch('/api/user/gravatar', {
        method: 'POST',
        body: { 
          email: emailValue.value, 
          size,
          defaultImage: 'identicon' // Use identicon to see if email is recognized
        }
      })
      gravatarUrl.value = (response as any).url
      console.log('Gravatar loaded for:', emailValue.value, 'URL:', gravatarUrl.value)
    } catch (error) {
      console.error('Failed to load Gravatar:', error)
      gravatarUrl.value = `https://www.gravatar.com/avatar/?s=${size}&d=identicon`
    } finally {
      loading.value = false
    }
  }

  // Watch for email changes
  watch(() => emailValue?.value, () => {
    loadGravatar()
  }, { immediate: true })

  return {
    gravatarUrl,
    loading,
    reload: loadGravatar
  }
}
