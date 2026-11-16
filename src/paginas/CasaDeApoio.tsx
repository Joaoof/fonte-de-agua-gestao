import { LogIn, LogOut, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"

import { Aviso, Campo, Carregando, EstadoVazio, Etiqueta, Modal } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAutenticacao } from "../contexto/Autenticacao"
import { useAcolhimentos, useExcluir, useFamilias, useSalvar } from "../dados/consultas"
import { diferencaEmDias, formatarData, hoje } from "../lib/formato"
import type { Acolhimento } from "../tipos"

const VAZIO = {
  nome: "",
  familia_id: "",
  data_entrada: hoje(),
  motivo: "",
  observacoes: "",
}

export function CasaDeApoio() {
  const { eLideranca } = useAutenticacao()
  const [aberto, setAberto] = useState(false)
  const [formulario, setFormulario] = useState({ ...VAZIO })
  const [erro, setErro] = useState<string | null>(null)
  const [apenasAtivos, setApenasAtivos] = useState(false)

  const acolhimentos = useAcolhimentos(apenasAtivos)
  const familias = useFamilias()
  const salvar = useSalvar("acolhimentos", ["acolhimentos"])
  const excluir = useExcluir("acolhimentos", ["acolhimentos"])

  const emAberto = (acolhimentos.data ?? []).filter((item) => !item.data_saida).length

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await salvar.mutateAsync({
        valores: {
          ...formulario,
          familia_id: formulario.familia_id || null,
          motivo: formulario.motivo || null,
          observacoes: formulario.observacoes || null,
        },
      })
      setAberto(false)
      setFormulario({ ...VAZIO })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  async function registrarSaida(acolhimento: Acolhimento) {
    const data = window.prompt("Data de saída (AAAA-MM-DD):", hoje())
    if (!data) return
    try {
      await salvar.mutateAsync({ id: acolhimento.id, valores: { data_saida: data } })
    } catch (falha) {
      window.alert(falha instanceof Error ? falha.message : "Não foi possível registrar a saída.")
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Casa de apoio"
        descricao={`${emAberto} pessoa(s) acolhida(s) no momento`}
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
            <LogIn className="h-5 w-5" aria-hidden="true" />
            Registrar acolhimento
          </button>
        }
      />

      <label className="mb-5 inline-flex cursor-pointer items-center gap-3 rounded-xl border-2 border-nevoa-300 bg-white px-4 py-3">
        <input
          type="checkbox"
          className="h-5 w-5 accent-agua-600"
          checked={apenasAtivos}
          onChange={(evento) => setApenasAtivos(evento.target.checked)}
        />
        <span className="font-medium">Mostrar apenas quem está na casa agora</span>
      </label>

      {acolhimentos.isLoading ? (
        <Carregando />
      ) : acolhimentos.data?.length === 0 ? (
        <div className="cartao">
          <EstadoVazio
            titulo="Nenhum acolhimento registrado"
            descricao="Registre a entrada de quem for acolhido na casa de apoio."
          />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {acolhimentos.data?.map((acolhimento) => {
            const ativo = !acolhimento.data_saida
            return (
              <article
                key={acolhimento.id}
                className={`cartao flex flex-col gap-3 p-5 ${
                  ativo ? "border-l-4 border-l-agua-600" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl">{acolhimento.nome}</h2>
                    {acolhimento.familias?.responsavel ? (
                      <p className="text-sm text-nevoa-600">
                        Vinculado à família {acolhimento.familias.responsavel}
                      </p>
                    ) : null}
                  </div>
                  <Etiqueta
                    texto={ativo ? "Na casa" : "Saiu"}
                    cor={ativo ? "bg-agua-100 text-agua-700" : "bg-nevoa-200 text-tinta-700"}
                  />
                </div>

                <dl className="grid grid-cols-3 gap-2 rounded-xl bg-papel px-4 py-3 text-sm">
                  <div>
                    <dt className="rotulo-mini">Entrada</dt>
                    <dd className="font-semibold">{formatarData(acolhimento.data_entrada)}</dd>
                  </div>
                  <div>
                    <dt className="rotulo-mini">Saída</dt>
                    <dd className="font-semibold">{formatarData(acolhimento.data_saida)}</dd>
                  </div>
                  <div>
                    <dt className="rotulo-mini">Dias</dt>
                    <dd className="font-semibold tabular-nums">
                      {diferencaEmDias(acolhimento.data_entrada, acolhimento.data_saida)}
                    </dd>
                  </div>
                </dl>

                {acolhimento.motivo ? (
                  <p className="text-nevoa-600">
                    <span className="rotulo-mini">Motivo</span> {acolhimento.motivo}
                  </p>
                ) : null}

                <div className="sem-impressao mt-auto flex flex-wrap gap-2 pt-1">
                  {ativo ? (
                    <button
                      type="button"
                      className="botao-secundario"
                      onClick={() => registrarSaida(acolhimento)}
                    >
                      <LogOut className="h-5 w-5" aria-hidden="true" />
                      Registrar saída
                    </button>
                  ) : null}
                  {eLideranca ? (
                    <button
                      type="button"
                      className="botao-perigo"
                      onClick={() => {
                        if (window.confirm("Excluir este acolhimento?")) {
                          excluir.mutate(acolhimento.id)
                        }
                      }}
                    >
                      <Trash2 className="h-5 w-5" aria-hidden="true" />
                      Excluir
                    </button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Modal aberto={aberto} titulo="Registrar acolhimento" aoFechar={() => setAberto(false)}>
        <form onSubmit={enviar} className="space-y-5">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}

          <Campo rotulo="Nome da pessoa acolhida">
            <input
              className="campo"
              value={formulario.nome}
              onChange={(evento) => setFormulario({ ...formulario, nome: evento.target.value })}
              required
              autoFocus
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Data de entrada">
              <input
                type="date"
                className="campo"
                value={formulario.data_entrada}
                onChange={(evento) =>
                  setFormulario({ ...formulario, data_entrada: evento.target.value })
                }
                required
              />
            </Campo>
            <Campo rotulo="Família vinculada" dica="Opcional.">
              <select
                className="campo"
                value={formulario.familia_id}
                onChange={(evento) =>
                  setFormulario({ ...formulario, familia_id: evento.target.value })
                }
              >
                <option value="">Sem vínculo</option>
                {familias.data?.map((familia) => (
                  <option key={familia.id} value={familia.id}>
                    {familia.responsavel}
                  </option>
                ))}
              </select>
            </Campo>
          </div>

          <Campo rotulo="Motivo do acolhimento">
            <input
              className="campo"
              value={formulario.motivo}
              onChange={(evento) => setFormulario({ ...formulario, motivo: evento.target.value })}
            />
          </Campo>

          <Campo rotulo="Observações">
            <textarea
              className="campo min-h-24"
              value={formulario.observacoes}
              onChange={(evento) =>
                setFormulario({ ...formulario, observacoes: evento.target.value })
              }
            />
          </Campo>

          <div className="flex justify-end gap-3">
            <button type="button" className="botao-secundario" onClick={() => setAberto(false)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvar.isPending}>
              {salvar.isPending ? "Salvando..." : "Salvar acolhimento"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
