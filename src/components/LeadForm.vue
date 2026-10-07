<script setup>
import { ref, reactive, computed, nextTick, watch } from 'vue'
import AppIcon from './AppIcon.vue'
import data from '../data'
import { from } from '../utils'
import { selection } from '../composables/selection'
import { track, getClientId, getSource } from '../composables/analytics'

const props = defineProps({
  service: { type: String, required: true }, // home | film | antikor
  options: { type: Array, default: () => [] },
  optionLabel: { type: String, default: '' },
  title: { type: String, default: '' },
  lead: { type: String, default: '' },
  submit: { type: String, default: 'Отправить заявку' },
  light: { type: Boolean, default: false },
})

const c = data.contacts
const uid = props.service
const extended = props.service !== 'home'
const prefix = extended ? 'service_' : ''
const MAX_FILES = 5
const MAX_SIZE = 10 * 1024 * 1024
const EXT = /\.(jpe?g|png|heic)$/i
const directions = [
  { id: 'film', name: 'Оклейка плёнкой' },
  { id: 'antikor', name: 'Антикор' },
  { id: 'both', name: 'Обе услуги' },
  { id: 'consult', name: 'Пока не знаю' },
]

const f = reactive({ name: '', phone: '', car: '', year: '', comment: '', consent: false, dir: 'film', website: '' })
const errors = reactive({})
const files = ref([])
const filesError = ref('')
const fileInput = ref(null)
const summary = ref('')
const deliveryFailed = ref(false)
const sending = ref(false)
const sent = ref(false)
const successEl = ref(null)
const formEl = ref(null)
let started = false

// Выбор синхронизирован с калькулятором на странице
const option = computed({
  get: () => (props.service === 'film' ? selection.filmPackage : props.service === 'antikor' ? selection.antikorCondition : f.dir),
  set: (v) => {
    if (props.service === 'film') selection.filmPackage = v
    else if (props.service === 'antikor') selection.antikorCondition = v
    else f.dir = v
  },
})
const chips = computed(() => (extended ? props.options : directions))

// Главная: универсальная форма — услуга (одна или обе), затем варианты внутри
const svc = computed(() => (extended ? props.service : f.dir))
const hasFilm = computed(() => svc.value === 'film' || svc.value === 'both')
const hasAntikor = computed(() => svc.value === 'antikor' || svc.value === 'both')
const showFilm = computed(() => !extended && hasFilm.value)
const showAntikor = computed(() => !extended && hasAntikor.value)

// Отдельные детали: список для выбора, ранее отмеченные в калькуляторе переносятся
const zoneById = Object.fromEntries(data.filmZones.map((z) => [z.id, z]))
function toggleZone(id) {
  const s = new Set(selection.filmZoneIds)
  s.has(id) ? s.delete(id) : s.add(id)
  selection.filmZoneIds = data.filmZones.map((z) => z.id).filter((x) => s.has(x))
  selection.filmZones = selection.filmZoneIds.map((x) => zoneById[x].name).join(', ')
}
const customMin = data.filmPackages.find((p) => p.id === 'custom').price
const customPrice = computed(() => Math.max(selection.filmZoneIds.reduce((a, id) => a + zoneById[id].price, 0), customMin))

// На главной подставляем выбор, сделанный на странице услуги
if (!extended) {
  watch(() => [selection.homeDir, selection.homeNote], ([d, n]) => {
    if (d) f.dir = d
    if (n) f.comment = n
  }, { immediate: true })
}
// Сводка выбора с ценой: по строке на каждую выбранную услугу
const choices = computed(() => {
  const out = []
  const both = svc.value === 'both'
  if (hasFilm.value) {
    const p = data.filmPackages.find((x) => x.id === selection.filmPackage)
    if (p) out.push({ key: 'film', name: (both ? 'Оклейка: ' : '') + p.name, note: p.id === 'custom' ? selection.filmZones || 'детали не выбраны' : p.items, price: from(p.id === 'custom' ? customPrice.value : p.price) })
  }
  if (hasAntikor.value) {
    const s = data.antikorScenarios.find((x) => x.id === selection.antikorCondition)
    const t = data.carTypes.find((x) => x.id === selection.carType)
    if (s) out.push({ key: 'antikor', name: (both ? 'Антикор: ' : '') + s.name, note: t ? t.name : '', price: from(s.prices[selection.carType]) })
  }
  return out
})
const submitLabel = computed(() => {
  if (props.service !== 'antikor') return props.submit
  const s = data.antikorScenarios.find((x) => x.id === selection.antikorCondition)
  return s ? s.cta : props.submit
})

