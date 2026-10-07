<script setup>
import { ref, computed, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import UnderbodyScheme from './UnderbodyScheme.vue'
import data from '../data'
import { antikorStates } from '../content'
import { from } from '../utils'
import { selection } from '../composables/selection'
import { track } from '../composables/analytics'
import { gsap, reducedMotion } from '../gsap'

const scenarios = data.antikorScenarios
const types = data.carTypes
const zones = data.antikorZones
const zoneById = Object.fromEntries(zones.map((z) => [z.id, z]))
const names = Object.fromEntries(zones.map((z) => [z.id, z.name]))

// Какие зоны входят в сценарий; раму обрабатываем только у рамных автомобилей
const scenarioZones = {
  prevent: ['seams', 'cavities', 'arches'],
  renew: ['floor', 'arches', 'sills'],
  used: ['floor', 'arches', 'sills', 'seams', 'cavities'],
}

const state = ref(-1)
const focus = ref(null)
const current = computed(() => scenarios.find((s) => s.id === selection.antikorCondition) || scenarios[0])
const typeName = computed(() => (types.find((t) => t.id === selection.carType) || types[0]).name)
const on = computed(() => [...scenarioZones[current.value.id], ...(selection.carType === 'frame' ? ['frame'] : [])])
const onSet = computed(() => new Set(on.value))
const subs = computed(() => Object.fromEntries(zones.map((z) => [z.id, onSet.value.has(z.id) ? 'Входит в сценарий' : 'Не входит в сценарий'])))
const price = computed(() => current.value.prices[selection.carType])

// Цена плавно «докручивается» до нового значения
const shown = ref(price.value)
watch(price, (v) => {
  if (reducedMotion()) { shown.value = v; return }
  const o = { n: shown.value }
  gsap.to(o, { n: v, duration: 0.6, ease: 'power2.out', onUpdate: () => { shown.value = Math.round(o.n / 100) * 100 } })
})

function selectState(i) {
  state.value = i
  selection.antikorCondition = antikorStates[i].scenario
}
function selectScenario(s) {
  selection.antikorCondition = s.id
  state.value = -1
  track('service_option_select', { service: 'antikor', option_id: s.id, option_name: s.name })
}
// Форма на главной: передаём туда выбранный сценарий
function onCta() {
  track('service_price_cta', { service: 'antikor', option_id: current.value.id, price_from: price.value })
  selection.homeDir = 'antikor'
  selection.homeNote = `Антикор: ${current.value.name}, ${typeName.value}, предварительно ${from(price.value)}`
}
</script>

<template>
  <div class="calc">
    <div class="side">
      <p class="step">1. Состояние автомобиля</p>
      <div class="chips" role="group" aria-label="Состояние автомобиля">
        <button v-for="(s, i) in antikorStates" :key="s.id" type="button" class="chip" :class="{ on: state === i }" :aria-pressed="String(state === i)" @click="selectState(i)">{{ s.title }}</button>
      </div>
      <Transition name="fade" mode="out-in">
        <p :key="state" class="note">{{ state >= 0 ? antikorStates[state].lead : 'Выберите, что ближе к вашему автомобилю, — подберём сценарий. Или выберите сценарий сразу.' }}</p>
      </Transition>

      <p class="step">2. Тип автомобиля</p>
      <div class="chips" role="radiogroup" aria-label="Тип автомобиля">
        <label v-for="t in types" :key="t.id" class="chip" :class="{ on: selection.carType === t.id }">
          <input v-model="selection.carType" type="radio" name="ak-type" :value="t.id">{{ t.name }}
        </label>
      </div>

      <p class="step">3. Сценарий обработки</p>
      <div class="pkgs" role="radiogroup" aria-label="Сценарий обработки">
        <label v-for="s in scenarios" :key="s.id" class="pkg" :class="{ on: current.id === s.id }">
          <input type="radio" name="ak-scenario" :value="s.id" :checked="current.id === s.id" @change="selectScenario(s)">
          <span class="pkg-radio" aria-hidden="true" />
          <span class="pkg-main">
            <span class="pkg-name">{{ s.name }}</span>
            <span class="pkg-items">{{ s.for }}</span>
          </span>
          <span class="pkg-meta"><b>{{ from(s.prices[selection.carType]) }}</b>{{ s.days }}</span>
        </label>
      </div>
    </div>

    <div class="main">
      <p class="step">4. Что обрабатываем</p>
      <div class="stage">
        <UnderbodyScheme :on="on" :focus="focus" :names="names" :subs="subs" @hover="focus = $event" />
      </div>
      <div class="parts" role="list" aria-label="Зоны обработки">
        <span
          v-for="z in zones"
          :key="z.id"
          role="listitem"
          class="part"
          :class="{ on: onSet.has(z.id) }"
          @mouseenter="focus = z.id"
          @mouseleave="focus = null"
        >{{ z.name }}</span>
      </div>
      <p class="zone-text">{{ focus ? zoneById[focus].text : 'Наведите на зону на схеме или в списке, чтобы узнать, что в ней делаем.' }}</p>

      <div class="total">
        <div>
          <p class="total-label">{{ current.name }} · {{ typeName }} · {{ current.days }}</p>
          <p class="total-sum" aria-live="polite">{{ from(shown) }}</p>
          <p class="total-note">Итоговый состав подтверждает мастер после осмотра</p>
        </div>
        <RouterLink class="btn btn-primary" :to="{ path: '/', hash: '#contacts' }" @click="onCta">{{ current.cta }} <AppIcon name="arrow" /></RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc { display: grid; grid-template-columns: 4fr 7fr; gap: clamp(28px, 4vw, 56px); align-items: stretch; }
.main { display: flex; flex-direction: column; }
.step { font-size: 14px; font-weight: 500; color: var(--text-dark); margin-bottom: 12px; }
.side .step:not(:first-child) { margin-top: 24px; }
.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip { position: relative; display: inline-flex; align-items: center; min-height: 38px; padding: 8px 14px; border-radius: 999px; font-size: 14px; font-weight: 500; border: 1px solid var(--line-dark); color: var(--text-dark); cursor: pointer; transition: background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease); }
.chip input { position: absolute; opacity: 0; pointer-events: none; }
.chip:hover { border-color: rgba(243,240,234,.5); color: var(--milk); }
.chip.on { background: var(--milk); color: var(--ink); border-color: var(--milk); }
.chip:has(input:focus-visible) { outline: 2px solid var(--accent); outline-offset: 2px; }
.note { margin-top: 12px; font-size: 14px; line-height: 1.55; color: var(--text-dark); min-height: 44px; }

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
.parts { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px; margin-top: 20px; }
.part { min-height: 32px; padding: 5px 12px; border-radius: 999px; font-size: 13px; border: 1px solid var(--line-dark); color: var(--text-dark); cursor: default; transition: border-color .3s, color .3s; }
.part:hover { border-color: rgba(243,240,234,.6); color: var(--milk); }
.part.on { background: rgba(199,75,50,.22); border-color: var(--accent); color: var(--milk); }
.zone-text { margin: 14px auto 24px; max-width: 56ch; text-align: center; font-size: 14px; color: var(--text-dark); min-height: 44px; }
.total { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 32px; margin-top: auto; padding: 20px 24px; border-radius: 16px; background: rgba(243,240,234,.06); border: 1px solid var(--line-dark); }
.total-label { font-size: 13px; color: var(--text-dark); }
.total-sum { font-family: var(--display); font-weight: 500; font-size: clamp(30px, 2.6vw, 40px); line-height: 1.1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; }
.total-note { font-size: 13px; color: var(--text-dark); }
.fade-enter-active, .fade-leave-active { transition: opacity .25s var(--ease); }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@media (max-width: 1023px) { .calc { grid-template-columns: 1fr; } }
@media (max-width: 767px) { .total .btn { width: 100%; } }
</style>
