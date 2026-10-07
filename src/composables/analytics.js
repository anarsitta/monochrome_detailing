import data from '../data'

const id = data.site.metrikaId

export function loadMetrika() {
  if (!id || typeof window === 'undefined' || window.ym) return
  window.ym = function () { (window.ym.a = window.ym.a || []).push(arguments) }
  window.ym.l = Date.now()
  const s = document.createElement('script')
  s.async = true
  s.src = 'https://mc.yandex.ru/metrika/tag.js'
  document.head.appendChild(s)
  window.ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true })
}

export function track(goal, params = {}) {
  try { if (id && window.ym) window.ym(id, 'reachGoal', goal, params) } catch (e) { /* аналитика не должна ломать страницу */ }
}

export function hit(url) {
  try { if (id && window.ym) window.ym(id, 'hit', url) } catch (e) { /* noop */ }
}

export function getClientId() {
  return new Promise((resolve) => {
    if (!id || !window.ym) return resolve('')
    try { window.ym(id, 'getClientID', resolve) } catch (e) { resolve('') }
    setTimeout(() => resolve(''), 500)
  })
}

// UTM и источник перехода сохраняются на время визита и уходят с заявкой
export function rememberSource() {
  try {
    const qs = new URLSearchParams(location.search)
    const utm = {}
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => { if (qs.get(k)) utm[k] = qs.get(k) })
    if (Object.keys(utm).length) sessionStorage.setItem('mc_utm', JSON.stringify(utm))
    if (sessionStorage.getItem('mc_ref') === null) sessionStorage.setItem('mc_ref', document.referrer || '')
  } catch (e) { /* storage недоступен */ }
}

export function getSource() {
  try { return { utm: sessionStorage.getItem('mc_utm') || '', referrer: sessionStorage.getItem('mc_ref') || document.referrer } }
  catch (e) { return { utm: '', referrer: document.referrer } }
}
