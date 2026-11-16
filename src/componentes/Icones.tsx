import type { SVGProps } from "react"

type Props = SVGProps<SVGSVGElement>

const base = {
  xmlns: "http://www.w3.org/2000/svg",
  viewBox: "0 0 24 24",
  fill: "currentColor",
  "aria-hidden": true,
} as const

export function IconeIgreja(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M18 12.22V9l-5-2.5V5h2V3h-2V1h-2v2H9v2h2v1.5L6 9v3.22L2 14v8h8v-3c0-1.1.9-2 2-2s2 .9 2 2v3h8v-8zm-6 1.28c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5'/>` }} />
  )
}

export function IconeAjuda(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M20 17q.86 0 1.45.6t.58 1.4L14 22l-7-2v-9h1.95l7.27 2.69q.78.31.78 1.12q0 .47-.34.82t-.86.37H13l-1.75-.67l-.33.94L13 17zM16 3.23Q17.06 2 18.7 2q1.36 0 2.3 1t1 2.3q0 1.03-1 2.46t-1.97 2.39T16 13q-2.08-1.89-3.06-2.85t-1.97-2.39T10 5.3q0-1.36.97-2.3t2.34-1q1.6 0 2.69 1.23M.984 11H5v11H.984z'/>` }} />
  )
}

export function IconeCesta(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M22 18a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4v-2h6.79l2.76-4.77l1.56.9L19.87 16H22zM9 22H2c0-3 0-6 .33-9.17C2.6 10.3 3.08 7.66 3.6 5H3V3h5v2h-.6c.52 2.66 1 5.3 1.27 7.83C9 16 9 19 9 22'/>` }} />
  )
}

export function IconeCasaDeApoio(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='m2 12l10-9l10 9h-3v8H5v-8zm10 6l.72-.66C15.3 15 17 13.46 17 11.57c0-1.54-1.21-2.75-2.75-2.75c-.87 0-1.7.41-2.25 1.05a3 3 0 0 0-2.25-1.05C8.21 8.82 7 10.03 7 11.57c0 1.89 1.7 3.43 4.28 5.77z'/>` }} />
  )
}

export function IconeFamilias(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M12 5.5A3.5 3.5 0 0 1 15.5 9a3.5 3.5 0 0 1-3.5 3.5A3.5 3.5 0 0 1 8.5 9A3.5 3.5 0 0 1 12 5.5M5 8c.56 0 1.08.15 1.53.42c-.15 1.43.27 2.85 1.13 3.96C7.16 13.34 6.16 14 5 14a3 3 0 0 1-3-3a3 3 0 0 1 3-3m14 0a3 3 0 0 1 3 3a3 3 0 0 1-3 3c-1.16 0-2.16-.66-2.66-1.62a5.54 5.54 0 0 0 1.13-3.96c.45-.27.97-.42 1.53-.42M5.5 18.25c0-2.07 2.91-3.75 6.5-3.75s6.5 1.68 6.5 3.75V20h-13zM0 20v-1.5c0-1.39 1.89-2.56 4.45-2.9c-.59.68-.95 1.62-.95 2.65V20zm24 0h-3.5v-1.75c0-1.03-.36-1.97-.95-2.65c2.56.34 4.45 1.51 4.45 2.9z'/>` }} />
  )
}

export function IconeAtendimento(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M21 11.11V5a2 2 0 0 0-2-2h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14a2 2 0 0 0 2 2h6.11c1.26 1.24 2.98 2 4.89 2c3.87 0 7-3.13 7-7c0-1.91-.76-3.63-2-4.89M12 3c.55 0 1 .45 1 1s-.45 1-1 1s-1-.45-1-1s.45-1 1-1M6 7h12v2H6zm3.08 10H6v-2h3.08c-.05.33-.08.66-.08 1s.03.67.08 1M6 13v-2h5.11c-.61.57-1.07 1.25-1.43 2zm10 8c-2.76 0-5-2.24-5-5s2.24-5 5-5s5 2.24 5 5s-2.24 5-5 5m.5-4.75l2.86 1.69l-.75 1.22L15 17v-5h1.5z'/>` }} />
  )
}

export function IconeRelatorio(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2M9 17H7v-7h2zm4 0h-2V7h2zm4 0h-2v-4h2z'/>` }} />
  )
}

export function IconeVoluntario(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M12 15c-4.42 0-8 1.79-8 4v2h16v-2c0-2.21-3.58-4-8-4M8 9a4 4 0 0 0 4 4a4 4 0 0 0 4-4m-4.5-7c-.3 0-.5.21-.5.5v3h-1V3s-2.25.86-2.25 3.75c0 0-.75.14-.75 1.25h10c-.05-1.11-.75-1.25-.75-1.25C16.25 3.86 14 3 14 3v2.5h-1v-3c0-.29-.19-.5-.5-.5z'/>` }} />
  )
}

export function IconeAgua(props: Props) {
  return (
    <svg {...base} {...props} dangerouslySetInnerHTML={{ __html: `<path fill='currentColor' d='M12 20a6 6 0 0 1-6-6c0-4 6-10.75 6-10.75S18 10 18 14a6 6 0 0 1-6 6'/>` }} />
  )
}