function onStart() {
  if (started) return
  started = true
  track(prefix + 'form_start', extended ? { service: props.service, option_id: option.value } : { option_id: f.dir })
}

function formatPhone(v) {
  let d = v.replace(/\D/g, '')
  if (!d) return ''
  if (d[0] === '8') d = '7' + d.slice(1)
  if (d[0] !== '7') d = '7' + d
  d = d.slice(0, 11)
  let o = '+7'
  if (d.length > 1) o += ' (' + d.slice(1, 4)
  if (d.length >= 4) o += ')'
  if (d.length > 4) o += ' ' + d.slice(4, 7)
  if (d.length > 7) o += '-' + d.slice(7, 9)
  if (d.length > 9) o += '-' + d.slice(9, 11)
  return o
}
const onPhone = (e) => { f.phone = formatPhone(e.target.value) }
const onPhoneFocus = () => { if (!f.phone) f.phone = '+7 (' }
const onPhoneBlur = () => { if (f.phone.replace(/\D/g, '').length <= 1) f.phone = '' }
const onYear = (e) => { f.year = e.target.value.replace(/\D/g, '').slice(0, 4) }

function onFiles(e) {
  const arr = [...e.target.files]
  let msg = ''
  if (arr.length > MAX_FILES) msg = 'Можно прикрепить не больше 5 фото.'
  else if (arr.some((x) => x.size > MAX_SIZE)) msg = 'Каждый файл должен быть не больше 10 МБ.'
  else if (arr.some((x) => !EXT.test(x.name))) msg = 'Подходят только JPG, PNG или HEIC.'
  filesError.value = msg
  files.value = msg ? [] : arr
  if (msg) e.target.value = ''
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])
  const name = f.name.trim()
  if (name.length < 2) errors.name = 'Укажите имя'
  else if (name.length > 60) errors.name = 'Имя слишком длинное'
  if (f.phone.replace(/\D/g, '').length < 11) errors.phone = 'Укажите телефон полностью'
  if (extended && f.car.trim().length < 2) errors.car = 'Укажите марку и модель'
  if (f.year) {
    const y = Number(f.year)
    const max = new Date().getFullYear() + 1
    if (y < 1950 || y > max) errors.year = 'Год от 1950 до ' + max
  }
  if (!f.consent) errors.consent = 'Нужно согласие на обработку данных'
  return Object.keys(errors)
}

async function onSubmit() {
  if (sending.value) return
  deliveryFailed.value = false
  const bad = validate()
  if (bad.length) {
    summary.value = 'Проверьте поля: ' + bad.map((k) => errors[k].toLowerCase()).join('; ') + '.'
    await nextTick()
    const el = formEl.value.querySelector('[aria-invalid="true"]')
    el && el.focus()
    track(prefix + 'form_error', extended ? { service: props.service, error_type: 'validation' } : { error_type: 'validation' })
    return
  }
  summary.value = ''
  track(prefix + 'form_submit', extended ? { service: props.service, option_id: option.value } : { option_id: f.dir })

  const src = getSource()
  const fd = new FormData()
  fd.append('name', f.name.trim())
  fd.append('phone', f.phone)
  fd.append('comment', f.comment)
  fd.append('consent', '1')
  fd.append('website', f.website)
  fd.append('service', extended ? props.service : f.dir)
  fd.append('car', f.car.trim())
  fd.append('year', f.year)
  files.value.forEach((file) => fd.append('photos[]', file))
  if (hasFilm.value) {
    fd.append('package_id', selection.filmPackage)
    if (selection.filmPackage === 'custom') fd.append('zones', selection.filmZones)
  }
  if (hasAntikor.value) {
    fd.append('condition_id', selection.antikorCondition)
    fd.append('car_type', selection.carType)
  }
  fd.append('page_url', location.href)
  fd.append('referrer', src.referrer)
  fd.append('utm', src.utm)
  fd.append('ts', new Date().toISOString())

  sending.value = true
  fd.append('client_id', await getClientId())

  let ok = false
  let leadId = ''
  // Локальный просмотр без PHP-сервера: имитация успешной отправки
  const demo = /^(localhost|127\.0\.0\.1|192\.168\.)/.test(location.hostname)
  if (demo) {
    console.info('[MONOCHROME] демо-режим, заявка не отправлена:', Object.fromEntries(fd))
    await new Promise((r) => setTimeout(r, 900))
    ok = true
    leadId = 'demo'
  } else {
    try {
      const res = await fetch(data.site.formEndpoint, { method: 'POST', body: fd, headers: { 'X-Requested-With': 'fetch' } })
      const j = await res.json().catch(() => ({ ok: false }))
      ok = !!j.ok
      leadId = j.lead_id || ''
      if (j.errors) Object.assign(errors, j.errors)
    } catch (e) {
      ok = false
    }
  }
  sending.value = false

  if (ok) {
    track(prefix + 'form_success', extended ? { service: props.service, lead_id: leadId } : { lead_id: leadId })
    sent.value = true
    selection.homeDir = ''
    selection.homeNote = ''
    await nextTick()
    successEl.value.focus()
  } else {
    deliveryFailed.value = true
    track(prefix + 'form_error', extended ? { service: props.service, error_type: 'delivery' } : { error_type: 'delivery' })
  }
}

