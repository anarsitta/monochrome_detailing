<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap, reducedMotion } from '../gsap'

defineProps({
  care: { type: Object, required: true }, // { timeline: [{ when, title, text }], can: [], cannot: [], warranty }
})

const root = ref(null)
let ctx
onMounted(() => {
  if (reducedMotion()) return
  ctx = gsap.context(() => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.tl', start: 'top 75%', once: true } })
    tl.fromTo('.tl-line-fill', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'expo.inOut' })
      .from('.tl-dot', { scale: 0, duration: 0.5, stagger: 0.3, ease: 'back.out(2)' }, 0.2)
      .from('.tl-item', { autoAlpha: 0, y: 24, duration: 0.7, stagger: 0.3 }, 0.3)
  }, root.value)
})
onUnmounted(() => ctx && ctx.revert())
</script>

<template>
  <div ref="root" class="care">
    <div class="tl">
      <span class="tl-line" aria-hidden="true"><span class="tl-line-fill" /></span>
      <ol class="tl-list">
        <li v-for="t in care.timeline" :key="t.when" class="tl-item">
          <span class="tl-dot" aria-hidden="true" />
          <p class="tl-when">{{ t.when }}</p>
          <h3 class="tl-title">{{ t.title }}</h3>
          <p class="tl-text">{{ t.text }}</p>
        </li>
      </ol>
    </div>

    <div class="rules" data-anim="stagger">
      <div class="rule">
        <h3 class="rule-title"><span class="mark yes" aria-hidden="true">✓</span>Можно</h3>
        <ul><li v-for="x in care.can" :key="x">{{ x }}</li></ul>
      </div>
      <div class="rule">
        <h3 class="rule-title"><span class="mark no" aria-hidden="true">✕</span>Не стоит</h3>
        <ul><li v-for="x in care.cannot" :key="x">{{ x }}</li></ul>
      </div>
      <div class="warranty dark">
        <svg class="shield" viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z" /><path d="M17 24l5 5 9-10" /></svg>
        <h3 class="rule-title">Гарантия</h3>
        <p>{{ care.warranty }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tl { position: relative; }
.tl-line { position: absolute; left: 0; right: 0; top: 11px; height: 2px; background: var(--line); }
.tl-line-fill { position: absolute; inset: 0; background: var(--accent); transform-origin: left; }
.tl-list { display: grid; grid-template-columns: repeat(4, 1fr); gap: 32px; }
.tl-item { position: relative; padding-top: 44px; }
.tl-dot { position: absolute; top: 0; left: 0; width: 24px; height: 24px; border-radius: 50%; background: var(--milk); border: 2px solid var(--accent); }
.tl-dot::after { content: ''; position: absolute; inset: 5px; border-radius: 50%; background: var(--accent); }
.tl-when { font-size: 14px; font-weight: 500; color: var(--accent-dark); }
.tl-title { font-family: var(--display); font-weight: 500; font-size: clamp(19px, 1.6vw, 23px); line-height: 1.15; margin: 6px 0 10px; }
.tl-text { color: var(--grey); font-size: 16px; max-width: 30ch; }

.rules { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 20px; margin-top: clamp(32px, 4vw, 56px); }
.rule { padding: 26px; border-radius: 20px; background: var(--white); }
.rule-title { display: flex; align-items: center; gap: 12px; font-family: var(--display); font-weight: 500; font-size: 24px; margin-bottom: 16px; }
.mark { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 15px; color: #fff; }
.mark.yes { background: var(--accent); }
.mark.no { background: var(--ink); }
.rule li { padding: 12px 0; border-top: 1px solid var(--line); font-size: 16px; color: #444; }
.warranty { padding: 26px; border-radius: 20px; position: relative; overflow: hidden; }
.warranty p { color: var(--text-dark); font-size: 16px; }
.shield { width: 48px; height: 48px; margin-bottom: 18px; fill: none; stroke: var(--accent); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; }
@media (max-width: 1023px) {
  .tl-line { left: 11px; right: auto; top: 0; bottom: 0; width: 2px; height: auto; }
  .tl-line-fill { transform-origin: top; }
  .tl-list { grid-template-columns: 1fr; gap: 28px; }
  .tl-item { padding: 0 0 0 48px; }
  .rules { grid-template-columns: 1fr; }
}
</style>
