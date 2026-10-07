import { ref, onMounted, onUnmounted } from 'vue'
import { reducedMotion } from '../gsap'

/**
 * Циклическое переключение элементов (зоны на схемах).
 * Пауза при наведении и когда блок вне экрана.
 */
export function useCycle(ids, { interval = 2600, root } = {}) {
  const index = ref(0)
  const current = ref(ids[0])
  const paused = ref(false)
  let timer
  let visible = false
  let io

  const tick = () => {
    if (paused.value || !visible) return
    index.value = (index.value + 1) % ids.length
    current.value = ids[index.value]
  }
  const set = (id) => {
    const i = ids.indexOf(id)
    if (i === -1) return
    index.value = i
    current.value = id
  }
  const pause = (id) => { paused.value = true; if (id) set(id) }
  const resume = () => { paused.value = false }

  onMounted(() => {
    if (reducedMotion()) return
    timer = setInterval(tick, interval)
    if (root && root.value && 'IntersectionObserver' in window) {
      io = new IntersectionObserver((en) => { visible = en[0].isIntersecting }, { threshold: 0.25 })
      io.observe(root.value)
    } else visible = true
  })
  onUnmounted(() => { clearInterval(timer); io && io.disconnect() })

  return { current, paused, set, pause, resume }
}
