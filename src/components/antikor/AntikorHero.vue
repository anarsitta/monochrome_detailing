<script setup>
import AppIcon from '../AppIcon.vue'
import Breadcrumbs from '../Breadcrumbs.vue'
import data from '../../data'
import { money } from '../../utils'
import { track } from '../../composables/analytics'
import { PAGES } from '../../composables/seo'
import { selection } from '../../composables/selection'

const minPrice = Math.min(...data.antikorScenarios.map((s) => Math.min(...Object.values(s.prices))))
const facts = [
  ['6 зон', 'днище, арки, пороги, швы, полости, рама'],
  ['1–2 дня', 'вместе с мойкой и сушкой'],
  [`от ${money(minPrice)}`, 'обновление покрытия легкового авто'],
]
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="photo" aria-hidden="true">
      <img src="/img/antikor-underbody.jpg" width="1600" height="1067" alt="" fetchpriority="high" decoding="async">
    </div>

    <div class="container main">
      <div class="copy">
        <Breadcrumbs :title="PAGES.antikor.title" />
        <h1 id="hero-title" class="title">Антикоррозийная обработка автомобиля в&nbsp;Ярославле</h1>
        <p class="text">Защита днища, арок и скрытых полостей. Сначала осматриваем автомобиль на подъёмнике и показываем фото, потом согласовываем объём обработки.</p>
        <div class="btn-row">
          <a class="btn btn-primary" href="#pricing" @click="track('service_hero_cta', { service: 'antikor', cta_label: 'Рассчитать стоимость' })">Рассчитать стоимость <AppIcon name="arrow" /></a>
          <RouterLink class="btn btn-ghost" :to="{ path: '/', hash: '#contacts' }" @click="selection.homeDir = 'antikor'">Записаться на осмотр</RouterLink>
        </div>
      </div>
    </div>

    <div class="facts-bar">
      <ul class="container facts">
        <li v-for="[v, l] in facts" :key="v"><b>{{ v }}</b>{{ l }}</li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.hero { position: relative; min-height: min(88svh, 820px); display: flex; flex-direction: column; padding-top: var(--header-h); overflow: hidden; }
.photo { position: absolute; top: 0; right: 0; bottom: 0; left: 40%; }
.photo img { width: 100%; height: 100%; object-fit: cover; object-position: 40% 50%; }
.photo::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, var(--milk) 0%, rgba(243,240,234,.8) 8%, rgba(243,240,234,.3) 20%, rgba(243,240,234,0) 34%); }
.main { position: relative; z-index: 1; flex: 1; display: flex; align-items: center; padding-top: 24px; padding-bottom: 40px; }
.copy { max-width: 560px; }
.title { font-family: var(--display); font-weight: 500; font-size: clamp(32px, 3.2vw, 52px); line-height: 1.1; letter-spacing: -.015em; }
.text { margin-top: 20px; font-size: 18px; color: #555; max-width: 46ch; }
.btn-row { margin-top: 32px; }
.facts-bar { position: relative; z-index: 1; background: rgba(243,240,234,.94); border-top: 1px solid var(--line); }
.facts { display: grid; grid-template-columns: repeat(3, 1fr); }
.facts li { display: flex; flex-direction: column; padding: 20px 16px; font-size: 14px; color: var(--grey); }
.facts li + li { border-left: 1px solid var(--line-strong); padding-left: 24px; }
.facts b { font-family: var(--display); font-weight: 500; font-size: 20px; color: var(--ink); }
@media (max-width: 1023px) {
  .hero { min-height: 0; }
  .photo { position: relative; left: 0; height: 48svh; min-height: 300px; order: -1; }
  .photo::after { background: linear-gradient(0deg, var(--milk) 0%, rgba(243,240,234,0) 35%); }
}
@media (max-width: 767px) {
  .facts { grid-template-columns: 1fr; }
  .facts li, .facts li + li { padding: 12px 0; border-left: 0; }
  .facts li + li { border-top: 1px solid var(--line); }
}
</style>