function reset() {
  Object.assign(f, { name: '', phone: '', car: '', year: '', comment: '', consent: false, website: '' })
  files.value = []
  if (fileInput.value) fileInput.value.value = ''
  sent.value = false
}

const errId = (k) => `f-${uid}-${k}-err`
</script>

<template>
  <form ref="formEl" class="lead-form" :class="{ light }" novalidate @submit.prevent="onSubmit" @focusin="onStart">
    <Transition name="swap" mode="out-in">
      <div v-if="!sent" key="form" class="form-body">
        <h3 v-if="title" class="form-title">{{ title }}</h3>
        <p v-if="lead" class="form-lead">{{ lead }}</p>
        <div class="hp" aria-hidden="true">
          <label>Не заполняйте это поле <input v-model="f.website" type="text" tabindex="-1" autocomplete="off"></label>
        </div>

        <fieldset class="chips">
          <legend class="chips-legend">{{ extended ? optionLabel : 'Что интересует' }}</legend>
          <label v-for="o in chips" :key="o.id" class="chip">
            <input v-model="option" type="radio" :name="`opt-${uid}`" :value="o.id">
            <span>{{ o.short || o.name }}</span>
          </label>
        </fieldset>

        <fieldset v-if="showFilm" class="chips">
          <legend class="chips-legend">Оклейка: вариант защиты</legend>
          <label v-for="p in data.filmPackages" :key="p.id" class="chip">
            <input v-model="selection.filmPackage" type="radio" :name="`film-${uid}`" :value="p.id">
            <span>{{ p.name }}</span>
          </label>
        </fieldset>
        <fieldset v-if="showFilm && selection.filmPackage === 'custom'" class="chips">
          <legend class="chips-legend">Какие детали закрыть плёнкой</legend>
          <label v-for="z in data.filmZones" :key="z.id" class="chip chip-sm">
            <input type="checkbox" :checked="selection.filmZoneIds.includes(z.id)" @change="toggleZone(z.id)">
            <span>{{ z.name }}</span>
          </label>
        </fieldset>
        <fieldset v-if="showAntikor" class="chips">
          <legend class="chips-legend">Антикор: состояние автомобиля</legend>
          <label v-for="s in data.antikorScenarios" :key="s.id" class="chip">
            <input v-model="selection.antikorCondition" type="radio" :name="`ak-${uid}`" :value="s.id">
            <span>{{ s.name }}</span>
          </label>
        </fieldset>
        <fieldset v-if="showAntikor" class="chips">
          <legend class="chips-legend">Тип автомобиля</legend>
          <label v-for="t in data.carTypes" :key="t.id" class="chip">
            <input v-model="selection.carType" type="radio" :name="`ct-${uid}`" :value="t.id">
            <span>{{ t.name }}</span>
          </label>
        </fieldset>

        <TransitionGroup name="swap" tag="div" class="choices">
          <div v-for="ch in choices" :key="ch.key" class="choice">
            <div>
              <p class="choice-name">{{ ch.name }}</p>
              <p class="choice-note">{{ ch.note }}</p>
            </div>
            <p class="choice-price">{{ ch.price }}</p>
          </div>
        </TransitionGroup>

        <div class="grid">
          <div class="field" :class="{ err: errors.name }">
            <input :id="`f-${uid}-name`" v-model="f.name" type="text" autocomplete="name" maxlength="60" placeholder=" " :aria-invalid="!!errors.name" :aria-describedby="errId('name')">
            <label :for="`f-${uid}-name`">Имя</label>
            <span class="bar" />
            <p :id="errId('name')" class="field-error">{{ errors.name }}</p>
          </div>
          <div class="field" :class="{ err: errors.phone }">
            <input
              :id="`f-${uid}-phone`" :value="f.phone" type="tel" inputmode="tel" autocomplete="tel" placeholder=" "
              :aria-invalid="!!errors.phone" :aria-describedby="errId('phone')"
              @input="onPhone" @focus="onPhoneFocus" @blur="onPhoneBlur"
            >
            <label :for="`f-${uid}-phone`">Телефон</label>
            <span class="bar" />
            <p :id="errId('phone')" class="field-error">{{ errors.phone }}</p>
          </div>
          <template v-if="!sent">
            <div class="field" :class="{ err: errors.car }">
              <input :id="`f-${uid}-car`" v-model="f.car" type="text" maxlength="80" placeholder=" " :aria-invalid="!!errors.car" :aria-describedby="errId('car')">
              <label :for="`f-${uid}-car`">{{ extended ? 'Марка и модель' : 'Марка и модель, необязательно' }}</label>
              <span class="bar" />
              <p :id="errId('car')" class="field-error">{{ errors.car }}</p>
            </div>
            <div class="field" :class="{ err: errors.year }">
              <input :id="`f-${uid}-year`" :value="f.year" type="text" inputmode="numeric" maxlength="4" placeholder=" " :aria-invalid="!!errors.year" :aria-describedby="errId('year')" @input="onYear">
              <label :for="`f-${uid}-year`">Год выпуска, необязательно</label>
              <span class="bar" />
              <p :id="errId('year')" class="field-error">{{ errors.year }}</p>
            </div>
          </template>
          <div class="field wide">
            <textarea :id="`f-${uid}-comment`" v-model="f.comment" rows="2" maxlength="1000" placeholder=" " />
            <label :for="`f-${uid}-comment`">{{ extended ? 'Что беспокоит, когда удобно приехать' : 'Комментарий, необязательно' }}</label>
            <span class="bar" />
          </div>
          <div class="wide">
            <label class="drop">
              <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/heic,.heic,.jpg,.jpeg,.png" multiple @change="onFiles">
              <span class="drop-icon"><AppIcon name="plus" /></span>
              <span><b>Прикрепить фото автомобиля</b><small>До 5 файлов, JPG, PNG или HEIC, до 10 МБ</small></span>
            </label>
            <ul v-if="files.length" class="file-list">
              <li v-for="file in files" :key="file.name">{{ file.name }}</li>
            </ul>
            <p class="field-error">{{ filesError }}</p>
          </div>
          <div class="wide" :class="{ err: errors.consent }">
            <label class="check">
              <input v-model="f.consent" type="checkbox" :aria-invalid="!!errors.consent" :aria-describedby="errId('consent')">
              <span class="box" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8.5l3 3 7-7" /></svg></span>
              <span>Согласен на <RouterLink to="/privacy/" target="_blank">обработку персональных данных</RouterLink></span>
            </label>
            <p :id="errId('consent')" class="field-error">{{ errors.consent }}</p>
          </div>
        </div>

        <div class="form-summary" role="alert" aria-live="assertive">
          <template v-if="summary">{{ summary }}</template>
          <template v-else-if="deliveryFailed">
            Не получилось отправить заявку. Попробуйте ещё раз или позвоните: <a :href="c.phoneHref">{{ c.phone }}</a>
          </template>
        </div>
        <button class="btn btn-primary submit" type="submit" :aria-busy="sending" :disabled="sending">
          <span v-if="sending" class="spinner" aria-hidden="true" />
          <span>{{ sending ? 'Отправляем…' : submitLabel }}</span>
          <AppIcon v-if="!sending" name="arrow" />
        </button>
      </div>

      <div v-else key="ok" ref="successEl" class="success" tabindex="-1">
        <svg class="success-check" viewBox="0 0 80 80" aria-hidden="true">
          <circle cx="40" cy="40" r="36" />
          <path d="M24 41l11 11 21-23" />
        </svg>
        <h3 class="form-title">Заявка у нас</h3>
        <p class="form-lead">Перезвоним с номера {{ c.phone }}, уточним детали и подберём время осмотра.</p>
        <div class="btn-row">
          <a class="btn btn-primary" :href="c.phoneHref">Позвонить сейчас</a>
          <button class="btn btn-ghost" type="button" @click="reset">Вернуться к странице</button>
        </div>
      </div>
    </Transition>
  </form>
