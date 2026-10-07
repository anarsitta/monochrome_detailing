import { onMounted, onUnmounted, nextTick } from 'vue'
import { gsap, ScrollTrigger, reducedMotion } from '../gsap'

/**
 * Спокойное появление блоков при прокрутке, один раз.
 *   data-anim="lines" | "fade" | "wipe" — блок мягко проявляется и чуть поднимается
 *   data-anim="stagger" — то же для дочерних элементов, по очереди
 * Элементы, уже обработанные вложенными компонентами, пропускаются.
 */
export function useReveal(rootRef) {
  let ctx

  onMounted(async () => {
    await nextTick()
    const root = rootRef.value
    if (!root) return
    const q = (sel) => [...root.querySelectorAll(sel)].filter((el) => !el.hasAttribute('data-anim-done')).map((el) => { el.setAttribute('data-anim-done', ''); return el })

    if (reducedMotion()) {
      gsap.set(q('[data-anim]'), { autoAlpha: 1 })
      return
    }

    ctx = gsap.context(() => {
      q('[data-anim="lines"], [data-anim="fade"], [data-anim="wipe"]').forEach((el) => {
        gsap.fromTo(el, { autoAlpha: 0, y: 16 }, {
          autoAlpha: 1, y: 0, duration: 0.7, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      })
      q('[data-anim="stagger"]').forEach((el) => {
        gsap.set(el, { autoAlpha: 1 })
        gsap.fromTo(el.children, { autoAlpha: 0, y: 16 }, {
          autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.06, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, root)

    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh())
  })

  onUnmounted(() => ctx && ctx.revert())
}
