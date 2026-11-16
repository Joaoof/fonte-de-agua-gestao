import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Aviso, Campo, Carregando, EstadoVazio, Etiqueta, Modal } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAutenticacao } from "../contexto/Autenticacao"
import { useExcluir, useSalvar, useVoluntarios } from "../dados/consultas"
import { telefoneFormatado } from "../lib/formato"
import { ROTULOS_FUNCAO, type FuncaoVoluntario, type Voluntario } from "../tipos"

const CORES_FUNCAO: Record<FuncaoVoluntario, string> = {
  obreiro: "bg-agua-100 text-agua-700",
  musico: "bg-brasa-100 text-brasa-700",
  acao_social: "bg-bom-100 text-bom-600",
  outro: "bg-nevoa-200 text-tinta-700",
}

const VAZIO = {
  nome: "",
  funcao: "acao_social" as FuncaoVoluntario,
  telefone: "",
  ativo: true,
}

export function Voluntarios() {
  const { eLideranca } = useAutenticacao()
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Voluntario | null>(null)
  const [formulario, setFormulario] = useState({ ...VAZIO })
  const [erro, setErro] = useState<string | null>(null)

  const voluntarios = useVoluntarios()
  const salvar = useSalvar("voluntarios", ["voluntarios"])
  const excluir = useExcluir("voluntarios", ["voluntarios"])

  const ativos = (voluntarios.data ?? []).filter((item) => item.ativo).length

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await salvar.mutateAsync({
        id: editando?.id,
        valores: { ...formulario, telefone: formulario.telefone || null },
      })
      setAberto(false)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Voluntários"
        descricao={`${ativos} voluntário(s) ativo(s) no corpo de trabalho`}
        acao={
          <button
            type="button"
            className="botao-primario"
            onClick={() => {
              setEditando(null)
              setFormulario({ ...VAZIO })
              setErro(null)
              setAberto(true)
            }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Novo voluntário
          </button>
        }
      />

      {voluntarios.isLoading ? (
        <Carregando />
      ) : voluntarios.data?.length === 0 ? (
        <div className="cartao">
          <EstadoVazio
            titulo="Nenhum voluntário cadastrado"
            descricao="Cadastre obreiros, músicos e colaboradores da ação social."
          />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {voluntarios.data?.map((voluntario) => (
            <article
              key={voluntario.id}
              className={`cartao flex items-start justify-between gap-3 p-5 ${
                voluntario.ativo ? "" : "opacity-65"
              }`}
            >
              <div className="min-w-0">
                <h2 className="truncate text-xl">{voluntario.nome}</h2>
                <p className="mb-2 text-nevoa-600">{telefoneFormatado(voluntario.telefone)}</p>
                <div className="flex flex-wrap gap-2">
                  <Etiqueta
                    texto={ROTULOS_FUNCAO[voluntario.funcao]}
                    cor={CORES_FUNCAO[voluntario.funcao]}
                  />
                  {voluntario.ativo ? null : (
                    <Etiqueta texto="Inativo" cor="bg-nevoa-200 text-tinta-700" />
                  )}
                </div>
              </div>

              <div className="sem-impressao flex shrink-0 flex-col gap-1">
                <button
                  type="button"
                  aria-label={`Editar ${voluntario.nome}`}
                  className="rounded-lg p-2 text-nevoa-600 hover:bg-nevoa-200"
                  onClick={() => {
                    setEditando(voluntario)
                    setFormulario({
                      nome: voluntario.nome,
                      funcao: voluntario.funcao,
                      telefone: voluntario.telefone ?? "",
                      ativo: voluntario.ativo,
                    })
                    setErro(null)
                    setAberto(true)
                  }}
                >
                  <Pencil className="h-5 w-5" aria-hidden="true" />
                </button>
                {eLideranca ? (
                  <button
                    type="button"
                    aria-label={`Excluir ${voluntario.nome}`}
                    className="rounded-lg p-2 text-critico-600 hover:bg-critico-100"
                    onClick={() => {
                      if (window.confirm(`Excluir ${voluntario.nome}?`)) {
                        excluir.mutate(voluntario.id)
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5" aria-hidden="true" />
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal
        aberto={aberto}
        titulo={editando ? "Editar voluntário" : "Novo voluntário"}
        aoFechar={() => setAberto(false)}
      >
        <form onSubmit={enviar} className="space-y-5">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}

          <Campo rotulo="Nome completo">
            <input
              className="campo"
              value={formulario.nome}
              onChange={(evento) => setFormulario({ ...formulario, nome: evento.target.value })}
              required
              autoFocus
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Função">
              <select
                className="campo"
                value={formulario.funcao}
                onChange={(evento) =>
                  setFormulario({ ...formulario, funcao: evento.target.value as FuncaoVoluntario })
                }
              >
                {Object.entries(ROTULOS_FUNCAO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo rotulo="Telefone">
              <input
                className="campo"
                inputMode="tel"
                value={formulario.telefone}
                onChange={(evento) =>
                  setFormulario({ ...formulario, telefone: evento.target.value })
                }
              />
            </Campo>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-nevoa-300 px-4 py-3">
            <input
              type="checkbox"
              className="h-5 w-5 accent-agua-600"
              checked={formulario.ativo}
              onChange={(evento) => setFormulario({ ...formulario, ativo: evento.target.checked })}
            />
            <span className="font-medium">Voluntário ativo</span>
          </label>

          <div className="flex justify-end gap-3">
            <button type="button" className="botao-secundario" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
