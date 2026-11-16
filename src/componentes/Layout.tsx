import { LogOut, Menu, X } from "lucide-react"
import { useState, type ReactNode } from "react"
import { NavLink, Outlet } from "react-router-dom"

import { useAutenticacao } from "../contexto/Autenticacao"
import { Marca } from "./Marca"
import {
  IconeAgua,
  IconeAtendimento,
  IconeCasaDeApoio,
  IconeCesta,
  IconeFamilias,
  IconeRelatorio,
  IconeVoluntario,
} from "./Icones"

const NAVEGACAO = [
  { para: "/", rotulo: "Painel", Icone: IconeAgua, exato: true },
  { para: "/familias", rotulo: "Famílias", Icone: IconeFamilias },
  { para: "/atendimentos", rotulo: "Atendimentos", Icone: IconeAtendimento },
  { para: "/cestas", rotulo: "Cestas básicas", Icone: IconeCesta },
  { para: "/casa-de-apoio", rotulo: "Casa de apoio", Icone: IconeCasaDeApoio },
  { para: "/voluntarios", rotulo: "Voluntários", Icone: IconeVoluntario },
  { para: "/relatorios", rotulo: "Relatórios", Icone: IconeRelatorio },
]

export function Layout() {
  const { perfil, sair } = useAutenticacao()
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50
          focus:rounded-xl focus:bg-agua-600 focus:px-5 focus:py-3 focus:font-semibold focus:text-white"
      >
        Ir para o conteúdo
      </a>

      <header className="sem-impressao sticky top-0 z-40 flex items-center justify-between border-b border-tinta-700 bg-tinta-900 px-4 py-3 text-white lg:hidden">
        <span className="flex items-center gap-2.5">
          <Marca tamanho={36} />
          <span className="font-titulo text-lg font-bold">Fonte de Água da Vida</span>
        </span>
        <button
          type="button"
          onClick={() => setMenuAberto((valor) => !valor)}
          aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuAberto}
          className="grid h-11 w-11 place-items-center rounded-xl hover:bg-tinta-700"
        >
          {menuAberto ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </header>

      <nav
        aria-label="Menu principal"
        className={`sem-impressao shrink-0 bg-tinta-900 text-white lg:sticky lg:top-0 lg:block
          lg:h-screen lg:w-[19rem] ${menuAberto ? "block" : "hidden"}`}
      >
        <div className="flex h-full flex-col">
          <div className="hidden items-center gap-3 border-b border-white/10 px-6 py-6 lg:flex">
            <Marca tamanho={52} />
            <span>
              <span className="block font-titulo text-lg font-bold leading-tight">
                Fonte de Água da Vida
              </span>
              <span className="block text-sm text-agua-200">Gestão da ação social</span>
            </span>
          </div>

          <ul className="flex-1 space-y-1 overflow-y-auto p-3">
            {NAVEGACAO.map(({ para, rotulo, Icone, exato }) => (
              <li key={para}>
                <NavLink
                  to={para}
                  end={exato}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    `flex min-h-[3.1rem] items-center gap-3 rounded-xl px-4 font-medium ${
                      isActive
                        ? "bg-white font-semibold text-tinta-900"
                        : "text-agua-100/85 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icone className="h-6 w-6 shrink-0" />
                  {rotulo}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/10 p-5">
            <p className="rotulo-mini text-agua-200">Conectado como</p>
            <p className="truncate font-semibold">{perfil?.nome ?? "..."}</p>
            <p className="mb-3 text-sm text-agua-200">
              {perfil?.papel === "lideranca" ? "Liderança" : "Voluntário"}
            </p>
            <button
              type="button"
              onClick={sair}
              className="flex min-h-[2.9rem] w-full items-center justify-center gap-2 rounded-xl
                border-2 border-white/25 font-semibold hover:bg-white/10"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
              Sair
            </button>
          </div>
        </div>
      </nav>

      <main id="conteudo" className="min-w-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export function Cabecalho({
  titulo,
  descricao,
  acao,
}: {
  titulo: string
  descricao: string
  acao?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-nevoa-200 pb-5">
      <div>
        <h1 className="text-[2.1rem] leading-tight">{titulo}</h1>
        <p className="mt-1 text-lg text-nevoa-600">{descricao}</p>
      </div>
      {acao ? <div className="sem-impressao">{acao}</div> : null}
    </div>
  )
}
