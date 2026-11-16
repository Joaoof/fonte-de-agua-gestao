import { Plus, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Aviso, Campo, Carregando, EstadoVazio, Etiqueta, Modal } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAutenticacao } from "../contexto/Autenticacao"
import { useAtendimentos, useExcluir, useFamilias, useSalvar } from "../dados/consultas"
import { formatarData, hoje } from "../lib/formato"
import { ROTULOS_TIPO_ATENDIMENTO, type TipoAtendimento } from "../tipos"

export const CORES_TIPO: Record<TipoAtendimento, string> = {
  alimentacao: "bg-bom-100 text-bom-600",
  moradia: "bg-agua-100 text-agua-700",
  saude: "bg-critico-100 text-critico-600",
  orientacao: "bg-nevoa-200 text-tinta-700",
  outro: "bg-brasa-100 text-brasa-700",
}

const VAZIO = {
  familia_id: "",
  data: hoje(),
  tipo: "alimentacao" as TipoAtendimento,
  descricao: "",
  encaminhamento: "",
}

export function Atendimentos() {
  const { eLideranca } = useAutenticacao()
  const [inicio, setInicio] = useState("")
  const [fim, setFim] = useState("")
  const [aberto, setAberto] = useState(false)
  const [formulario, setFormulario] = useState({ ...VAZIO })
  const [erro, setErro] = useState<string | null>(null)

  const atendimentos = useAtendimentos(undefined, inicio || undefined, fim || undefined)
  const familias = useFamilias()
  const salvar = useSalvar("atendimentos", ["atendimentos"])
  const excluir = useExcluir("atendimentos", ["atendimentos"])

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await salvar.mutateAsync({
        valores: {
          ...formulario,
          encaminhamento: formulario.encaminhamento || null,
        },
      })
      setAberto(false)
      setFormulario({ ...VAZIO })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Atendimentos"
        descricao="Registro de cada atendimento prestado às famílias"
        acao={
          <button
            type="button"
            className="botao-primario"
            onClick={() => {
              setFormulario({ ...VAZIO })
              setErro(null)
              setAberto(true)
            }}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
            Novo atendimento
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <Campo rotulo="De">
          <input
            type="date"
            className="campo"
            value={inicio}
            onChange={(evento) => setInicio(evento.target.value)}
          />
        </Campo>
        <Campo rotulo="Até">
          <input
            type="date"
            className="campo"
            value={fim}
            onChange={(evento) => setFim(evento.target.value)}
          />
        </Campo>
        <button
          type="button"
          className="botao-secundario"
          onClick={() => {
            setInicio("")
            setFim("")
          }}
        >
          Limpar período
        </button>
      </div>

      {atendimentos.isLoading ? (
        <Carregando />
      ) : atendimentos.data?.length === 0 ? (
        <div className="cartao">
          <EstadoVazio
            titulo="Nenhum atendimento encontrado"
            descricao="Ajuste o período ou registre o primeiro atendimento do mês."
          />
        </div>
      ) : (
        <div className="cartao divide-y divide-nevoa-200">
          {atendimentos.data?.map((atendimento) => (
            <article key={atendimento.id} className="flex flex-wrap gap-4 px-5 py-5">
              <div className="flex w-16 shrink-0 flex-col items-center rounded-xl bg-papel py-2">
                <span className="font-titulo text-2xl font-bold leading-none">
                  {atendimento.data.slice(8, 10)}
                </span>
                <span className="text-xs text-nevoa-500">
                  {atendimento.data.slice(5, 7)}/{atendimento.data.slice(2, 4)}
                </span>
              </div>

              <div className="min-w-64 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h2 className="text-xl">
                    {atendimento.familias?.responsavel ?? "Família removida"}
                  </h2>
                  <Etiqueta
                    texto={ROTULOS_TIPO_ATENDIMENTO[atendimento.tipo]}
                    cor={CORES_TIPO[atendimento.tipo]}
                  />
                </div>
                <p className="text-nevoa-600">{atendimento.descricao}</p>
                {atendimento.encaminhamento ? (
                  <p className="mt-2 border-l-2 border-agua-200 pl-3 text-sm text-nevoa-600">
                    <span className="rotulo-mini">Encaminhamento</span> {atendimento.encaminhamento}
                  </p>
                ) : null}
              </div>

              {eLideranca ? (
                <button
                  type="button"
                  className="sem-impressao h-11 w-11 shrink-0 rounded-xl text-critico-600 hover:bg-critico-100"
                  aria-label="Excluir atendimento"
                  onClick={() => {
                    if (window.confirm("Excluir este atendimento?")) {
                      excluir.mutate(atendimento.id)
                    }
                  }}
                >
                  <Trash2 className="mx-auto h-5 w-5" aria-hidden="true" />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      )}

      <Modal aberto={aberto} titulo="Novo atendimento" aoFechar={() => setAberto(false)}>
        <form onSubmit={enviar} className="space-y-5">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}

          <Campo rotulo="Família atendida">
            <select
              className="campo"
              value={formulario.familia_id}
              onChange={(evento) =>
                setFormulario({ ...formulario, familia_id: evento.target.value })
              }
              required
            >
              <option value="">Selecione a família</option>
              {familias.data?.map((familia) => (
                <option key={familia.id} value={familia.id}>
                  {familia.responsavel}
                </option>
              ))}
            </select>
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Data">
              <input
                type="date"
                className="campo"
                value={formulario.data}
                onChange={(evento) => setFormulario({ ...formulario, data: evento.target.value })}
                required
              />
            </Campo>
            <Campo rotulo="Tipo de ajuda">
              <select
                className="campo"
                value={formulario.tipo}
                onChange={(evento) =>
                  setFormulario({ ...formulario, tipo: evento.target.value as TipoAtendimento })
                }
              >
                {Object.entries(ROTULOS_TIPO_ATENDIMENTO).map(([valor, rotulo]) => (
                  <option key={valor} value={valor}>
                    {rotulo}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo rotulo="O que foi feito">
            <textarea
              className="campo min-h-28"
              value={formulario.descricao}
              onChange={(evento) =>
                setFormulario({ ...formulario, descricao: evento.target.value })
              }
              required
            />
          </Campo>

          <Campo rotulo="Encaminhamento" dica="Opcional — para onde a família foi orientada.">
            <input
              className="campo"
              value={formulario.encaminhamento}
              onChange={(evento) =>
                setFormulario({ ...formulario, encaminhamento: evento.target.value })
              }
            />
          </Campo>

          <div className="flex justify-end gap-3">
            <button type="button" className="botao-secundario" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar atendimento"}
            </button>
          </div>
        </form>
      </Modal>

      <p className="mt-4 text-sm text-nevoa-600">
        {atendimentos.data?.length ?? 0} atendimento(s) listado(s)
        {inicio || fim
          ? ` no período ${inicio ? formatarData(inicio) : "início"} a ${fim ? formatarData(fim) : "hoje"}`
          : ""}
      </p>
    </>
  )
}
