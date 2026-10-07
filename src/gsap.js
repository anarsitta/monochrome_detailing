import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Плагины регистрируются один раз и только в браузере (SSG рендерит без DOM)
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText)
  gsap.defaults({ ease: 'power3.out', duration: 0.9 })
}

export const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export { gsap, ScrollTrigger, SplitText }
