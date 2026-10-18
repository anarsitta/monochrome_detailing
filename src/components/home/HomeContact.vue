<script setup>
import { ref } from 'vue'
import LeadForm from '../LeadForm.vue'
import data from '../../data'
import { useReveal } from '../../composables/useReveal'
import { useTrackContact } from '../../composables/useTrackContact'

// Единый блок записи для всех страниц: слева шаги, справа форма
defineProps({
  title: { type: String, default: 'Запишитесь на осмотр' },
  service: { type: String, default: 'home' },
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: '' },
  formTitle: { type: String, default: 'Оставить заявку' },
  lead: { type: String, default: 'Перезвоним, ответим на вопросы и подберём время осмотра.' },
  submit: { type: String, default: 'Отправить заявку' },
  image: { type: String, default: 'hero-home.webp' },
})

const c = data.contacts
const root = ref(null)
const trackContact = useTrackContact()
useReveal(root)

const steps = [
  ['Оставьте заявку', 'Имя и телефон, остальное по желанию.'],
  ['Мы перезвоним', 'Уточним задачу и подберём удобное время.'],
  ['Приезжайте на осмотр', 'Покажем покрытие и назовём точную цену.'],
]
</script>

<template>
  <section id="contacts" ref="root" class="section contact" aria-labelledby="contact-title">
    <div class="container grid">
      <div class="side dark" data-anim="fade">
        <img class="side-img" :src="`/img/${image}`" :srcset="`/img/${image.replace('.webp', '-800.webp')} 800w, /img/${image} 1600w`" sizes="(max-width: 767px) 100vw, 60vw" alt="" loading="lazy" decoding="async">
        <div class="side-shade" aria-hidden="true" />
        <div class="side-body">
          <p class="kicker">Запись</p>
          <h2 id="contact-title" class="h2">{{ title }}</h2>
          <ol class="steps">
            <li v-for="([t, d], i) in steps" :key="t">
              <span class="num">{{ i + 1 }}</span>
              <span><b>{{ t }}</b>{{ d }}</span>
            </li>
          </ol>
          <p class="call">Удобнее голосом? <a :href="c.phoneHref" @click="trackContact('phone')">{{ c.phone }}</a></p>
        </div>
      </div>

      <div data-anim="fade">
        <LeadForm
          :service="service"
          :options="options"
          :option-label="optionLabel"
          light
          :title="formTitle"
          :lead="lead"
          :submit="submit"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 5fr 7fr; gap: 20px; align-items: stretch; }
.side { position: relative; overflow: hidden; border-radius: 20px; min-height: 100%; }
.side-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 50%; }
.side-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(23,23,23,.55) 0%, rgba(23,23,23,.75) 45%, rgba(23,23,23,.94) 100%); }
.side-body { position: relative; z-index: 1; display: flex; flex-direction: column; height: 100%; padding: clamp(28px, 4vw, 52px); }
.steps { margin-top: auto; padding-top: 48px; }
.steps li { display: grid; grid-template-columns: 40px 1fr; gap: 16px; align-items: start; padding: 16px 0; border-top: 1px solid var(--line-dark); }
.num { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 500; background: var(--accent); color: var(--on-accent); }
.steps b { display: block; font-family: var(--display); font-weight: 500; font-size: 19px; }
.steps span:last-child { color: var(--text-dark); font-size: 15px; }
.call { margin-top: 20px; color: var(--text-dark); font-size: 15px; }
.call a { color: var(--milk); font-weight: 500; text-decoration: underline; text-underline-offset: 3px; }
@media (max-width: 1023px) {
  .grid { grid-template-columns: 1fr; }
  .side { min-height: 460px; }
}
</style>
