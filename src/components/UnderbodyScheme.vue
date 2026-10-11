<script setup>
import { computed } from 'vue'

// Схема днища, вид снизу. Передняя часть справа. viewBox 800×400.
const props = defineProps({
  on: { type: Array, default: () => [] },      // зоны, входящие в обработку
  focus: { type: String, default: null },     // зона под курсором
  names: { type: Object, default: () => ({}) },
  subs: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['hover'])

const anchors = { floor: [386, 200], arches: [191, 72], sills: [395, 76], seams: [420, 172], cavities: [470, 104], frame: [300, 156] }
const onSet = computed(() => new Set(props.on))
const cls = (id) => ({ on: onSet.value.has(id), focus: props.focus === id })
const tip = computed(() => {
  if (!props.focus || !anchors[props.focus]) return null
  const [x, y] = anchors[props.focus]
  return { left: (x / 800) * 100 + '%', top: (y / 400) * 100 + '%' }
})
</script>

<template>
  <div class="scheme" @mouseleave="emit('hover', null)">
    <svg viewBox="0 0 800 400" role="img" aria-label="Схема днища автомобиля: днище, колёсные арки, пороги, швы, скрытые полости и рама">
      <defs>
        <linearGradient id="ub-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#2f2c2b" /><stop offset=".5" stop-color="#242221" /><stop offset="1" stop-color="#2f2c2b" />
        </linearGradient>
      </defs>
      <path class="body" d="M90 80 C60 85 48 120 46 200 C48 280 60 315 90 320 L640 326 C715 322 752 290 754 200 C752 110 715 78 640 74 Z" />

      <rect class="z" :class="cls('floor')" x="236" y="118" width="300" height="164" rx="16" @mouseenter="emit('hover', 'floor')" />
      <g class="decor">
        <rect x="590" y="130" width="120" height="140" rx="14" />
        <rect x="128" y="140" width="80" height="120" rx="10" />
        <path d="M560 210 C480 214 300 214 240 230 C180 246 110 250 54 252" />
      </g>
      <g class="z z-line" :class="cls('seams')" @mouseenter="emit('hover', 'seams')">
        <path d="M300 118 V282 M380 118 V282 M460 118 V282 M236 170 H536 M236 230 H536" />
      </g>
      <g class="z z-dash" :class="cls('frame')" @mouseenter="emit('hover', 'frame')">
        <rect x="66" y="150" width="670" height="12" rx="4" /><rect x="66" y="238" width="670" height="12" rx="4" />
        <path d="M200 162 V238 M400 162 V238 M600 162 V238" />
      </g>
      <g class="z z-dash" :class="cls('cavities')" @mouseenter="emit('hover', 'cavities')">
        <rect x="110" y="100" width="590" height="8" rx="3" /><rect x="110" y="292" width="590" height="8" rx="3" />
        <rect x="556" y="108" width="8" height="184" rx="3" />
      </g>
      <g class="z" :class="cls('sills')" @mouseenter="emit('hover', 'sills')">
        <rect x="250" y="70" width="290" height="16" rx="5" /><rect x="250" y="314" width="290" height="16" rx="5" />
      </g>
      <g class="z" :class="cls('arches')" @mouseenter="emit('hover', 'arches')">
        <rect x="136" y="46" width="110" height="58" rx="26" /><rect x="136" y="296" width="110" height="58" rx="26" />
        <rect x="556" y="44" width="110" height="58" rx="26" /><rect x="556" y="298" width="110" height="58" rx="26" />
      </g>
      <g class="wheels">
        <rect x="151" y="56" width="80" height="26" rx="8" /><rect x="151" y="318" width="80" height="26" rx="8" />
        <rect x="571" y="54" width="80" height="26" rx="8" /><rect x="571" y="320" width="80" height="26" rx="8" />
      </g>
    </svg>
    <Transition name="tip">
      <div v-if="tip && names[focus]" :key="focus" class="tip" :style="tip">
        <span class="tip-dot" />
        <span class="tip-card"><b>{{ names[focus] }}</b><small v-if="subs[focus]">{{ subs[focus] }}</small></span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scheme { position: relative; }
.scheme svg { display: block; width: 100%; height: auto; overflow: visible; }
.body { fill: url(#ub-body); stroke: rgba(243,240,234,.35); stroke-width: 1.2; }
.decor * { fill: none; stroke: rgba(243,240,234,.2); stroke-width: 1; stroke-dasharray: 3 5; }
.wheels rect { fill: #0b0b0b; stroke: rgba(243,240,234,.2); pointer-events: none; }
.z, .z > * { fill: rgba(243,240,234,.05); stroke: rgba(243,240,234,.3); stroke-width: 1; transition: fill .4s var(--ease), stroke .3s var(--ease), stroke-width .2s; cursor: pointer; outline: none; }
.z.on, .z.on > * { fill: rgba(199,75,50,.55); stroke: #E9907A; }
.z.focus, .z.focus > * { stroke: #fff; stroke-width: 2.2; }
.z-line, .z-line > * { fill: none !important; stroke: rgba(243,240,234,.25); }
.z-line.on > * { stroke: #F08A6F; stroke-width: 3; }
.z-line.focus > * { stroke: #fff; stroke-width: 3.5; }
.z-dash > * { fill: transparent; stroke-dasharray: 6 5; }
.z-dash.on > * { fill: rgba(199,75,50,.45); stroke-dasharray: none; }
.tip { position: absolute; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none; z-index: 2; }
.tip-dot { order: 2; width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 6px rgba(255,255,255,.18); }
.tip-card { display: flex; flex-direction: column; padding: 8px 14px; border-radius: 10px; background: var(--milk); color: var(--ink); white-space: nowrap; box-shadow: 0 20px 40px -16px rgba(0,0,0,.6); }
.tip-card b { font-weight: 500; font-size: 14px; }
.tip-card small { font-size: 12px; color: var(--grey); }
.tip-enter-active, .tip-leave-active { transition: opacity .25s var(--ease); }
.tip-enter-from, .tip-leave-to { opacity: 0; }
@media (max-width: 767px) { .tip { display: none; } }
</style>
