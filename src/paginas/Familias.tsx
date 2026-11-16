import { Pencil, Plus, Search, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"
import { Link } from "react-router-dom"

import { Aviso, Campo, Carregando, EstadoVazio, Etiqueta, Modal } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAutenticacao } from "../contexto/Autenticacao"
import { useExcluir, useFamilias, useSalvar } from "../dados/consultas"
import { telefoneFormatado } from "../lib/formato"
import type { Familia, SituacaoFamilia } from "../tipos"

const VAZIA = {
  responsavel: "",
  documento: "",
  telefone: "",
  endereco: "",
  bairro: "São João",
  quantidade_pessoas: 1,
  quantidade_criancas: 0,
  situacao: "ativa" as SituacaoFamilia,
  observacoes: "",
}

export function Familias() {
  const { eLideranca } = useAutenticacao()
  const [busca, setBusca] = useState("")
  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState<Familia | null>(null)
  const [formulario, setFormulario] = useState({ ...VAZIA })
  const [erro, setErro] = useState<string | null>(null)

  const familias = useFamilias(busca)
  const salvar = useSalvar("familias", ["familias", "familia"])
  const excluir = useExcluir("familias", ["familias", "atendimentos", "entregas", "estoque"])

  function abrirNova() {
    setEditando(null)
    setFormulario({ ...VAZIA })
    setErro(null)
    setAberto(true)
  }

  function abrirEdicao(familia: Familia) {
    setEditando(familia)
    setFormulario({
      responsavel: familia.responsavel,
      documento: familia.documento ?? "",
      telefone: familia.telefone ?? "",
      endereco: familia.endereco ?? "",
      bairro: familia.bairro ?? "",
      quantidade_pessoas: familia.quantidade_pessoas,
      quantidade_criancas: familia.quantidade_criancas,
      situacao: familia.situacao,
      observacoes: familia.observacoes ?? "",
    })
    setErro(null)
    setAberto(true)
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await salvar.mutateAsync({
        id: editando?.id,
        valores: {
          ...formulario,
          documento: formulario.documento || null,
          telefone: formulario.telefone || null,
          endereco: formulario.endereco || null,
          bairro: formulario.bairro || null,
          observacoes: formulario.observacoes || null,
        },
      })
      setAberto(false)
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  async function remover(familia: Familia) {
    const confirmado = window.confirm(
      `Excluir a família de ${familia.responsavel}? Os atendimentos e entregas ligados a ela também serão apagados.`,
    )
    if (!confirmado) return
    try {
      await excluir.mutateAsync(familia.id)
    } catch (falha) {
      window.alert(falha instanceof Error ? falha.message : "Não foi possível excluir.")
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Famílias assistidas"
        descricao="Cadastro das famílias acompanhadas pela ação social"
        acao={
          <button type="button" onClick={abrirNova} className="botao-primario">
            <Plus className="h-5 w-5" aria-hidden="true" />
            Nova família
          </button>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-nevoa-500"
            aria-hidden="true"
          />
          <input
            className="campo pl-12"
            placeholder="Buscar por nome, documento ou endereço"
            value={busca}
            onChange={(evento) => setBusca(evento.target.value)}
            aria-label="Buscar família"
          />
        </div>
      </div>

      {familias.isLoading ? (
        <Carregando />
      ) : familias.data?.length === 0 ? (
        <div className="cartao">
          <EstadoVazio
            titulo={busca ? "Nenhuma família encontrada" : "Nenhuma família cadastrada"}
            descricao={
              busca
                ? "Tente buscar por outro nome ou limpe o campo de busca."
                : "Cadastre a primeira família assistida para começar a registrar atendimentos."
            }
            acao={
              <button type="button" onClick={abrirNova} className="botao-primario">
                Cadastrar família
              </button>
            }
          />
        </div>
      ) : (
        <div className="cartao overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left">
            <thead className="border-b border-nevoa-200 bg-papel ">
              <tr>
                <th className="cabecalho-tabela px-5 py-3">Responsável</th>
                <th className="cabecalho-tabela px-5 py-3">Contato</th>
                <th className="cabecalho-tabela px-5 py-3">Pessoas</th>
                <th className="cabecalho-tabela px-5 py-3">Situação</th>
                <th className="px-5 py-3 font-bold sem-impressao">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nevoa-200">
              {familias.data?.map((familia) => (
                <tr key={familia.id} className="hover:bg-papel">
                  <td className="px-5 py-4">
                    <Link
                      to={`/familias/${familia.id}`}
                      className="text-lg font-semibold text-agua-700 underline"
                    >
                      {familia.responsavel}
                    </Link>
                    <p className="text-sm text-nevoa-500">{familia.endereco ?? "Sem endereço"}</p>
                  </td>
                  <td className="px-5 py-4 text-tinta-700">
                    {telefoneFormatado(familia.telefone)}
                  </td>
                  <td className="px-5 py-4 text-tinta-700">
                    {familia.quantidade_pessoas}
                    {familia.quantidade_criancas > 0
                      ? ` (${familia.quantidade_criancas} criança${familia.quantidade_criancas > 1 ? "s" : ""})`
                      : ""}
                  </td>
                  <td className="px-5 py-4">
                    <Etiqueta
                      texto={familia.situacao === "ativa" ? "Ativa" : "Inativa"}
                      cor={
                        familia.situacao === "ativa"
                          ? "bg-bom-100 text-bom-600"
                          : "bg-nevoa-200 text-tinta-700"
                      }
                    />
                  </td>
                  <td className="px-5 py-4 sem-impressao">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(familia)}
                        className="rounded-lg p-2 text-nevoa-600 hover:bg-nevoa-200"
                        aria-label={`Editar ${familia.responsavel}`}
                      >
                        <Pencil className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {eLideranca ? (
                        <button
                          type="button"
                          onClick={() => remover(familia)}
                          className="rounded-lg p-2 text-critico-600 hover:bg-critico-100"
                          aria-label={`Excluir ${familia.responsavel}`}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        aberto={aberto}
        titulo={editando ? "Editar família" : "Nova família"}
        aoFechar={() => setAberto(false)}
      >
        <form onSubmit={enviar} className="space-y-4">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}

          <Campo rotulo="Nome do responsável">
            <input
              className="campo"
              value={formulario.responsavel}
              onChange={(evento) =>
                setFormulario({ ...formulario, responsavel: evento.target.value })
              }
              required
              autoFocus
            />
          </Campo>

          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="CPF ou documento">
              <input
                className="campo"
                value={formulario.documento}
                onChange={(evento) =>
                  setFormulario({ ...formulario, documento: evento.target.value })
                }
              />
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <Campo rotulo="Endereço">
                <input
                  className="campo"
                  value={formulario.endereco}
                  onChange={(evento) =>
                    setFormulario({ ...formulario, endereco: evento.target.value })
                  }
                />
              </Campo>
            </div>
            <Campo rotulo="Bairro">
              <input
                className="campo"
                value={formulario.bairro}
                onChange={(evento) => setFormulario({ ...formulario, bairro: evento.target.value })}
              />
            </Campo>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Campo rotulo="Pessoas na casa">
              <input
                type="number"
                min={1}
                className="campo"
                value={formulario.quantidade_pessoas}
                onChange={(evento) =>
                  setFormulario({ ...formulario, quantidade_pessoas: Number(evento.target.value) })
                }
                required
              />
            </Campo>
            <Campo rotulo="Crianças">
              <input
                type="number"
                min={0}
                className="campo"
                value={formulario.quantidade_criancas}
                onChange={(evento) =>
                  setFormulario({ ...formulario, quantidade_criancas: Number(evento.target.value) })
                }
              />
            </Campo>
            <Campo rotulo="Situação">
              <select
                className="campo"
                value={formulario.situacao}
                onChange={(evento) =>
                  setFormulario({
                    ...formulario,
                    situacao: evento.target.value as SituacaoFamilia,
                  })
                }
              >
                <option value="ativa">Ativa</option>
                <option value="inativa">Inativa</option>
              </select>
            </Campo>
          </div>

          <Campo rotulo="Observações">
            <textarea
              className="campo min-h-24"
              value={formulario.observacoes}
              onChange={(evento) =>
                setFormulario({ ...formulario, observacoes: evento.target.value })
              }
            />
          </Campo>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setAberto(false)} className="botao-secundario">
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
