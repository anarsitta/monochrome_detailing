<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import CarScheme from './CarScheme.vue'
import data from '../data'
import { filmSituations } from '../content'
import { money, from } from '../utils'
import { selection } from '../composables/selection'
import { track } from '../composables/analytics'
import { gsap, reducedMotion } from '../gsap'

const zones = data.filmZones
const allIds = zones.map((z) => z.id)
const packages = data.filmPackages.map((p) => ({ ...p, zones: p.zones === 'all' ? allIds : p.zones }))
const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]))
const pkgById = Object.fromEntries(packages.map((p) => [p.id, p]))
const names = Object.fromEntries(zones.map((z) => [z.id, z.name]))

const root = ref(null)
const situation = ref(-1)
const current = ref(pkgById[selection.filmPackage] ? selection.filmPackage : 'front')
// Если детали уже выбирали (например, в форме), продолжаем с ними
const on = ref(current.value === 'custom' && selection.filmZoneIds.length ? [...selection.filmZoneIds] : [...pkgById[current.value].zones])
const onSet = computed(() => new Set(on.value))

// Деталь подсвечивается только под курсором
const focus = ref(null)
const subs = computed(() => Object.fromEntries(zones.map((z) => [z.id, `${onSet.value.has(z.id) ? 'В расчёте' : 'Не входит'} · от ${money(z.price)}`])))

const price = computed(() => {
  if (current.value !== 'custom') return pkgById[current.value].price
  const s = on.value.reduce((acc, id) => acc + zoneById[id].price, 0)
  return Math.max(s, pkgById.custom.price)
})
const pkg = computed(() => pkgById[current.value])

// Сумма плавно «докручивается» до нового значения
const shown = ref(price.value)
watch(price, (v) => {
  if (reducedMotion()) { shown.value = v; return }
  const o = { n: shown.value }
  gsap.to(o, { n: v, duration: 0.6, ease: 'power2.out', onUpdate: () => { shown.value = Math.round(o.n / 100) * 100 } })
})
const sumLabel = computed(() => (current.value === 'custom' && !on.value.length ? 'Выберите детали' : from(shown.value)))

function selectPackage(id, keepSituation = false) {
  current.value = id
  if (id !== 'custom') on.value = [...pkgById[id].zones]
  else if (on.value.length === allIds.length) on.value = []
  if (!keepSituation) situation.value = -1
  track('service_option_select', { service: 'film', option_id: id, option_name: pkgById[id].name })
}
// Ситуация подставляет подходящий пакет и подсвечивает нужные детали
function selectSituation(i) {
  const s = filmSituations[i]
  situation.value = i
  if (s.pkg === 'custom') {
    current.value = 'custom'
    on.value = [...s.zones]
  } else selectPackage(s.pkg, true)
}
function toggle(id) {
  const next = new Set(on.value)
  next.has(id) ? next.delete(id) : next.add(id)
  on.value = [...next]
  const match = packages.find((p) => p.id !== 'custom' && p.zones.length === next.size && p.zones.every((z) => next.has(z)))
  current.value = match ? match.id : 'custom'
  situation.value = -1
}
function onHover(id) { focus.value = id }

watch(() => selection.filmPackage, (v) => {
  if (v === current.value || !pkgById[v]) return
  current.value = v
  if (v !== 'custom') on.value = [...pkgById[v].zones]
})
watch([current, on], () => {
  selection.filmPackage = current.value
  selection.filmZones = on.value.map((id) => zoneById[id].name).join(', ')
  selection.filmZoneIds = [...on.value]
}, { immediate: true })

// Форма на главной: передаём туда выбранный вариант
function onCta() {
  track('service_price_cta', { service: 'film', option_id: current.value, price_from: price.value })
  const parts = current.value === 'custom' && on.value.length ? ` (${selection.filmZones})` : ''
  selection.homeDir = 'film'
  selection.homeNote = `Оклейка плёнкой: ${pkg.value.name}${parts}, предварительно ${from(price.value)}`
}
</script>

