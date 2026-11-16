import { DotLottieReact } from "@lottiefiles/dotlottie-react"
import { useEffect, useState, type ReactNode } from "react"

const CAMINHOS = ["/animacao-igreja.lottie", "/animacao-igreja.json"]

export function Animacao({
  tamanho = 140,
  alternativa,
}: {
  tamanho?: number
  alternativa: ReactNode
}) {
  const [indice, setIndice] = useState<number | null>(null)

  useEffect(() => {
    let ativo = true
    ;(async () => {
      for (let posicao = 0; posicao < CAMINHOS.length; posicao += 1) {
        try {
          const resposta = await fetch(CAMINHOS[posicao], { method: "HEAD" })
          const tipo = resposta.headers.get("content-type") ?? ""
          if (resposta.ok && !tipo.includes("text/html")) {
            if (ativo) setIndice(posicao)
            return
          }
        } catch {
          continue
        }
      }
      if (ativo) setIndice(-1)
    })()
    return () => {
      ativo = false
    }
  }, [])

  if (indice === null) {
    return <div style={{ width: tamanho, height: tamanho }} aria-hidden="true" />
  }

  if (indice < 0) return <>{alternativa}</>

  return (
    <DotLottieReact
      src={CAMINHOS[indice]}
      loop
      autoplay
      style={{ width: tamanho, height: tamanho }}
      aria-hidden="true"
    />
  )
}
