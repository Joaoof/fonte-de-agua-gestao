import type { Session } from "@supabase/supabase-js"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

import { supabase } from "../lib/supabase"
import type { Perfil } from "../tipos"

type ContextoAutenticacao = {
  sessao: Session | null
  perfil: Perfil | null
  carregando: boolean
  eLideranca: boolean
  entrar: (email: string, senha: string) => Promise<void>
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>
  sair: () => Promise<void>
}

const Contexto = createContext<ContextoAutenticacao | null>(null)

export function ProvedorAutenticacao({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Session | null>(null)
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessao(data.session)
      setCarregando(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!sessao?.user) {
      setPerfil(null)
      return
    }
    let ativo = true
    supabase
      .from("perfis")
      .select("*")
      .eq("id", sessao.user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (ativo) setPerfil(data as Perfil | null)
      })
    return () => {
      ativo = false
    }
  }, [sessao])

  const valor = useMemo<ContextoAutenticacao>(
    () => ({
      sessao,
      perfil,
      carregando,
      eLideranca: perfil?.papel === "lideranca",
      entrar: async (email, senha) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
        if (error) throw new Error(traduzirErro(error.message))
      },
      cadastrar: async (nome, email, senha) => {
        const { error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: { data: { nome } },
        })
        if (error) throw new Error(traduzirErro(error.message))
      },
      sair: async () => {
        await supabase.auth.signOut()
      },
    }),
    [sessao, perfil, carregando],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

function traduzirErro(mensagem: string) {
  if (mensagem.includes("Invalid login credentials")) return "E-mail ou senha incorretos."
  if (mensagem.includes("Email not confirmed")) return "Confirme seu e-mail antes de entrar."
  if (mensagem.includes("User already registered")) return "Este e-mail já possui cadastro."
  if (mensagem.includes("Password should be")) return "A senha precisa ter ao menos 6 caracteres."
  if (mensagem.includes("valid email")) return "Informe um e-mail válido."
  return mensagem
}

export function useAutenticacao() {
  const contexto = useContext(Contexto)
  if (!contexto) throw new Error("useAutenticacao precisa estar dentro de ProvedorAutenticacao")
  return contexto
}
