<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from './AppIcon.vue'
import Socials from './Socials.vue'
import data from '../data'
import { PAGES } from '../composables/seo'
import { useTrackContact } from '../composables/useTrackContact'
import { gsap, reducedMotion } from '../gsap'

const c = data.contacts
const route = useRoute()
const trackContact = useTrackContact()

const scrolled = ref(false)
const onDark = ref(false)
const headerEl = ref(null)
const dropOpen = ref(false)
const menuOpen = ref(false)
const menuEl = ref(null)
const burgerEl = ref(null)
const logoEl = ref(null)

const isService = computed(() => route.name === 'film' || route.name === 'antikor')
const here = (hash) => ({ path: route.path, hash })

// Шапка всегда сверху и подстраивает контраст под секцию, которая сейчас под ней
let raf = 0
function detectTheme() {
  raf = 0
  const h = headerEl.value ? headerEl.value.offsetHeight : 72
  const prev = headerEl.value ? headerEl.value.style.pointerEvents : ''
  if (headerEl.value) headerEl.value.style.pointerEvents = 'none'
  const el = document.elementFromPoint(window.innerWidth / 2, h + 2)
  if (headerEl.value) headerEl.value.style.pointerEvents = prev
  onDark.value = !!(el && el.closest('.dark, .site-footer'))
}
function onScroll() {
  scrolled.value = window.scrollY > 20
  if (!raf) raf = requestAnimationFrame(detectTheme)
}
function onDocClick(e) { if (!e.target.closest('.nav-drop')) dropOpen.value = false }
// Список услуг открывается при наведении и сворачивается, когда мышь уходит
let dropTimer
function dropEnter() { clearTimeout(dropTimer); dropOpen.value = true }
function dropLeave() { clearTimeout(dropTimer); dropTimer = setTimeout(() => { dropOpen.value = false }, 180) }
// Клавиатура: закрываем, когда фокус ушёл за пределы меню услуг
function dropFocusOut(e) { if (!e.currentTarget.contains(e.relatedTarget)) dropOpen.value = false }
function onKey(e) {
  if (e.key !== 'Escape') return
  dropOpen.value = false
  if (menuOpen.value) closeMenu()
}

// Блик по логотипу: при загрузке и при наведении
function shine() {
  if (!logoEl.value || reducedMotion()) return
  gsap.fromTo(logoEl.value, { '--shine': '-30%' }, { '--shine': '130%', duration: 1.4, ease: 'power2.inOut', overwrite: true })
}

async function openMenu() {
  menuOpen.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  if (!reducedMotion()) {
    gsap.fromTo(menuEl.value, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)', duration: 0.7, ease: 'expo.inOut' })
    gsap.fromTo(menuEl.value.querySelectorAll('.m-link'), { yPercent: 110 }, { yPercent: 0, duration: 0.8, stagger: 0.06, ease: 'expo.out', delay: 0.25 })
    gsap.fromTo(menuEl.value.querySelector('.mobile-menu-bottom'), { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, delay: 0.5 })
  }
  menuEl.value.querySelector('button, a').focus()
}
function closeMenu(returnFocus = true) {
  menuOpen.value = false
  document.body.style.overflow = ''
  if (returnFocus && burgerEl.value) burgerEl.value.focus()
}
function trapFocus(e) {
  if (e.key !== 'Tab') return
  const f = [...menuEl.value.querySelectorAll('a, button')]
  const first = f[0]
  const last = f[f.length - 1]
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
}