</template>

<style scoped>
.lead-form { position: relative; background: var(--ink-2); color: var(--milk); border-radius: 20px; padding: clamp(28px, 4vw, 52px); border: 1px solid var(--line-dark); overflow: hidden; }
.lead-form::before { content: ''; position: absolute; width: 420px; height: 420px; right: -160px; top: -200px; border-radius: 50%; background: radial-gradient(circle, rgba(199,75,50,.28), transparent 70%); pointer-events: none; }
.form-title { position: relative; font-family: var(--display); font-weight: 500; font-size: clamp(28px, 2.6vw, 38px); line-height: 1.1; letter-spacing: -.015em; }
.form-lead { position: relative; margin-top: 10px; color: var(--text-dark); font-size: 16px; max-width: 46ch; }
.hp { position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; }

.chips { border: 0; padding: 0; margin: 28px 0 0; display: flex; flex-wrap: wrap; gap: 8px; min-width: 0; }
.chips-legend { width: 100%; font-size: 14px; color: var(--text-dark); padding: 0 0 12px; }
.chip { position: relative; cursor: pointer; }
.chip input { position: absolute; opacity: 0; pointer-events: none; }
.chip span { display: inline-flex; align-items: center; min-height: 44px; padding: 10px 18px; border-radius: 999px; font-size: 15px; font-weight: 500; border: 1px solid var(--line-dark); transition: background-color .3s var(--ease), color .3s var(--ease), border-color .3s var(--ease); }
.chip:hover span { border-color: rgba(243,240,234,.45); }
.chip input:checked + span { background: var(--milk); color: var(--ink); border-color: var(--milk); }
.chip input:focus-visible + span { outline: 2px solid var(--accent); outline-offset: 2px; }

