export function formatarData(valor: string | null | undefined) {
  if (!valor) return "—"
  const [ano, mes, dia] = valor.slice(0, 10).split("-")
  if (!ano || !mes || !dia) return "—"
  return `${dia}/${mes}/${ano}`
}

export function hoje() {
  const agora = new Date()
  const deslocado = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000)
  return deslocado.toISOString().slice(0, 10)
}

export function primeiroDiaDoMes() {
  return `${hoje().slice(0, 7)}-01`
}

export function diferencaEmDias(inicio: string, fim: string | null) {
  const partida = new Date(`${inicio}T00:00:00`)
  const chegada = new Date(`${fim ?? hoje()}T00:00:00`)
  return Math.max(0, Math.round((chegada.getTime() - partida.getTime()) / 86400000))
}

export function telefoneFormatado(valor: string | null | undefined) {
  if (!valor) return "—"
  const digitos = valor.replace(/\D/g, "")
  if (digitos.length === 11) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`
  }
  if (digitos.length === 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`
  }
  return valor
}

export function textoParaCsv(linhas: (string | number | null)[][]) {
  return linhas
    .map((linha) =>
      linha
        .map((celula) => {
          const texto = celula === null || celula === undefined ? "" : String(celula)
          return `"${texto.replace(/"/g, '""')}"`
        })
        .join(";"),
    )
    .join("\r\n")
}

export function baixarCsv(nome: string, linhas: (string | number | null)[][]) {
  const conteudo = `﻿${textoParaCsv(linhas)}`
  const blob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = nome
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}
