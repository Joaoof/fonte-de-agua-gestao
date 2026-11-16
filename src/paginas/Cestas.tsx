import { ArrowDownToLine, ArrowUpFromLine, Trash2 } from "lucide-react"
import { useState, type FormEvent } from "react"

import { IconeCesta } from "../componentes/Icones"
import {
  Aviso,
  Campo,
  Carregando,
  EstadoVazio,
  Indicador,
  Modal,
  Secao,
} from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAutenticacao } from "../contexto/Autenticacao"
import {
  useDoacoes,
  useEntregas,
  useEstoque,
  useExcluir,
  useFamilias,
  useSalvar,
} from "../dados/consultas"
import { formatarData, hoje } from "../lib/formato"

const CHAVES = ["doacoes", "entregas", "estoque"]

export function Cestas() {
  const { eLideranca } = useAutenticacao()
  const [modal, setModal] = useState<"doacao" | "entrega" | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [doacao, setDoacao] = useState({ data: hoje(), quantidade: 10, doador: "", observacao: "" })
  const [entrega, setEntrega] = useState({
    data: hoje(),
    familia_id: "",
    quantidade: 1,
    observacao: "",
  })

  const estoque = useEstoque()
  const doacoes = useDoacoes()
  const entregas = useEntregas()
  const familias = useFamilias()
  const salvarDoacao = useSalvar("doacoes_cesta", CHAVES)
  const salvarEntrega = useSalvar("entregas_cesta", CHAVES)
  const excluirDoacao = useExcluir("doacoes_cesta", CHAVES)
  const excluirEntrega = useExcluir("entregas_cesta", CHAVES)

  const saldo = estoque.data?.saldo ?? 0

  async function enviarDoacao(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    try {
      await salvarDoacao.mutateAsync({
        valores: {
          ...doacao,
          doador: doacao.doador || null,
          observacao: doacao.observacao || null,
        },
      })
      setModal(null)
      setDoacao({ data: hoje(), quantidade: 10, doador: "", observacao: "" })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  async function enviarEntrega(evento: FormEvent) {
    evento.preventDefault()
    setErro(null)
    if (entrega.quantidade > saldo) {
      setErro(`Estoque insuficiente. Restam ${saldo} cesta(s). Registre uma entrada antes.`)
      return
    }
    try {
      await salvarEntrega.mutateAsync({
        valores: { ...entrega, observacao: entrega.observacao || null },
      })
      setModal(null)
      setEntrega({ data: hoje(), familia_id: "", quantidade: 1, observacao: "" })
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível salvar.")
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Cestas básicas"
        descricao="Entradas por doação, saídas por entrega e saldo em estoque"
        acao={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="botao-secundario"
              onClick={() => {
                setErro(null)
                setModal("doacao")
              }}
            >
              <ArrowDownToLine className="h-5 w-5" aria-hidden="true" />
              Registrar entrada
            </button>
            <button
              type="button"
              className="botao-primario"
              onClick={() => {
                setErro(null)
                setModal("entrega")
              }}
            >
              <ArrowUpFromLine className="h-5 w-5" aria-hidden="true" />
              Registrar entrega
            </button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador
          titulo="Em estoque"
          valor={saldo}
          detalhe="Disponíveis agora"
          icone={<IconeCesta className="h-6 w-6" />}
          tom={saldo <= 5 ? "atencao" : "agua"}
          destaque={saldo <= 5 ? { texto: "Reposição necessária", critico: true } : undefined}
        />
        <Indicador
          titulo="Recebidas"
          valor={estoque.data?.recebidas ?? 0}
          detalhe="Desde o início dos registros"
          icone={<ArrowDownToLine className="h-6 w-6" />}
          tom="bom"
        />
        <Indicador
          titulo="Entregues"
          valor={estoque.data?.entregues ?? 0}
          detalhe="Desde o início dos registros"
          icone={<ArrowUpFromLine className="h-6 w-6" />}
          tom="brasa"
        />
      </div>

      <Secao titulo="Entregas às famílias" descricao="Histórico completo de saídas">
        {entregas.isLoading ? (
          <Carregando />
        ) : entregas.data?.length === 0 ? (
          <div className="cartao">
            <EstadoVazio
              titulo="Nenhuma entrega registrada"
              descricao="Registre a primeira entrega para acompanhar quem já recebeu."
            />
          </div>
        ) : (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left">
              <thead className="border-b border-nevoa-200 bg-papel">
                <tr>
                  <th className="cabecalho-tabela px-5 py-3">Data</th>
                  <th className="cabecalho-tabela px-5 py-3">Família</th>
                  <th className="cabecalho-tabela px-5 py-3">Qtd.</th>
                  <th className="cabecalho-tabela px-5 py-3">Observação</th>
                  {eLideranca ? <th className="cabecalho-tabela px-5 py-3 sem-impressao" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-nevoa-200">
                {entregas.data?.map((item) => (
                  <tr key={item.id} className="hover:bg-papel">
                    <td className="px-5 py-4">{formatarData(item.data)}</td>
                    <td className="px-5 py-4 font-semibold">
                      {item.familias?.responsavel ?? "Família removida"}
                    </td>
                    <td className="px-5 py-4 tabular-nums">{item.quantidade}</td>
                    <td className="px-5 py-4 text-nevoa-600">{item.observacao ?? "—"}</td>
                    {eLideranca ? (
                      <td className="px-5 py-4 sem-impressao">
                        <button
                          type="button"
                          aria-label="Excluir entrega"
                          className="rounded-lg p-2 text-critico-600 hover:bg-critico-100"
                          onClick={() => {
                            if (window.confirm("Excluir esta entrega?")) excluirEntrega.mutate(item.id)
                          }}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Secao>

      <Secao titulo="Entradas por doação" descricao="Quem doou e quantas cestas entraram">
        {doacoes.data?.length === 0 ? (
          <div className="cartao">
            <EstadoVazio
              titulo="Nenhuma entrada registrada"
              descricao="Registre as doações recebidas para o estoque ficar correto."
            />
          </div>
        ) : (
          <div className="cartao overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left">
              <thead className="border-b border-nevoa-200 bg-papel">
                <tr>
                  <th className="cabecalho-tabela px-5 py-3">Data</th>
                  <th className="cabecalho-tabela px-5 py-3">Doador</th>
                  <th className="cabecalho-tabela px-5 py-3">Qtd.</th>
                  <th className="cabecalho-tabela px-5 py-3">Observação</th>
                  {eLideranca ? <th className="cabecalho-tabela px-5 py-3 sem-impressao" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-nevoa-200">
                {doacoes.data?.map((item) => (
                  <tr key={item.id} className="hover:bg-papel">
                    <td className="px-5 py-4">{formatarData(item.data)}</td>
                    <td className="px-5 py-4 font-semibold">{item.doador ?? "Anônimo"}</td>
                    <td className="px-5 py-4 tabular-nums">{item.quantidade}</td>
                    <td className="px-5 py-4 text-nevoa-600">{item.observacao ?? "—"}</td>
                    {eLideranca ? (
                      <td className="px-5 py-4 sem-impressao">
                        <button
                          type="button"
                          aria-label="Excluir entrada"
                          className="rounded-lg p-2 text-critico-600 hover:bg-critico-100"
                          onClick={() => {
                            if (window.confirm("Excluir esta entrada?")) excluirDoacao.mutate(item.id)
                          }}
                        >
                          <Trash2 className="h-5 w-5" aria-hidden="true" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Secao>

      <Modal
        aberto={modal === "doacao"}
        titulo="Registrar entrada de cestas"
        aoFechar={() => setModal(null)}
      >
        <form onSubmit={enviarDoacao} className="space-y-5">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo rotulo="Data">
              <input
                type="date"
                className="campo"
                value={doacao.data}
                onChange={(evento) => setDoacao({ ...doacao, data: evento.target.value })}
                required
              />
            </Campo>
            <Campo rotulo="Quantidade de cestas">
              <input
                type="number"
                min={1}
                className="campo"
                value={doacao.quantidade}
                onChange={(evento) =>
                  setDoacao({ ...doacao, quantidade: Number(evento.target.value) })
                }
                required
              />
            </Campo>
          </div>
          <Campo rotulo="Doador" dica="Deixe em branco para doação anônima.">
            <input
              className="campo"
              value={doacao.doador}
              onChange={(evento) => setDoacao({ ...doacao, doador: evento.target.value })}
            />
          </Campo>
          <Campo rotulo="Observação">
            <input
              className="campo"
              value={doacao.observacao}
              onChange={(evento) => setDoacao({ ...doacao, observacao: evento.target.value })}
            />
          </Campo>
          <div className="flex justify-end gap-3">
            <button type="button" className="botao-secundario" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvarDoacao.isPending}>
              {salvarDoacao.isPending ? "Salvando..." : "Salvar entrada"}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        aberto={modal === "entrega"}
        titulo="Registrar entrega de cesta"
        aoFechar={() => setModal(null)}
      >
        <form onSubmit={enviarEntrega} className="space-y-5">
          {erro ? <Aviso tipo="erro">{erro}</Aviso> : null}
          <Campo rotulo="Família">
            <select
              className="campo"
              value={entrega.familia_id}
              onChange={(evento) => setEntrega({ ...entrega, familia_id: evento.target.value })}
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
                value={entrega.data}
                onChange={(evento) => setEntrega({ ...entrega, data: evento.target.value })}
                required
              />
            </Campo>
            <Campo rotulo="Quantidade" dica={`Em estoque: ${saldo}`}>
              <input
                type="number"
                min={1}
                className="campo"
                value={entrega.quantidade}
                onChange={(evento) =>
                  setEntrega({ ...entrega, quantidade: Number(evento.target.value) })
                }
                required
              />
            </Campo>
          </div>
          <Campo rotulo="Observação">
            <input
              className="campo"
              value={entrega.observacao}
              onChange={(evento) => setEntrega({ ...entrega, observacao: evento.target.value })}
            />
          </Campo>
          <div className="flex justify-end gap-3">
            <button type="button" className="botao-secundario" onClick={() => setModal(null)}>
              Cancelar
            </button>
            <button type="submit" className="botao-primario" disabled={salvarEntrega.isPending}>
              {salvarEntrega.isPending ? "Salvando..." : "Salvar entrega"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
