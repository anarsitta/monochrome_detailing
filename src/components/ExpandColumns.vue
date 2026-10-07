<script setup>
import { ref } from 'vue'

defineProps({
  columns: { type: Array, required: true }, // [{ title, tone: 'yes'|'no', note?, items: [{ title, text }] }]
  prefix: { type: String, required: true },
})

// По одному раскрытому пункту в каждой колонке, первый открыт сразу
const open = ref({ 0: 0, 1: 0 })
const toggle = (col, i) => { open.value[col] = open.value[col] === i ? -1 : i }
</script>

<template>
  <div class="cols" data-anim="stagger">
    <div v-for="(col, ci) in columns" :key="col.title" class="col" :class="col.tone">
      <div class="col-head">
        <span class="badge" aria-hidden="true">
          <svg v-if="col.tone === 'yes'" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          <svg v-else viewBox="0 0 24 24"><path d="M7 7l10 10M17 7L7 17" /></svg>
        </span>
        <h3 class="col-title">{{ col.title }}</h3>
      </div>
      <ul>
        <li v-for="(it, i) in col.items" :key="it.title" class="row" :class="{ open: open[ci] === i }">
          <h4>
            <button
              :id="`${prefix}-${ci}-${i}-q`"
              type="button"
              class="row-q"
              :aria-expanded="String(open[ci] === i)"
              :aria-controls="`${prefix}-${ci}-${i}`"
              @click="toggle(ci, i)"
            >
              <span>{{ it.title }}</span>
              <span class="plus" aria-hidden="true" />
            </button>
          </h4>
          <div :id="`${prefix}-${ci}-${i}`" class="row-a" role="region" :aria-labelledby="`${prefix}-${ci}-${i}-q`">
            <div><p>{{ it.text }}</p></div>
          </div>
        </li>
      </ul>
      <p v-if="col.note" class="note">{{ col.note }}</p>
    </div>
  </div>
</template>

<style scoped>
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.col { border-radius: 20px; padding: clamp(26px, 3.4vw, 48px); }
.col.yes { background: var(--white); }
.col.no { background: var(--milk-2); }
.col-head { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
.badge { width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; flex: none; }
.yes .badge { background: var(--accent); }
.no .badge { background: var(--ink); }
.badge svg { width: 22px; height: 22px; fill: none; stroke: #fff; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.col-title { font-family: var(--display); font-weight: 500; font-size: clamp(22px, 2vw, 28px); letter-spacing: -.015em; }
.row { border-top: 1px solid var(--line); }
.row h4 { font: inherit; }
.row-q { display: flex; justify-content: space-between; align-items: center; gap: 20px; width: 100%; min-height: 56px; padding: 12px 0; text-align: left; font-size: 18px; font-weight: 500; }
.row-q:hover { color: var(--accent-dark); }
.plus { position: relative; width: 28px; height: 28px; flex: none; border-radius: 50%; border: 1px solid var(--line-strong); transition: background-color .3s var(--ease), border-color .3s var(--ease), transform .45s var(--ease); }
.plus::before, .plus::after { content: ''; position: absolute; left: 50%; top: 50%; width: 10px; height: 1.5px; background: currentColor; translate: -50% -50%; }
.plus::after { rotate: 90deg; transition: rotate .45s var(--ease); }
.open .plus { background: var(--ink); border-color: var(--ink); color: var(--milk); transform: rotate(180deg); }
.open .plus::after { rotate: 0deg; }
.row-a { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .55s var(--ease); }
.row-a > div { overflow: hidden; }
.open .row-a { grid-template-rows: 1fr; }
.row-a p { padding: 0 48px 22px 0; color: #4A4744; font-size: 16px; max-width: 56ch; opacity: 0; transform: translateY(-6px); transition: opacity .4s var(--ease), transform .5s var(--ease); }
.open .row-a p { opacity: 1; transform: none; transition-delay: .1s; }
.note { margin-top: 20px; font-size: 15px; color: var(--grey); }
@media (max-width: 1023px) { .cols { grid-template-columns: 1fr; } }
@media (max-width: 767px) { .row-q { font-size: 16px; } .row-a p { padding-right: 0; } }
</style>
