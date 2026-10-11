<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, ScrollTrigger, reducedMotion } from '../gsap'

const props = defineProps({
  steps: { type: Array, required: true }, // [{ title, text }]
  title: { type: String, required: true },
  lead: { type: String, default: '' },
})

const root = ref(null)
const list = ref(null)
const ring = ref(null)
const active = ref(0)
const R = 130
const C = 2 * Math.PI * R
const n = props.steps.length
const pad = (x) => String(x).padStart(2, '0')
const ticks = computed(() => props.steps.map((s, i) => {
  const a = (i / n) * Math.PI * 2 - Math.PI / 2
  return { x: 160 + Math.cos(a) * R, y: 160 + Math.sin(a) * R }
}))

// Линия идёт ровно от центра первого кружка до центра последнего, без хвоста
const lineEl = ref(null)
let ro
function fitLine() {
  const dots = list.value ? list.value.querySelectorAll('.dot') : []
  if (!dots.length || !lineEl.value) return
  const base = list.value.getBoundingClientRect().top
  const first = dots[0].getBoundingClientRect()
  const last = dots[dots.length - 1].getBoundingClientRect()
  lineEl.value.style.top = first.top + first.height / 2 - base + 'px'
  lineEl.value.style.height = last.top - first.top + 'px'
}

let ctx
onMounted(() => {
  fitLine()
  if ('ResizeObserver' in window) { ro = new ResizeObserver(fitLine); ro.observe(list.value) }
  if (reducedMotion()) { ring.value.style.strokeDashoffset = 0; active.value = n - 1; return }
  ctx = gsap.context(() => {
    // Кольцо и линия рисуются напрямую через GSAP, без перерисовки Vue на каждом кадре
    gsap.fromTo(ring.value, { strokeDashoffset: C }, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: list.value, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
    })
    gsap.fromTo('.line-fill', { scaleY: 0 }, {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: list.value, start: 'top 60%', end: 'bottom 60%', scrub: 0.4 },
    })
    // Активный шаг меняется только при пересечении середины экрана
    list.value.querySelectorAll('.step').forEach((el, i) => {
      ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'bottom 60%', onToggle: (self) => { if (self.isActive) active.value = i } })
    })
  }, root.value)
})
onUnmounted(() => { ro && ro.disconnect(); ctx && ctx.revert() })
</script>

<template>
  <div ref="root" class="pr">
    <div class="side">
      <p class="kicker">Этапы работы</p>
      <h2 class="h2">{{ title }}</h2>
      <p v-if="lead" class="lead">{{ lead }}</p>
      <div class="ring-wrap" aria-hidden="true">
        <svg viewBox="0 0 320 320" class="ring">
          <circle cx="160" cy="160" :r="R" class="ring-bg" />
          <circle ref="ring" cx="160" cy="160" :r="R" class="ring-fg" :stroke-dasharray="C" :stroke-dashoffset="C" />
          <circle v-for="(t, i) in ticks" :key="i" :cx="t.x" :cy="t.y" r="5" class="tick" :class="{ on: i <= active }" />
        </svg>
        <div class="ring-center">
          <span class="ring-num">{{ pad(active + 1) }}</span>
          <span class="ring-of">из {{ pad(n) }}</span>
        </div>
      </div>
      <p class="ring-title" aria-hidden="true">{{ steps[active].title }}</p>
    </div>

    <div ref="list" class="steps">
      <span ref="lineEl" class="line" aria-hidden="true"><span class="line-fill" /></span>
      <ol>
        <li v-for="(s, i) in steps" :key="s.title" class="step" :class="{ on: i === active, done: i < active }">
          <span class="dot" aria-hidden="true">{{ i + 1 }}</span>
          <div class="step-card">
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
.pr { display: grid; grid-template-columns: 5fr 7fr; gap: clamp(40px, 6vw, 110px); }
.side { position: sticky; top: 100px; align-self: start; }
.side .lead { margin-top: 16px; }
.ring-wrap { position: relative; width: min(320px, 100%); margin: clamp(48px, 6vh, 80px) auto 0; }
.ring { width: 100%; height: auto; }
.ring-bg { fill: none; stroke: var(--line-dark); stroke-width: 2; }
.ring-fg { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linecap: round; transform: rotate(-90deg); transform-origin: 160px 160px; }
.tick { fill: var(--ink); stroke: rgba(243,240,234,.35); stroke-width: 1.5; transition: fill .3s, stroke .3s; }
.tick.on { fill: var(--accent); stroke: var(--accent); }
.ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.ring-num { font-family: var(--display); font-weight: 500; font-size: 88px; line-height: 1; letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.ring-of { color: var(--text-dark); font-size: 15px; margin-top: 6px; }
.ring-title { margin: 18px auto 0; font-family: var(--display); font-weight: 500; font-size: 22px; max-width: 320px; text-align: center; }

.steps { position: relative; }
.line { position: absolute; left: 19px; top: 26px; width: 2px; background: var(--line-dark); }
.line-fill { position: absolute; inset: 0; background: var(--accent); transform-origin: top; transform: scaleY(0); will-change: transform; }
.step { position: relative; display: grid; grid-template-columns: 40px 1fr; gap: 18px; padding: 6px 0; }
.dot { position: relative; z-index: 1; width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 500; font-size: 14px; background: var(--ink); border: 1.5px solid rgba(243,240,234,.25); color: var(--text-dark); transition: background-color .3s, border-color .3s, color .3s; }
.step.done .dot { border-color: var(--accent); color: var(--milk); }
.step.on .dot { background: var(--accent); border-color: var(--accent); color: #fff; }
.step-card { padding: 14px 20px; border-radius: 14px; border: 1px solid transparent; opacity: .5; transition: opacity .3s, background-color .3s, border-color .3s; }
.step.done .step-card { opacity: .8; }
.step.on .step-card { opacity: 1; background: rgba(243,240,234,.05); border-color: var(--line-dark); }
.step-card h3 { font-family: var(--display); font-weight: 500; font-size: clamp(18px, 1.4vw, 21px); }
.step-card p { margin-top: 4px; color: var(--text-dark); font-size: 15px; max-width: 54ch; }

@media (max-width: 1023px) {
  .pr { grid-template-columns: 1fr; }
  .side { position: static; }
  .ring-wrap, .ring-title { display: none; }
  .step-card { opacity: 1; padding: 12px 0 12px 4px; background: none !important; border: 0 !important; }
}
@media (prefers-reduced-motion: reduce) { .step-card { opacity: 1; } }
</style>
