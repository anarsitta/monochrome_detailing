<script setup>
import AppIcon from './AppIcon.vue'
import data from '../data'
import { useTrackContact } from '../composables/useTrackContact'

const c = data.contacts
const trackContact = useTrackContact()
</script>

<template>
  <div class="socials">
    <a :href="c.telegram" target="_blank" rel="noopener" aria-label="Telegram" @click="trackContact('telegram')"><AppIcon name="tg" /></a>
    <a :href="c.whatsapp" target="_blank" rel="noopener" aria-label="WhatsApp" @click="trackContact('whatsapp')"><AppIcon name="wa" /></a>
    <a :href="c.vk" target="_blank" rel="noopener" aria-label="ВКонтакте" @click="trackContact('vk')"><AppIcon name="vk" /></a>
  </div>
</template>

<style scoped>
.socials { display: flex; gap: 8px; }
.socials a {
  width: 46px; height: 46px; display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid currentColor; border-radius: 50%; opacity: .8;
  transition: background-color .35s var(--ease), color .35s var(--ease), border-color .35s var(--ease), opacity .35s, transform .35s var(--ease);
}
.socials a:hover { background: var(--accent); border-color: var(--accent); color: var(--on-accent); opacity: 1; transform: translateY(-3px); }
</style>
