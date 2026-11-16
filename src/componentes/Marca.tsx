import { useState } from "react"

import { IconeAgua } from "./Icones"

export function Marca({
  tamanho = 48,
  className = "",
}: {
  tamanho?: number
  className?: string
}) {
  const [falhou, setFalhou] = useState(false)

  if (falhou) {
    return (
      <span
        className={`anel-marca grid shrink-0 place-items-center rounded-full ${className}`}
        style={{ width: tamanho, height: tamanho }}
      >
        <span
          className="grid place-items-center rounded-full bg-tinta-900 text-agua-200"
          style={{ width: tamanho - 6, height: tamanho - 6 }}
        >
          <IconeAgua style={{ width: tamanho * 0.5, height: tamanho * 0.5 }} />
        </span>
      </span>
    )
  }

  return (
    <img
      src="/logo.png"
      width={tamanho}
      height={tamanho}
      onError={() => setFalhou(true)}
      alt="Logo da Igreja Assembleia de Deus Madureira Fonte de Água da Vida"
      className={`shrink-0 rounded-full object-contain ${className}`}
      style={{ width: tamanho, height: tamanho }}
    />
  )
}
