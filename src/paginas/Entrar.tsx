import { useState, type FormEvent } from "react"

import { Animacao } from "../componentes/Animacao"
import { Aviso, Campo } from "../componentes/Interface"
import { Marca } from "../componentes/Marca"
import { useAutenticacao } from "../contexto/Autenticacao"

export function Entrar() {
  const { entrar, cadastrar } = useAutenticacao()
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar")
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [senha, setSenha] = useState("")
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    setSucesso(null)
    setEnviando(true)
    try {
      if (modo === "entrar") {
        await entrar(email.trim(), senha)
      } else {
        await cadastrar(nome.trim(), email.trim(), senha)
        setSucesso("Acesso criado. Confirme seu e-mail e depois entre.")
        setModo("entrar")
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível concluir.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-tinta-900 px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex flex-col items-center text-center">
          <Animacao tamanho={132} alternativa={<Marca tamanho={96} />} />
          <h1 className="mt-3 font-titulo text-2xl font-bold text-white">
            Fonte de Água da Vida
          </h1>
          <p className="mt-1 text-agua-200">Gestão da ação social</p>
        </div>

        <div className="cartao p-7">
          <h2 className="text-2xl">{modo === "entrar" ? "Entrar" : "Criar acesso"}</h2>

          <form onSubmit={enviar} className="mt-5 space-y-4">
            {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
            {sucesso ? <Aviso tipo="sucesso">{sucesso}</Aviso> : null}

            {modo === "cadastrar" ? (
              <Campo rotulo="Nome completo">
                <input
                  className="campo"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  required
                  autoComplete="name"
                />
              </Campo>
            ) : null}

            <Campo rotulo="E-mail">
              <input
                type="email"
                className="campo"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
                required
                autoComplete="email"
              />
            </Campo>

            <Campo rotulo="Senha">
              <input
                type="password"
                className="campo"
                value={senha}
                onChange={(evento) => setSenha(evento.target.value)}
                required
                minLength={6}
                autoComplete={modo === "entrar" ? "current-password" : "new-password"}
              />
            </Campo>

            <button type="submit" className="botao-primario w-full" disabled={enviando}>
              {enviando ? "Aguarde..." : modo === "entrar" ? "Entrar" : "Criar acesso"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setModo(modo === "entrar" ? "cadastrar" : "entrar")
              setErro(null)
              setSucesso(null)
            }}
            className="mt-5 w-full text-sm font-semibold text-agua-700 underline underline-offset-4"
          >
            {modo === "entrar" ? "Criar um acesso" : "Já tenho acesso"}
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-agua-200/55">
          Bairro São João — Araguaína, Tocantins
        </p>
      </div>
    </div>
  )
}
