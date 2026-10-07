<script setup>
defineProps({ name: { type: String, required: true } })

const icons = {
  arrow: '<svg class="i-arrow" width="20" height="12" viewBox="0 0 20 12" aria-hidden="true"><path d="M0 6h18M13 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  arrowLeft: '<svg width="36" height="14" viewBox="0 0 36 14" aria-hidden="true"><path d="M36 7H2M8 1 2 7l6 6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  arrowRight: '<svg width="36" height="14" viewBox="0 0 36 14" aria-hidden="true"><path d="M0 7h34M28 1l6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  close: '<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><path d="M2 2l18 18M20 2 2 20" stroke="currentColor" stroke-width="1.5"/></svg>',
  plus: '<svg class="i-plus" width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 1v16M1 9h16" stroke="currentColor" stroke-width="1.4"/></svg>',
  tg: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.9 4.3 18.7 19.4c-.2 1-.9 1.3-1.7.8l-4.8-3.5-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6.5 13.2 1.7 11.7c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z"/></svg>',
  wa: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>',
  vk: '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.8 17.5c-5.5 0-8.6-3.8-8.8-10h2.8c.1 4.6 2.1 6.5 3.7 6.9V7.5h2.6v4c1.6-.2 3.3-2 3.8-4h2.6a7.7 7.7 0 0 1-3.5 5 7.9 7.9 0 0 1 4.1 5h-2.9a5 5 0 0 0-4.1-3.6v3.6h-.3z"/></svg>',
}
</script>

<template>
  <span class="ico" aria-hidden="true" v-html="icons[name]" />
</template>