watch(() => route.fullPath, () => {
  dropOpen.value = false
  if (menuOpen.value) closeMenu(false)
  // После смены страницы подложка другая: перепроверяем после перехода
  setTimeout(detectTheme, 450)
})

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onKey)
  setTimeout(shine, 600)
})
onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onScroll)
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <header ref="headerEl" class="site-header" :class="{ 'is-scrolled': scrolled, 'on-dark': onDark }">
    <div class="container header-inner">
      <RouterLink class="logo" to="/" aria-label="MONOCHROME — на главную" @mouseenter="shine">
        <span ref="logoEl" class="logo-mask" aria-hidden="true" />
      </RouterLink>

      <nav class="nav" aria-label="Основное меню">
        <ul>
          <li><RouterLink class="nav-link" :to="{ path: '/', hash: '#about' }">О нас</RouterLink></li>
          <li class="nav-drop" @mouseenter="dropEnter" @mouseleave="dropLeave" @focusout="dropFocusOut">
            <button
              type="button"
              class="nav-link nav-drop-btn"
              :class="{ 'is-active': isService }"
              :aria-expanded="String(dropOpen)"
              aria-controls="drop-services"
              @click="dropEnter"
            >Услуги <span class="chev" aria-hidden="true" /></button>
            <div id="drop-services" class="nav-drop-panel">
              <RouterLink class="drop-card" :to="PAGES.film.path">
                <img src="/img/hero-atelier.jpg" alt="" loading="lazy">
                <span><b>Оклейка плёнкой</b><small>Прозрачная защита кузова</small></span>
              </RouterLink>
              <RouterLink class="drop-card" :to="PAGES.antikor.path">
                <img src="/img/antikor-underbody.jpg" alt="" loading="lazy">
                <span><b>Антикор</b><small>Днище, арки и полости</small></span>
              </RouterLink>
            </div>
          </li>
          <li><RouterLink class="nav-link" :to="route.name === 'home' ? '#map' : here('#process')">{{ route.name === 'home' ? 'Как найти' : 'Этапы' }}</RouterLink></li>
          <li><RouterLink class="nav-link" :to="here('#contacts')">Контакты</RouterLink></li>
        </ul>
      </nav>

      <a class="header-phone" :href="c.phoneHref" @click="trackContact('phone')">
        <span class="status" aria-hidden="true" />{{ c.phone }}
      </a>
      <button
        ref="burgerEl"
        class="burger"
        type="button"
        aria-label="Открыть меню"
        :aria-expanded="String(menuOpen)"
        aria-controls="mobile-menu"
        @click="openMenu"
      ><span /><span /></button>
    </div>
  </header>

  <div
    v-show="menuOpen"
    id="mobile-menu"
    ref="menuEl"
    class="mobile-menu"
    role="dialog"
    aria-modal="true"
    aria-label="Меню"
    @keydown="trapFocus"
  >
    <div class="mobile-menu-top">
      <span class="logo-mask logo-mask-light" aria-hidden="true" />
      <button class="icon-btn" type="button" aria-label="Закрыть меню" @click="closeMenu()"><AppIcon name="close" /></button>
    </div>
    <nav aria-label="Мобильное меню">
      <span class="m-wrap"><RouterLink class="m-link" :to="{ path: '/', hash: '#about' }">О нас</RouterLink></span>
      <span class="m-wrap"><RouterLink class="m-link" :to="PAGES.film.path">Оклейка плёнкой</RouterLink></span>
      <span class="m-wrap"><RouterLink class="m-link" :to="PAGES.antikor.path">Антикор</RouterLink></span>
      <span class="m-wrap"><RouterLink class="m-link" :to="{ path: '/', hash: '#map' }">Как нас найти</RouterLink></span>
      <span class="m-wrap"><RouterLink class="m-link" :to="here('#contacts')" @click="closeMenu(false)">Контакты</RouterLink></span>
    </nav>
    <div class="mobile-menu-bottom">
      <a class="mobile-phone" :href="c.phoneHref" @click="trackContact('phone')">{{ c.phone }}</a>
      <p>{{ c.hours }}</p>
      <Socials />
    </div>
  </div>
</template>

<style scoped>
.site-header {
  position: fixed; inset: 0 0 auto; z-index: 50;
  transition: background-color .35s var(--ease), box-shadow .35s var(--ease), transform .45s var(--ease);
}
/* Полноценная полоса меню: всегда с фоном и разделителем */
.site-header {
  color: var(--ink);
  background: #F3F0EA;
  border-bottom: 1px solid var(--line);
  transition: background-color .4s var(--ease), color .4s var(--ease), border-color .4s var(--ease), box-shadow .4s var(--ease);
}
.site-header.is-scrolled { box-shadow: 0 10px 30px -18px rgba(23, 23, 23, .35); }
.header-inner { display: flex; align-items: center; gap: 28px; height: 72px; }

