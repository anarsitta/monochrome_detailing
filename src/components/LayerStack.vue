<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gsap, reducedMotion } from '../gsap'

const props = defineProps({
  layers: { type: Array, required: true }, // сверху вниз: [{ name, meta, text, group: 'film'|'car' }]
  palette: { type: Array, required: true }, // цвета слоёв сверху вниз
  groups: { type: Object, default: () => ({ film: 'Защита', car: 'Автомобиль' }) },
})

const root = ref(null)
const stack = ref(null)
const active = ref(0)
// В 3D стопке слои рисуются снизу вверх
const bottomUp = computed(() => props.layers.map((l, i) => ({ ...l, i, color: props.palette[i] })).reverse())

let ctx
onMounted(() => {
  if (reducedMotion()) { stack.value.style.setProperty('--gap', '40px'); return }
  ctx = gsap.context(() => {
    gsap.fromTo(stack.value, { '--gap': '6px', '--tilt': '70deg' }, {
      '--gap': '44px', '--tilt': '58deg', duration: 1.2, ease: 'power2.out',
      scrollTrigger: { trigger: root.value, start: 'top 70%', once: true },
    })
  }, root.value)
})
onUnmounted(() => ctx && ctx.revert())
</script>

<template>
  <div ref="root" class="ls">
    <div ref="stack" class="stack" aria-hidden="true">
      <div
        v-for="(l, k) in bottomUp"
        :key="l.name"
        class="layer"
        :class="{ on: active === l.i, film: l.group === 'film' }"
        :style="{ '--k': k, '--c': l.color }"
        @mouseenter="active = l.i"
      >
        <span class="layer-tag">{{ l.name }}</span>
      </div>
    </div>

    <ol class="list">
      <li v-for="(l, i) in layers" :key="l.name">
        <p v-if="i === 0 || layers[i - 1].group !== l.group" class="group">{{ groups[l.group] }}</p>
        <button type="button" class="item" :class="{ on: active === i }" :aria-pressed="String(active === i)" @mouseenter="active = i" @focus="active = i" @click="active = i">
          <span class="swatch" :style="{ background: palette[i] }" aria-hidden="true" />
          <span class="item-body">
            <span class="item-name">{{ l.name }} <small v-if="l.meta">{{ l.meta }}</small></span>
            <span class="item-text"><span>{{ l.text }}</span></span>
          </span>
        </button>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.ls { display: grid; grid-template-columns: 6fr 6fr; gap: clamp(32px, 5vw, 80px); align-items: center; }
.stack { --gap: 6px; --tilt: 70deg; position: relative; height: clamp(320px, 32vw, 440px); perspective: 1600px; }
.layer {
  position: absolute; left: 50%; top: 58%; width: min(280px, 64%); aspect-ratio: 1; translate: -50% -50%;
  transform: rotateX(var(--tilt)) rotateZ(-42deg) translateZ(calc(var(--k) * var(--gap)));
  border-radius: 18px; background: var(--c); border: 1px solid rgba(255,255,255,.35);
  box-shadow: 0 1px 0 rgba(255,255,255,.4) inset, 0 30px 50px -30px rgba(0,0,0,.45);
  transition: transform .6s var(--ease), box-shadow .4s var(--ease), filter .4s var(--ease);
  cursor: pointer;
}
.layer.film { backdrop-filter: blur(2px); }
.layer.on { box-shadow: 0 0 0 2px var(--accent), 0 30px 60px -20px rgba(199,75,50,.55); transform: rotateX(var(--tilt)) rotateZ(-42deg) translateZ(calc(var(--k) * var(--gap) + 18px)); }
.layer-tag { position: absolute; right: 12px; bottom: 12px; padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 500; background: rgba(23,23,23,.7); color: #fff; opacity: 0; transition: opacity .3s; white-space: nowrap; }
.layer.on .layer-tag { opacity: 1; }

.group { font-size: 14px; color: var(--grey); margin: 18px 0 8px; }
li:first-child .group { margin-top: 0; }
.dark .group { color: var(--text-dark); }
.item { display: flex; gap: 16px; width: 100%; padding: 14px 16px; border-radius: 12px; text-align: left; transition: background-color .35s var(--ease); }
.item:hover, .item.on { background: rgba(23,23,23,.05); }
.dark .item:hover, .dark .item.on { background: rgba(243,240,234,.07); }
.swatch { width: 18px; height: 18px; border-radius: 5px; flex: none; margin-top: 4px; border: 1px solid rgba(23,23,23,.15); }
.item-name { display: block; font-weight: 500; font-size: 17px; }
.item-name small { font-weight: 400; font-size: 14px; color: var(--grey); margin-left: 6px; }
.dark .item-name small { color: var(--text-dark); }
.item-text { display: grid; grid-template-rows: 0fr; font-size: 15px; color: var(--grey); transition: grid-template-rows .5s var(--ease); overflow: hidden; }
.dark .item-text { color: var(--text-dark); }
.item-text > span { overflow: hidden; min-height: 0; }
.item.on .item-text { grid-template-rows: 1fr; margin-top: 4px; }
@media (max-width: 1023px) { .ls { grid-template-columns: 1fr; } .stack { height: 360px; } }
@media (max-width: 767px) { .stack { height: 300px; } .layer { width: 200px; } }
</style>