.chip-sm span { min-height: 36px; padding: 6px 14px; font-size: 14px; }
.choices .choice + .choice { margin-top: 8px; }
.choice { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-top: 20px; padding: 16px 20px; border-radius: 12px; background: rgba(243,240,234,.06); border: 1px solid var(--line-dark); }
.choice-name { font-weight: 500; }
.choice-note { font-size: 14px; color: var(--text-dark); }
.choice-price { font-family: var(--display); font-weight: 500; font-size: 24px; white-space: nowrap; color: #F0A28F; }

.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 28px; margin-top: 18px; }
.wide { grid-column: 1 / -1; }
.field { position: relative; padding-top: 18px; }
.field input, .field textarea {
  width: 100%; padding: 12px 0 10px; font-size: 17px; background: transparent; border: 0; border-bottom: 1px solid rgba(243,240,234,.25); border-radius: 0; color: var(--milk); outline: none; resize: none;
}
.field label { position: absolute; left: 0; top: 30px; font-size: 17px; color: rgba(243,240,234,.55); pointer-events: none; transform-origin: left top; transition: transform .35s var(--ease), color .35s var(--ease); }
.field input:focus + label, .field input:not(:placeholder-shown) + label,
.field textarea:focus + label, .field textarea:not(:placeholder-shown) + label { transform: translateY(-24px) scale(.8); color: var(--text-dark); }
.bar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: var(--accent); transform: scaleX(0); transform-origin: left; transition: transform .45s var(--ease); }
.field textarea ~ .bar { bottom: 7px; }
.field input:focus ~ .bar, .field textarea:focus ~ .bar { transform: scaleX(1); }
.field input:focus-visible { outline: none; }
.err input, .err textarea { border-bottom-color: #F0A28F; }
.field-error { color: #F0A28F; font-size: 13px; margin-top: 6px; }
.field-error:empty { display: none; }
.field:not(:has(.field-error:not(:empty))) { padding-bottom: 6px; }

.drop { position: relative; display: flex; align-items: center; gap: 16px; padding: 16px 18px; margin-top: 10px; border-radius: 12px; border: 1px dashed rgba(243,240,234,.3); cursor: pointer; transition: border-color .3s, background-color .3s; }
.drop:hover { border-color: var(--accent); background: rgba(199,75,50,.08); }
.drop:focus-within { outline: 2px solid var(--accent); outline-offset: 2px; }
.drop input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.drop-icon { width: 40px; height: 40px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; background: rgba(243,240,234,.08); color: var(--accent); flex: none; }
.drop b { display: block; font-weight: 500; font-size: 15px; }
.drop small { display: block; font-size: 13px; color: var(--text-dark); }
.file-list { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.file-list li { font-size: 13px; padding: 4px 10px; border-radius: 999px; background: rgba(243,240,234,.08); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.check { position: relative; display: flex; gap: 14px; align-items: center; margin-top: 14px; font-size: 15px; color: var(--text-dark); cursor: pointer; min-height: 44px; }
.check input { position: absolute; opacity: 0; width: 22px; height: 22px; margin: 0; }
.box { width: 22px; height: 22px; flex: none; border-radius: 6px; border: 1.5px solid rgba(243,240,234,.4); display: inline-flex; align-items: center; justify-content: center; transition: background-color .25s, border-color .25s; }
.box svg { width: 14px; height: 14px; fill: none; stroke: var(--white); stroke-width: 2; stroke-dasharray: 16; stroke-dashoffset: 16; transition: stroke-dashoffset .35s var(--ease); }
.check input:checked + .box { background: var(--accent); border-color: var(--accent); }
.check input:checked + .box svg { stroke-dashoffset: 0; }
.check input:focus-visible + .box { outline: 2px solid var(--accent); outline-offset: 2px; }
.check a { color: var(--milk); text-decoration: underline; text-underline-offset: 3px; }

.form-summary:not(:empty) { margin-top: 18px; padding: 12px 16px; border-radius: 10px; background: rgba(240,162,143,.12); color: #F0A28F; font-size: 14px; }
.form-summary a { color: var(--milk); text-decoration: underline; }
.submit { width: 100%; margin-top: 26px; min-height: 62px; }
.submit::before { background: var(--milk); }
.submit:hover { color: var(--ink); }
.spinner { width: 18px; height: 18px; border-radius: 50%; border: 2px solid rgba(255,255,255,.35); border-top-color: #fff; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.success { position: relative; padding: 24px 0 8px; outline: none; }
.success-check { width: 84px; height: 84px; margin-bottom: 28px; fill: none; stroke: var(--accent); stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
.success-check circle { stroke-dasharray: 230; stroke-dashoffset: 230; animation: draw 1s var(--ease) forwards; }
.success-check path { stroke-dasharray: 60; stroke-dashoffset: 60; animation: draw .6s var(--ease) .7s forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
.success .btn-ghost { border-color: var(--line-dark); color: var(--milk); }
.success .btn-ghost::before { background: var(--milk); }
.success .btn-ghost:hover { color: var(--ink); }

.swap-enter-active, .swap-leave-active { transition: opacity .3s var(--ease), transform .4s var(--ease); }
.swap-enter-from { opacity: 0; transform: translateY(10px); }
.swap-leave-to { opacity: 0; transform: translateY(-10px); }

/* Светлый вариант формы (главная) */
.light { background: var(--white); color: var(--ink); border-color: var(--line); }
.light::before { display: none; }
.light .form-lead, .light .chips-legend, .light .choice-note, .light .drop small, .light .check { color: var(--grey); }
.light .chip span { border-color: var(--line-strong); }
.light .chip:hover span { border-color: var(--ink); }
.light .chip input:checked + span { background: var(--ink); color: var(--milk); border-color: var(--ink); }
.light .choice { background: var(--milk); border-color: var(--line); }
.light .choice-price { color: var(--accent-dark); }
.light .field input, .light .field textarea { color: var(--ink); border-bottom-color: var(--line-strong); }
.light .field label { color: var(--grey-2); }
.light .field input:focus + label, .light .field input:not(:placeholder-shown) + label,
.light .field textarea:focus + label, .light .field textarea:not(:placeholder-shown) + label { color: var(--grey); }
.light .err input, .light .err textarea { border-bottom-color: var(--accent); }
.light .field-error { color: var(--accent-dark); }
.light .drop { border-color: var(--line-strong); }
.light .drop-icon, .light .file-list li { background: var(--milk); }
.light .box { border-color: var(--line-strong); }
.light .check a, .light .form-summary a { color: var(--ink); }
.light .form-summary:not(:empty) { background: var(--accent-soft); color: var(--accent-dark); }
.light .submit::before { background: var(--ink); }
.light .submit:hover { color: var(--milk); }
.light .success .btn-ghost { border-color: var(--line-strong); color: var(--ink); }
.light .success .btn-ghost::before { background: var(--ink); }
.light .success .btn-ghost:hover { color: var(--milk); }

@media (max-width: 767px) { .grid { grid-template-columns: 1fr; } }
</style>
