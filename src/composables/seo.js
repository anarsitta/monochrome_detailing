import { useHead } from '@unhead/vue'
import data from '../data'

const { site, contacts } = data

export function useSeo({ title, description, path, image = 'og-home.jpg', jsonld = [], noindex = false }) {
  const url = site.url + path
  useHead({
    title,
    htmlAttrs: { lang: 'ru' },
    meta: [
      { name: 'description', content: description },
      noindex ? { name: 'robots', content: 'noindex' } : {},
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'MONOCHROME' },
      { property: 'og:locale', content: 'ru_RU' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      { property: 'og:image', content: `${site.url}/img/${image}` },
    ],
    link: [{ rel: 'canonical', href: url }],
    script: jsonld.map((j) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(j) })),
  })
}

export const PAGES = {
  home: { path: '/', title: 'Главная' },
  film: { path: '/okleyka-plenkoy-yaroslavl/', title: 'Оклейка плёнкой' },
  antikor: { path: '/antikor-yaroslavl/', title: 'Антикор' },
}

export const localBusiness = () => ({
  '@context': 'https://schema.org',
  '@type': 'AutomotiveBusiness',
  '@id': site.url + '/#business',
  name: 'MONOCHROME',
  description: site.descriptor,
  url: site.url + '/',
  telephone: contacts.phoneHref.replace('tel:', ''),
  image: site.url + '/img/og-home.jpg',
  address: { '@type': 'PostalAddress', streetAddress: contacts.address.replace(/^Ярославль,\s*/, ''), addressLocality: 'Ярославль', addressCountry: 'RU' },
  geo: { '@type': 'GeoCoordinates', latitude: contacts.geo.lat, longitude: contacts.geo.lon },
  openingHours: contacts.hoursSchema,
  sameAs: [contacts.telegram, contacts.vk],
})

export const serviceSchema = (page, name, serviceType, offers) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  serviceType,
  provider: { '@id': site.url + '/#business', '@type': 'AutomotiveBusiness', name: 'MONOCHROME' },
  areaServed: { '@type': 'City', name: 'Ярославль' },
  url: site.url + PAGES[page].path,
  ...(offers ? { offers } : {}),
})

export const breadcrumbSchema = (page) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Главная', item: site.url + '/' },
    { '@type': 'ListItem', position: 2, name: PAGES[page].title, item: site.url + PAGES[page].path },
  ],
})

export const faqSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
})
