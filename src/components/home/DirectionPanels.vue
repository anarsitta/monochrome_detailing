<script setup>
import { ref } from 'vue'
import AppIcon from '../AppIcon.vue'
import { PAGES } from '../../composables/seo'
import { track } from '../../composables/analytics'
import { useReveal } from '../../composables/useReveal'

const root = ref(null)
const active = ref(0)
useReveal(root)

const items = [
  {
    title: 'Оклейка плёнкой',
    to: PAGES.film.path,
    goal: 'film_page',
    img: 'hero-atelier.jpg',
    w: 780, h: 650,
    tag: 'Кузов',
    text: 'Прозрачная полиуретановая плёнка закрывает лак от сколов, песка и мелких царапин. Внешне автомобиль не меняется.',
    list: ['Новый автомобиль, пока покрытие без следов', 'Фронт для трассы: бампер, капот, фары', 'Пороги, ручки, кромка багажника'],
    link: 'Подробнее об оклейке',
  },
  {
    title: 'Антикор',
    to: PAGES.antikor.path,
    goal: 'antikor_page',
    img: 'antikor-underbody.jpg',
    w: 1600, h: 1067,
    tag: 'Днище',
    text: 'Защищаем днище, арки и скрытые полости от соли и влаги. Состав работ определяем после осмотра на подъёмнике.',
    list: ['Новый автомобиль перед первой зимой', 'Покупка автомобиля с пробегом', 'Обновление старого покрытия'],
    link: 'Подробнее об антикоре',
  },
]
</script>

<template>
  <section id="services" ref="root" class="section directions" aria-labelledby="services-title">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="kicker">Направления</p>
          <h2 id="services-title" class="h2" data-anim="fade">Наши услуги</h2>
        </div>
        <p class="lead" data-anim="fade">Кузов защищает плёнка, днище — антикор. Можно начать с одного, а можно закрыть автомобиль целиком.</p>
      </div>

      <div class="panels" data-anim="stagger">
        <article
          v-for="(d, i) in items"
          :key="d.title"
          class="panel"
          :class="{ 'is-active': active === i }"
          @mouseenter="active = i"
          @focusin="active = i"
        >
          <img class="panel-img" :src="`/img/${d.img}`" :width="d.w" :height="d.h" alt="" loading="lazy" decoding="async">
          <div class="panel-shade" />
          <span class="panel-tag">{{ d.tag }}</span>
          <div class="panel-body">
            <h3 class="panel-title">{{ d.title }}</h3>
            <div class="panel-more">
              <div>
                <p>{{ d.text }}</p>
                <ul>
                  <li v-for="item in d.list" :key="item">{{ item }}</li>
                </ul>
              </div>
            </div>
            <RouterLink class="panel-link" :to="d.to" @click="track(d.goal)">
              {{ d.link }}
              <span class="panel-arrow"><AppIcon name="arrow" /></span>
            </RouterLink>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.directions { background: var(--white); }
.panels { display: flex; gap: 16px; height: clamp(560px, 72vh, 720px); }
.panel {
  position: relative; flex: 1; min-width: 0; overflow: hidden; border-radius: var(--radius-lg); color: var(--milk);
  transition: flex-grow .8s var(--ease);
}
.panel.is-active { flex-grow: 1.7; }
.panel-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform: scale(1.06); transition: transform 1.2s var(--ease), filter .8s var(--ease); filter: grayscale(.5) brightness(.85); }
.panel.is-active .panel-img { transform: scale(1); filter: grayscale(0) brightness(1); }
.panel-shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(23,23,23,.1) 0%, rgba(23,23,23,.25) 40%, rgba(23,23,23,.9) 100%); }
.panel-tag { position: absolute; top: 24px; left: 24px; padding: 6px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; background: rgba(243,240,234,.16); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(243,240,234,.25); }
.panel-body { position: absolute; left: 0; right: 0; bottom: 0; padding: clamp(24px, 3vw, 44px); }
.panel-title { font-family: var(--display); font-weight: 500; font-size: clamp(32px, 3.4vw, 52px); line-height: 1.05; letter-spacing: -.02em; }
/* Описание раскрывается у активной панели (grid-rows 0fr → 1fr) */
.panel-more { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .7s var(--ease); }
.panel-more > div { overflow: hidden; }
.panel.is-active .panel-more { grid-template-rows: 1fr; }
.panel-more p { margin-top: 16px; max-width: 46ch; color: rgba(243,240,234,.85); opacity: 0; transform: translateY(12px); transition: opacity .5s var(--ease) .15s, transform .6s var(--ease) .15s; }
.panel-more ul { margin-top: 18px; display: flex; flex-wrap: wrap; gap: 8px; }
.panel-more li { padding: 6px 14px; border-radius: 999px; font-size: 14px; border: 1px solid rgba(243,240,234,.3); opacity: 0; transform: translateY(12px); transition: opacity .5s var(--ease), transform .6s var(--ease); }
.panel.is-active .panel-more p, .panel.is-active .panel-more li { opacity: 1; transform: none; }
.panel.is-active .panel-more li:nth-child(1) { transition-delay: .25s; }
.panel.is-active .panel-more li:nth-child(2) { transition-delay: .32s; }
.panel.is-active .panel-more li:nth-child(3) { transition-delay: .39s; }
.panel-link { display: inline-flex; align-items: center; gap: 16px; margin-top: 26px; min-height: 52px; font-weight: 500; }
.panel-link::after { content: ''; position: absolute; inset: 0; }
.panel-arrow { width: 52px; height: 52px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: var(--accent); color: var(--on-accent); transition: transform .45s var(--ease), background-color .3s; }
.panel:hover .panel-arrow { transform: rotate(-45deg); }

@media (max-width: 1023px) {
  .panels { flex-direction: column; height: auto; }
  .panel, .panel.is-active { flex: none; min-height: 520px; }
  .panel-img { transform: none; filter: none; }
  .panel-more { grid-template-rows: 1fr; }
  .panel-more p, .panel-more li { opacity: 1; transform: none; }
}
@media (max-width: 767px) { .panel, .panel.is-active { min-height: 480px; } }
</style>