/* Логотип: PNG как маска, по ней проходит хромированный блик */
.logo { position: relative; flex: none; display: flex; align-items: center; width: 210px; height: 44px; }
.logo-mask {
  --shine: -30%;
  display: block; width: 100%; aspect-ratio: 1216 / 115;
  -webkit-mask: url('/img/logo.png') center / contain no-repeat;
  mask: url('/img/logo.png') center / contain no-repeat;
  background:
    linear-gradient(105deg, transparent calc(var(--shine) - 12%), rgba(255,255,255,.95) var(--shine), transparent calc(var(--shine) + 12%)),
    linear-gradient(180deg, #2a2a2a, #0f0f0f 60%, #3a3a3a);
  transition: transform .5s var(--ease), opacity .4s var(--ease);
}
.logo-mask-light { width: 170px; background: linear-gradient(180deg, #fff, #cfcac2); }
.logo-mark {
  position: absolute; left: 0; top: 50%; width: 44px; aspect-ratio: 212 / 120; translate: 0 -50%;
  -webkit-mask: url('/img/logo-mark.png') center / contain no-repeat;
  mask: url('/img/logo-mark.png') center / contain no-repeat;
  background: var(--ink); opacity: 0; transform: scale(.6); transition: opacity .4s var(--ease), transform .5s var(--ease);
}

.nav { margin: 0 auto; }
.nav > ul { display: flex; gap: 4px; }
/* Пункт меню подсвечивается плашкой при наведении, активный — постоянно */
.nav-link { position: relative; display: inline-flex; align-items: center; gap: 8px; min-height: 40px; padding: 0 16px; border-radius: 999px; font-size: 15px; font-weight: 500; transition: background-color .3s var(--ease), color .3s var(--ease); }
.nav-link:hover, .nav-drop-btn[aria-expanded="true"] { background: rgba(23, 23, 23, .08); }
.nav-drop-btn.is-active { background: var(--ink); color: var(--milk); }
.on-dark .nav-link:hover, .on-dark .nav-drop-btn[aria-expanded="true"] { background: rgba(243, 240, 234, .12); }
.on-dark .nav-drop-btn.is-active { background: var(--milk); color: var(--ink); }
.chev { width: 7px; height: 7px; border-right: 1.5px solid currentColor; border-bottom: 1.5px solid currentColor; transform: translateY(-2px) rotate(45deg); transition: transform .3s var(--ease); }
.nav-drop-btn[aria-expanded="true"] .chev { transform: translateY(1px) rotate(-135deg); }
.nav-drop { position: relative; }
.nav-drop-panel {
  position: absolute; top: calc(100% + 10px); left: 50%; width: 520px; translate: -50% 0;
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px; padding: 10px;
  background: var(--white); border-radius: var(--radius-lg); box-shadow: 0 30px 60px -20px rgba(23,23,23,.25);
  opacity: 0; visibility: hidden; transform: translateY(8px); transition: opacity .3s var(--ease), transform .4s var(--ease), visibility .3s;
}
.nav-drop-btn[aria-expanded="true"] + .nav-drop-panel { opacity: 1; visibility: visible; transform: none; }
/* Невидимый мостик между кнопкой и панелью, чтобы список не закрывался на пути мыши */
.nav-drop-panel::before { content: ''; position: absolute; left: 0; right: 0; top: -14px; height: 14px; }
.drop-card { display: flex; flex-direction: column; gap: 12px; padding: 8px; border-radius: 10px; transition: background-color .3s var(--ease); }
.drop-card { color: var(--ink); border: 1.5px solid transparent; transition: background-color .3s var(--ease), border-color .3s var(--ease); }
.drop-card:hover { background: var(--milk); border-color: var(--accent); }
.drop-card.router-link-exact-active { background: var(--milk); }
.drop-card:hover b { color: var(--accent-dark); }
.drop-card img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; border-radius: 6px; transition: transform .6s var(--ease); }
.drop-card:hover img { transform: scale(1.03); }
.drop-card b { display: block; font-family: var(--display); font-weight: 500; font-size: 19px; }
.drop-card small { display: block; color: var(--grey); font-size: 14px; }

/* Телефон — контрастная кнопка-пилюля */
.header-phone {
  flex: none; display: inline-flex; align-items: center; gap: 10px; min-height: 44px; padding: 10px 20px;
  border-radius: 999px; background: var(--ink); color: var(--milk); font-weight: 500; font-size: 15px;
  transition: background-color .3s var(--ease), color .3s var(--ease);
}
.header-phone:hover { background: var(--accent); color: #fff; }
.status { width: 8px; height: 8px; border-radius: 50%; background: #3BA55C; box-shadow: 0 0 0 3px rgba(59,165,92,.25); }

/* Над тёмными секциями полоса становится тёмной */
.on-dark { color: var(--milk); background: #171717; border-bottom-color: var(--line-dark); }
.on-dark .logo-mask { background: linear-gradient(105deg, transparent calc(var(--shine) - 12%), #fff var(--shine), transparent calc(var(--shine) + 12%)), linear-gradient(180deg, #f3f0ea, #bdb7ae); }
.on-dark .burger span { background: var(--milk); }
.on-dark .header-phone { background: var(--milk); color: var(--ink); }
.on-dark .header-phone:hover { background: var(--accent); color: #fff; }

.burger { display: none; width: 44px; height: 44px; margin-left: auto; position: relative; }
.burger span { position: absolute; left: 10px; right: 10px; height: 1.5px; background: var(--ink); transition: transform .3s var(--ease); }
.burger span:first-child { top: 17px; } .burger span:last-child { top: 26px; }
.burger:hover span:first-child { transform: translateX(4px); }

.mobile-menu { position: fixed; inset: 0; z-index: 100; background: var(--ink); color: var(--milk); display: flex; flex-direction: column; padding: 14px var(--gutter) 32px; overflow-y: auto; }
.mobile-menu-top { display: flex; align-items: center; justify-content: space-between; min-height: 48px; }
.icon-btn { width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; }
.mobile-menu nav { display: flex; flex-direction: column; margin: 48px 0; }
.m-wrap { display: block; overflow: hidden; border-bottom: 1px solid var(--line-dark); }
.m-link { display: block; font-family: var(--display); font-weight: 500; font-size: clamp(30px, 8vw, 44px); line-height: 1.15; padding: 14px 0; }
.m-link.router-link-exact-active { color: var(--accent); }
.mobile-menu-bottom { margin-top: auto; }
.mobile-phone { font-family: var(--display); font-size: 26px; font-weight: 500; display: inline-block; padding: 8px 0; }
.mobile-menu-bottom p { color: var(--text-dark); margin-bottom: 16px; }

@media (max-width: 1100px) { .nav-link { padding: 0 10px; } .header-phone .status { display: none; } }
@media (max-width: 1023px) {
  .nav, .header-phone { display: none; }
  .burger { display: block; }
  .logo { width: 170px; }
  .site-header .header-inner { height: var(--header-h); }
}
</style>