<template>
  <div ref="root" class="calc">
    <div class="side">
      <p class="step">1. Ваша ситуация</p>
      <div class="sits" role="group" aria-label="Ситуация">
        <button
          v-for="(s, i) in filmSituations"
          :key="s.id"
          type="button"
          class="sit"
          :class="{ on: situation === i }"
          :aria-pressed="String(situation === i)"
          @click="selectSituation(i)"
        >{{ s.title }}</button>
      </div>
      <Transition name="fade" mode="out-in">
        <p :key="situation" class="sit-text">{{ situation >= 0 ? filmSituations[situation].text : 'Выберите ситуацию — подберём подходящий вариант. Или сразу отметьте вариант защиты ниже.' }}</p>
      </Transition>

      <p class="step">2. Вариант защиты</p>
      <div class="pkgs" role="radiogroup" aria-label="Вариант защиты">
        <label v-for="p in packages" :key="p.id" class="pkg" :class="{ on: current === p.id }">
          <input type="radio" name="film-package" :value="p.id" :checked="current === p.id" @change="selectPackage(p.id)">
          <span class="pkg-radio" aria-hidden="true" />
          <span class="pkg-main">
            <span class="pkg-name">{{ p.name }}</span>
            <span class="pkg-items">{{ p.items }}</span>
          </span>
          <span class="pkg-meta"><b>от {{ money(p.price) }}</b>{{ p.days }}</span>
        </label>
      </div>
    </div>

    <div class="main">
      <p class="step">3. Детали на схеме</p>
      <div class="stage">
        <CarScheme :on="on" :focus="focus" :names="names" :subs="subs" interactive @toggle="toggle" @hover="onHover" />
        <p class="hint"><span class="pulse" aria-hidden="true" />Нажмите на деталь, чтобы добавить её в расчёт или убрать</p>
      </div>

      <div class="parts" role="group" aria-label="Детали кузова в расчёте">
        <button
          v-for="z in zones"
          :key="z.id"
          type="button"
          class="part"
          :aria-pressed="String(onSet.has(z.id))"
          @click="toggle(z.id)"
          @mouseenter="focus = z.id"
          @mouseleave="focus = null"
        >{{ z.name }}</button>
      </div>

      <div class="total">
        <div>
          <p class="total-label">{{ pkg.name }} · {{ pkg.days }}</p>
          <p class="total-sum" aria-live="polite">{{ sumLabel }}</p>
          <p class="total-note">Точную цену называем после осмотра</p>
        </div>
        <RouterLink class="btn btn-primary" :to="{ path: '/', hash: '#contacts' }" @click="onCta">Записаться на осмотр <AppIcon name="arrow" /></RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc { display: grid; grid-template-columns: 4fr 7fr; gap: clamp(28px, 4vw, 56px); align-items: stretch; }
.main { display: flex; flex-direction: column; }
.step { font-size: 14px; font-weight: 500; color: var(--text-dark); margin-bottom: 12px; }
.step:not(:first-child) { margin-top: 28px; }
.sits { display: flex; flex-wrap: wrap; gap: 6px; }
.sit { min-height: 38px; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; border: 1px solid var(--line-dark); color: var(--text-dark); transition: background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease); }
.sit:hover { border-color: rgba(243,240,234,.5); color: var(--milk); }
.sit.on { background: var(--milk); color: var(--ink); border-color: var(--milk); }
.sit-text { margin-top: 12px; font-size: 14px; line-height: 1.55; color: var(--text-dark); min-height: 66px; }

.pkgs { display: flex; flex-direction: column; gap: 6px; }
.pkg { position: relative; display: grid; grid-template-columns: 20px 1fr auto; gap: 12px; align-items: center; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line-dark); cursor: pointer; transition: background-color .3s var(--ease), border-color .3s var(--ease); }
.pkg input { position: absolute; opacity: 0; pointer-events: none; }
.pkg:hover { border-color: rgba(243,240,234,.4); }
.pkg.on { background: var(--milk); color: var(--ink); border-color: var(--milk); }
.pkg:has(input:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
.pkg-radio { width: 18px; height: 18px; border-radius: 50%; border: 1.5px solid rgba(243,240,234,.45); position: relative; }
.pkg.on .pkg-radio { border-color: var(--accent); }
.pkg.on .pkg-radio::after { content: ''; position: absolute; inset: 3px; border-radius: 50%; background: var(--accent); }
.pkg-name { display: block; font-weight: 500; font-size: 15px; }
.pkg-items { display: block; font-size: 12px; color: var(--text-dark); }
.pkg.on .pkg-items { color: var(--grey); }
.pkg-meta { display: flex; flex-direction: column; align-items: flex-end; font-size: 12px; color: var(--text-dark); white-space: nowrap; }
.pkg-meta b { font-weight: 500; font-size: 14px; color: var(--milk); }
.pkg.on .pkg-meta { color: var(--grey); }
.pkg.on .pkg-meta b { color: var(--accent-dark); }

.stage { width: 100%; max-width: 640px; margin: 8px auto 0; }
.hint { display: flex; align-items: center; justify-content: center; gap: 10px; margin-top: 16px; font-size: 13px; color: var(--text-dark); text-align: center; }
.pulse { width: 7px; height: 7px; border-radius: 50%; background: var(--accent); box-shadow: 0 0 0 4px rgba(199,75,50,.25); }
.parts { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin: 20px 0 24px; }
.part { min-height: 32px; padding: 5px 12px; border-radius: 999px; font-size: 13px; border: 1px solid var(--line-dark); color: var(--text-dark); transition: background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease); }
.part:hover { border-color: rgba(243,240,234,.5); color: var(--milk); }
.part[aria-pressed="true"] { background: rgba(199,75,50,.22); border-color: var(--accent); color: var(--milk); }
.total { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 32px; margin-top: auto; padding: 20px 24px; border-radius: 16px; background: rgba(243,240,234,.06); border: 1px solid var(--line-dark); }
.total-label { font-size: 13px; color: var(--text-dark); }
.total-sum { font-family: var(--display); font-weight: 500; font-size: clamp(30px, 2.6vw, 40px); line-height: 1.1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.total-note { font-size: 13px; color: var(--text-dark); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s var(--ease); }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 1023px) { .calc { grid-template-columns: 1fr; } }
@media (max-width: 767px) { .total .btn { width: 100%; } }
</style>
