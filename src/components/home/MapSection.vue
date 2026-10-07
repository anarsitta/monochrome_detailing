<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import AppIcon from '../AppIcon.vue'
import Socials from '../Socials.vue'
import data from '../../data'
import { useReveal } from '../../composables/useReveal'
import { useTrackContact } from '../../composables/useTrackContact'

const c = data.contacts
const root = ref(null)
const mapEl = ref(null)
const loaded = ref(false)
const trackContact = useTrackContact()
useReveal(root)

const mapSrc = `https://yandex.ru/map-widget/v1/?ll=${c.geo.lon}%2C${c.geo.lat}&z=15&pt=${c.geo.lon}%2C${c.geo.lat}%2Cpm2rdm`
const routeHref = `https://yandex.ru/maps/?rtext=~${c.geo.lat},${c.geo.lon}&rtt=auto`

// Карта подгружается, когда до неё остаётся немного прокрутки
let io
onMounted(() => {
  if (!('IntersectionObserver' in window)) { loaded.value = true; return }
  io = new IntersectionObserver((en) => { if (en[0].isIntersecting) { loaded.value = true; io.disconnect() } }, { rootMargin: '400px' })
  io.observe(mapEl.value)
})
onUnmounted(() => io && io.disconnect())
</script>

<template>
  <section id="map" ref="root" class="section map-section white" aria-labelledby="map-title">
    <div class="container">
      <div class="section-head">
        <div>
          <p class="kicker">Как нас найти</p>
          <h2 id="map-title" class="h2" data-anim="fade">Приезжайте показать автомобиль</h2>
        </div>
        <p class="lead" data-anim="fade">Осмотр занимает около 30 минут и ни к чему не обязывает. Лучше заранее позвонить или написать, чтобы мастер был свободен.</p>
      </div>

      <div class="grid" data-anim="fade">
        <div class="info">
          <div class="item">
            <p class="k">Адрес</p>
            <p class="v">{{ c.address }}</p>
            <p class="s">{{ c.addressNote }}</p>
          </div>
          <div class="item">
            <p class="k">Часы работы</p>
            <p class="v">{{ c.hours }}</p>
          </div>
          <div class="item">
            <p class="k">Телефон</p>
            <a class="v phone" :href="c.phoneHref" @click="trackContact('phone')">{{ c.phone }}</a>
          </div>
          <div class="item">
            <p class="k">Мессенджеры</p>
            <Socials />
          </div>
          <div class="actions">
            <a class="btn btn-primary" :href="routeHref" target="_blank" rel="noopener" @click="trackContact('route')">Построить маршрут <AppIcon name="arrow" /></a>
            <a class="btn btn-ghost" :href="c.phoneHref" @click="trackContact('phone')">Позвонить</a>
          </div>
        </div>

        <div ref="mapEl" class="map">
          <iframe v-if="loaded" :src="mapSrc" title="Карта: ателье MONOCHROME в Ярославле" loading="lazy" allowfullscreen />
          <button v-else class="map-load" type="button" @click="loaded = true">Показать карту</button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.grid { display: grid; grid-template-columns: 4fr 8fr; gap: 20px; align-items: stretch; }
.info { display: flex; flex-direction: column; padding: clamp(24px, 3vw, 40px); border-radius: var(--radius-lg); background: var(--milk); }
.item { padding: 16px 0; border-bottom: 1px solid var(--line); }
.item:first-child { padding-top: 0; }
.k { font-size: 14px; color: var(--grey); margin-bottom: 4px; }
.v { font-family: var(--display); font-weight: 500; font-size: 21px; line-height: 1.3; }
.s { margin-top: 4px; font-size: 15px; color: var(--grey); }
.phone { display: inline-block; transition: color .3s; }
.phone:hover { color: var(--accent-dark); }
.item :deep(.socials) { color: var(--ink); margin-top: 6px; }
.actions { display: flex; flex-direction: column; gap: 10px; margin-top: auto; padding-top: 24px; }
.actions .btn { width: 100%; }
.map { position: relative; min-height: 520px; border-radius: var(--radius-lg); overflow: hidden; background: var(--milk-2) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Cpath d='M0 48L48 0' stroke='%23d6d0c5'/%3E%3C/svg%3E"); display: flex; align-items: center; justify-content: center; }
.map iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; }
.map-load { min-height: 52px; padding: 12px 24px; border-radius: 999px; background: var(--white); font-weight: 500; }
@media (max-width: 1023px) {
  .grid { grid-template-columns: 1fr; }
  .map { min-height: 380px; }
}
</style>
