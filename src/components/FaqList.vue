<script setup>
import { ref, onMounted } from 'vue'
import AppIcon from './AppIcon.vue'
import data from '../data'
import { track } from '../composables/analytics'
import { useReveal } from '../composables/useReveal'
import { useTrackContact } from '../composables/useTrackContact'

const props = defineProps({
  items: { type: Array, required: true },
  prefix: { type: String, required: true },
  title: { type: String, default: 'Частые вопросы' },
})

const root = ref(null)
const open = ref(0)
const trackContact = useTrackContact()
useReveal(root)

function toggle(i) {
  open.value = open.value === i ? -1 : i
  if (open.value === i) track('service_faq_open', { service: props.prefix, faq_id: `${props.prefix}-${i + 1}` })
}

// Переход по якорю #film-faq-3 раскрывает нужный ответ
onMounted(() => {
  const m = location.hash.match(new RegExp(`^#${props.prefix}-faq-(\\d+)$`))
  if (m) open.value = Number(m[1]) - 1
})
</script>

<template>
  <section id="faq" ref="root" class="section faq white" aria-labelledby="faq-title">
    <div class="container">
      <div class="head">
        <div>
          <p class="kicker">Вопросы и ответы</p>
          <h2 id="faq-title" class="h2" data-anim="fade">{{ title }}</h2>
        </div>
        <div class="ask" data-anim="fade">
          <p>Не нашли свой вопрос? Напишите — ответим и при необходимости попросим пару фото автомобиля.</p>
          <a class="btn btn-primary" :href="data.contacts.telegram" target="_blank" rel="noopener" @click="trackContact('telegram')">Задать вопрос <AppIcon name="tg" /></a>
        </div>
      </div>

      <div class="list" data-anim="stagger">
        <div v-for="([q, a], i) in items" :id="`${prefix}-faq-${i + 1}`" :key="i" class="item" :class="{ open: open === i }">
          <h3>
            <button
              :id="`${prefix}-faq-q-${i + 1}`"
              type="button"
              class="q"
              :aria-expanded="String(open === i)"
              :aria-controls="`${prefix}-faq-a-${i + 1}`"
              @click="toggle(i)"
            >
              <span class="q-text">{{ q }}</span>
              <span class="icon" aria-hidden="true" />
            </button>
          </h3>
          <div :id="`${prefix}-faq-a-${i + 1}`" class="a" role="region" :aria-labelledby="`${prefix}-faq-q-${i + 1}`">
            <div><p>{{ a }}</p></div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head { display: grid; grid-template-columns: 7fr 5fr; gap: 24px 64px; align-items: end; margin-bottom: clamp(28px, 3vw, 48px); }
.ask { display: flex; flex-direction: column; align-items: flex-start; gap: 18px; }
.ask p { font-size: 17px; color: var(--grey); max-width: 44ch; }
.list { border-top: 1px solid var(--line-strong); }
.item { border-bottom: 1px solid var(--line-strong); }
.item h3 { font: inherit; }
.q { display: flex; justify-content: space-between; align-items: center; gap: 24px; width: 100%; min-height: 76px; padding: 22px 0; text-align: left; }
.q-text { font-family: var(--display); font-weight: 500; font-size: clamp(19px, 1.6vw, 24px); line-height: 1.3; transition: color .3s; }
.q:hover .q-text { color: var(--accent-dark); }
.icon { position: relative; width: 44px; height: 44px; flex: none; border-radius: 50%; border: 1px solid var(--line-strong); transition: background-color .3s var(--ease), border-color .3s var(--ease), transform .45s var(--ease); }
.icon::before, .icon::after { content: ''; position: absolute; left: 50%; top: 50%; width: 14px; height: 1.5px; background: var(--ink); translate: -50% -50%; transition: background-color .3s; }
.icon::after { rotate: 90deg; }
.open .icon { background: var(--accent); border-color: var(--accent); transform: rotate(135deg); }
.open .icon::before, .open .icon::after { background: #fff; }
.a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .45s var(--ease); }
.a > div { overflow: hidden; }
.open .a { grid-template-rows: 1fr; }
.a p { padding: 0 72px 26px 0; font-size: 17px; line-height: 1.65; color: #3E3B39; max-width: 72ch; }
@media (max-width: 1023px) { .head { grid-template-columns: 1fr; } }
@media (max-width: 767px) {
  .q { min-height: 64px; padding: 18px 0; gap: 16px; }
  .q-text { font-size: 18px; }
  .icon { width: 38px; height: 38px; }
  .a p { padding-right: 0; font-size: 16px; }
  .ask .btn { width: 100%; }
}
</style>
