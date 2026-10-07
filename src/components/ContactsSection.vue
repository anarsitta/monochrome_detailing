<script setup>
import AppIcon from './AppIcon.vue'
import { selection } from '../composables/selection'

// Полоска-переход к единой форме записи на главной
const props = defineProps({
  title: { type: String, default: 'Получить расчёт и записаться на осмотр' },
  text: { type: String, default: 'Форма записи — на главной странице, выбранный вариант подставится автоматически.' },
  service: { type: String, default: '' },
})
function toForm() { if (props.service && !selection.homeDir) selection.homeDir = props.service }
</script>

<template>
  <section id="contacts" class="strip" aria-label="Запись на осмотр">
    <div class="container">
      <RouterLink class="bar" :to="{ path: '/', hash: '#contacts' }" @click="toForm">
        <span class="copy">
          <span class="title">{{ title }}</span>
          <span class="text">{{ text }}</span>
        </span>
        <span class="go"><AppIcon name="arrow" /></span>
      </RouterLink>
    </div>
  </section>
</template>

<style scoped>
.strip { padding: clamp(40px, 5vw, 72px) 0; }
.bar { display: flex; align-items: center; justify-content: space-between; gap: 24px; padding: 22px 28px; border-radius: 16px; background: var(--white); border: 1px solid var(--line); transition: border-color .3s var(--ease), background-color .3s var(--ease); }
.bar:hover { border-color: var(--accent); }
.copy { display: flex; flex-direction: column; gap: 2px; }
.title { font-family: var(--display); font-weight: 500; font-size: clamp(19px, 1.6vw, 24px); }
.text { font-size: 14px; color: var(--grey); }
.go { width: 52px; height: 52px; flex: none; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--accent); color: #fff; transition: transform .4s var(--ease); }
.bar:hover .go { transform: translateX(6px); }
</style>
