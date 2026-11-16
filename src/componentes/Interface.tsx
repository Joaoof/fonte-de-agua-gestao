import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react"
import { useEffect, type ReactNode } from "react"

export function Carregando({ texto = "Carregando..." }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-nevoa-500">
      <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
      <span role="status" className="text-lg">
        {texto}
      </span>
    </div>
  )
}

export function EstadoVazio({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-20 text-center">
      <div className="h-px w-16 bg-nevoa-300" />
      <h3 className="text-2xl">{titulo}</h3>
      <p className="max-w-md text-nevoa-600">{descricao}</p>
      {acao}
    </div>
  )
}

export function Aviso({ tipo, children }: { tipo: "erro" | "sucesso"; children: ReactNode }) {
  const erro = tipo === "erro"
  const Icone = erro ? AlertTriangle : CheckCircle2
  return (
    <div
      role={erro ? "alert" : "status"}
      className={`flex items-start gap-3 rounded-xl border-l-4 px-4 py-3 ${
        erro
          ? "border-critico-600 bg-critico-100 text-critico-600"
          : "border-bom-600 bg-bom-100 text-bom-600"
      }`}
    >
      <Icone className="mt-1 h-5 w-5 shrink-0" aria-hidden="true" />
      <span className="font-medium text-tinta-900">{children}</span>
    </div>
  )
}

export function Indicador({
  titulo,
  valor,
  detalhe,
  icone,
  tom = "agua",
  destaque,
}: {
  titulo: string
  valor: string | number
  detalhe?: string
  icone: ReactNode
  tom?: "agua" | "brasa" | "bom" | "atencao"
  destaque?: { texto: string; critico?: boolean }
}) {
  const tons = {
    agua: "bg-agua-100 text-agua-700",
    brasa: "bg-brasa-100 text-brasa-700",
    bom: "bg-bom-100 text-bom-600",
    atencao: "bg-atencao-100 text-atencao-600",
  }
  return (
    <div className="cartao flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="rotulo-mini">{titulo}</span>
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${tons[tom]}`}>
          {icone}
        </span>
      </div>
      <div>
        <p className="font-titulo text-[2.6rem] font-bold leading-none tabular-nums text-tinta-900">
          {valor}
        </p>
        {detalhe ? <p className="mt-1.5 text-sm text-nevoa-600">{detalhe}</p> : null}
      </div>
      {destaque ? (
        <span
          className={`etiqueta self-start ${
            destaque.critico
              ? "bg-critico-100 text-critico-600"
              : "bg-nevoa-200 text-tinta-700"
          }`}
        >
          {destaque.texto}
        </span>
      ) : null}
    </div>
  )
}

export function Modal({
  aberto,
  titulo,
  aoFechar,
  children,
}: {
  aberto: boolean
  titulo: string
  aoFechar: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!aberto) return
    const escutar = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") aoFechar()
    }
    window.addEventListener("keydown", escutar)
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", escutar)
      document.body.style.overflow = ""
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta-900/55 p-3 backdrop-blur-[2px] sm:p-8">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        className="w-full max-w-2xl rounded-2xl border border-nevoa-200 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-nevoa-200 px-6 py-4">
          <h2 className="text-2xl">{titulo}</h2>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-11 w-11 place-items-center rounded-xl text-nevoa-500 hover:bg-nevoa-200 hover:text-tinta-900"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

export function Campo({
  rotulo,
  children,
  dica,
}: {
  rotulo: string
  children: ReactNode
  dica?: string
}) {
  return (
    <label className="block">
      <span className="rotulo">{rotulo}</span>
      {children}
      {dica ? <span className="mt-1.5 block text-sm text-nevoa-600">{dica}</span> : null}
    </label>
  )
}

export function Etiqueta({ texto, cor }: { texto: string; cor: string }) {
  return <span className={`etiqueta ${cor}`}>{texto}</span>
}

export function Secao({
  titulo,
  descricao,
  acao,
  children,
}: {
  titulo: string
  descricao?: string
  acao?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl">{titulo}</h2>
          {descricao ? <p className="text-nevoa-600">{descricao}</p> : null}
        </div>
        {acao ? <div className="sem-impressao">{acao}</div> : null}
      </div>
      {children}
    </section>
  )
}
