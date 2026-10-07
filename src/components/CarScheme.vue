<script setup>
import { computed } from 'vue'

// Схема кузова универсала, вид сверху. Передняя часть справа. viewBox 800×400, ось симметрии y=200.
const props = defineProps({
  on: { type: Array, default: () => [] },       // закрашенные зоны
  focus: { type: String, default: null },      // зона под «прожектором» с выноской
  interactive: { type: Boolean, default: false },
  names: { type: Object, default: () => ({}) }, // id → подпись выноски
  subs: { type: Object, default: () => ({}) },  // id → вторая строка выноски
  compact: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle', 'hover'])

// Нижняя половина детали — зеркало верхней относительно y=200
const mirror = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${x} ${400 - Number(y)}`)
const pair = (d) => d + ' ' + mirror(d)

const zones = [
  ['rear_bumper', 'M102 86 C72 92 52 130 50 200 C52 270 72 308 102 314 C92 280 88 240 88 200 C88 160 92 120 102 86 Z', [70, 200]],
  ['trunk', 'M158 138 L106 144 C98 175 98 225 106 256 L158 262 C150 230 150 170 158 138 Z', [130, 200]],
  ['rear_fenders', pair('M106 90 L220 85 L220 124 L160 132 L106 140 C102 120 102 104 106 90 Z'), [160, 108]],
  ['doors', pair('M222 84 L502 80 L502 106 L430 120 L222 124 Z'), [330, 104]],
  ['sills', pair('M224 76 L500 72 L500 79 L224 83 Z'), [380, 76]],
  ['roof', 'M428 124 L222 128 C214 160 214 240 222 272 L428 276 C418 240 418 160 428 124 Z', [320, 200]],
  ['hood_rear', 'M502 112 L596 116 L596 284 L502 288 C494 240 494 160 502 112 Z', [548, 200]],
  ['hood_front', 'M600 116 L688 130 C700 165 700 235 688 270 L600 284 Z', [644, 200]],
  ['fenders', pair('M502 82 L640 76 C668 78 688 86 700 92 L684 124 L598 112 L502 108 Z'), [600, 94]],
  ['bumper', 'M700 92 C735 105 752 150 754 200 C752 250 735 295 700 308 C712 270 716 235 716 200 C716 165 712 130 700 92 Z', [735, 200]],
  ['headlights', pair('M684 100 L708 110 L702 136 L680 128 Z'), [694, 118]],
  ['mirrors', pair('M474 82 L488 58 C492 52 504 52 506 60 L498 84 Z'), [492, 64]],
]
const anchor = Object.fromEntries(zones.map(([id, , a]) => [id, a]))
const onSet = computed(() => new Set(props.on))
const tip = computed(() => {
  if (!props.focus || !anchor[props.focus]) return null
  const [x, y] = anchor[props.focus]
  return { left: (x / 800) * 100 + '%', top: (y / 400) * 100 + '%', below: y < 150 }
})

function key(e, id) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit('toggle', id) }
}
</script>

<template>
  <div class="scheme" :class="{ compact, interactive }" @mouseleave="emit('hover', null)">
    <svg viewBox="0 0 800 400" role="group" aria-label="Схема кузова, вид сверху">
      <defs>
        <linearGradient id="cs-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#3a3735" />
          <stop offset=".5" stop-color="#2a2726" />
          <stop offset="1" stop-color="#3a3735" />
        </linearGradient>
        <linearGradient id="cs-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#121212" />
          <stop offset=".55" stop-color="#26303a" />
          <stop offset="1" stop-color="#101010" />
        </linearGradient>
        <radialGradient id="cs-shadow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#000" stop-opacity=".55" />
          <stop offset="1" stop-color="#000" stop-opacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="400" cy="206" rx="390" ry="170" fill="url(#cs-shadow)" />
      <g class="wheels">
        <rect x="145" y="60" width="92" height="18" rx="7" /><rect x="565" y="58" width="92" height="18" rx="7" />
        <rect x="145" y="322" width="92" height="18" rx="7" /><rect x="565" y="324" width="92" height="18" rx="7" />
      </g>
      <path class="body" d="M90 80 C60 85 48 120 46 200 C48 280 60 315 90 320 L640 326 C715 322 752 290 754 200 C752 110 715 78 640 74 Z" />

      <path class="glass" d="M496 112 C472 140 468 260 496 288 L432 278 C422 240 422 160 432 122 Z" />
      <path class="glass" d="M218 130 L162 136 C154 170 154 230 162 264 L218 270 C210 240 210 160 218 130 Z" />

      <path
        v-for="[id, d] in zones"
        :key="id"
        class="zone"
        :class="{ on: onSet.has(id), focus: focus === id }"
        :d="d"
        :tabindex="interactive ? 0 : undefined"
        :role="interactive ? 'checkbox' : undefined"
        :aria-checked="interactive ? String(onSet.has(id)) : undefined"
        :aria-label="interactive ? names[id] : undefined"
        @click="interactive && emit('toggle', id)"
        @keydown="interactive && key($event, id)"
        @mouseenter="emit('hover', id)"
        @focus="emit('hover', id)"
      />

      <g class="details" aria-hidden="true">
        <rect x="300" y="150" width="104" height="100" rx="10" class="sunroof" />
        <path d="M240 134 L412 130 M240 266 L412 270" class="rails" />
        <path d="M362 82 L362 122 M362 318 L362 278" />
        <rect x="292" y="96" width="20" height="4" rx="2" /><rect x="432" y="93" width="20" height="4" rx="2" />
        <rect x="292" y="300" width="20" height="4" rx="2" /><rect x="432" y="303" width="20" height="4" rx="2" />
        <path d="M720 160 C726 185 726 215 720 240" class="grille" />
      </g>
    </svg>

    <Transition name="tip">
      <div v-if="tip && names[focus]" :key="focus" class="tip" :class="{ below: tip.below }" :style="{ left: tip.left, top: tip.top }">
        <span class="tip-dot" />
        <span class="tip-card">
          <b>{{ names[focus] }}</b>
          <small v-if="subs[focus]">{{ subs[focus] }}</small>
        </span>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.scheme { position: relative; width: 100%; }
.scheme svg { display: block; width: 100%; height: auto; overflow: visible; }
.wheels rect { fill: #0c0c0c; }
.body { fill: url(#cs-body); stroke: rgba(243,240,234,.35); stroke-width: 1.2; }
.glass { fill: url(#cs-glass); stroke: rgba(243,240,234,.25); stroke-width: 1; }
.zone { fill: rgba(243,240,234,.04); stroke: rgba(243,240,234,.32); stroke-width: 1; transition: fill .5s var(--ease), stroke .4s var(--ease), stroke-width .3s; }
.interactive .zone { cursor: pointer; }
.interactive .zone:hover { fill: rgba(243,240,234,.12); }
.zone.on { fill: rgba(199,75,50,.62); stroke: #E9907A; }
.interactive .zone.on:hover { fill: rgba(199,75,50,.78); }
.zone.focus { stroke: #fff; stroke-width: 2.2; }
.zone:focus { outline: none; }
.zone:focus-visible { stroke: #fff; stroke-width: 3; }
.details * { fill: none; stroke: rgba(243,240,234,.28); stroke-width: 1; pointer-events: none; }
.details rect:not(.sunroof) { fill: rgba(243,240,234,.35); stroke: none; }
.sunroof { fill: rgba(10,10,10,.35) !important; }
.rails { stroke-width: 2 !important; stroke-linecap: round; }
.grille { stroke-dasharray: 3 4; }

.tip { position: absolute; z-index: 2; pointer-events: none; transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; }
.tip.below { transform: translate(-50%, 0); flex-direction: column-reverse; }
.tip-dot { width: 12px; height: 12px; border-radius: 50%; background: #fff; box-shadow: 0 0 0 6px rgba(255,255,255,.18); order: 2; margin-top: 10px; }
.tip.below .tip-dot { margin: 0 0 10px; }
.tip-card { display: flex; flex-direction: column; padding: 10px 16px; border-radius: 10px; background: var(--milk); color: var(--ink); white-space: nowrap; box-shadow: 0 20px 40px -16px rgba(0,0,0,.6); }
.tip-card b { font-weight: 500; font-size: 15px; }
.tip-card small { font-size: 13px; color: var(--grey); }
.compact .tip-card { padding: 6px 12px; }
.tip-enter-active, .tip-leave-active { transition: opacity .3s var(--ease), translate .4s var(--ease); }
.tip-enter-from { opacity: 0; translate: 0 8px; }
.tip-leave-to { opacity: 0; translate: 0 -6px; }
@media (max-width: 767px) { .tip-card b { font-size: 13px; } .tip-card small { display: none; } }
</style>
