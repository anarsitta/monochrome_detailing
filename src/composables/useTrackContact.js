import { useRoute } from 'vue-router'
import { track } from './analytics'

// contact_click на главной, service_contact_click на страницах услуг
export function useTrackContact() {
  const route = useRoute()
  return (type) => {
    const service = route.name === 'film' || route.name === 'antikor' ? route.name : null
    track(service ? 'service_contact_click' : 'contact_click', service ? { service, contact_type: type } : { contact_type: type })
  }
}
