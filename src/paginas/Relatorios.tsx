import { Download, Printer } from "lucide-react"
import { useMemo, useState } from "react"

import { IconeAtendimento, IconeCesta, IconeFamilias } from "../componentes/Icones"
import { Campo, Carregando, EstadoVazio, Indicador, Secao } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import { useAtendimentos, useEntregas, useFamilias } from "../dados/consultas"
import { baixarCsv, formatarData, hoje, primeiroDiaDoMes } from "../lib/formato"
import { ROTULOS_TIPO_ATENDIMENTO, type TipoAtendimento } from "../tipos"

export function Relatorios() {
  const [inicio, setInicio] = useState(primeiroDiaDoMes())
  const [fim, setFim] = useState(hoje())

  const atendimentos = useAtendimentos(undefined, inicio, fim)
  const entregas = useEntregas(undefined, inicio, fim)
  const familias = useFamilias()

  const porTipo = useMemo(() => {
    const contagem: Record<string, number> = {}
    for (const atendimento of atendimentos.data ?? []) {
      contagem[atendimento.tipo] = (contagem[atendimento.tipo] ?? 0) + 1
    }
    return Object.entries(contagem).sort((a, b) => b[1] - a[1])
  }, [atendimentos.data])

  const porFamilia = useMemo(() => {
    const mapa = new Map<string, { nome: string; atendimentos: number; cestas: number }>()
    for (const atendimento of atendimentos.data ?? []) {
      const chave = atendimento.familia_id
      const atual = mapa.get(chave) ?? {
        nome: atendimento.familias?.responsavel ?? "Família removida",
        atendimentos: 0,
        cestas: 0,
      }
      atual.atendimentos += 1
      mapa.set(chave, atual)
    }
    for (const entrega of entregas.data ?? []) {
      const chave = entrega.familia_id
      const atual = mapa.get(chave) ?? {
        nome: entrega.familias?.responsavel ?? "Família removida",
        atendimentos: 0,
        cestas: 0,
      }
      atual.cestas += entrega.quantidade
      mapa.set(chave, atual)
    }
    return [...mapa.values()].sort((a, b) => b.atendimentos + b.cestas - (a.atendimentos + a.cestas))
  }, [atendimentos.data, entregas.data])

  const totalCestas = (entregas.data ?? []).reduce((soma, item) => soma + item.quantidade, 0)
  const maior = Math.max(1, ...porTipo.map(([, quantidade]) => quantidade))
  const carregando = atendimentos.isLoading || entregas.isLoading

  function exportar() {
    baixarCsv(`relatorio-acao-social-${inicio}-a-${fim}.csv`, [
      ["Relatório da ação social — Fonte de Água da Vida"],
      ["Período", `${formatarData(inicio)} a ${formatarData(fim)}`],
      [],
      ["Família", "Atendimentos", "Cestas recebidas"],
      ...porFamilia.map((linha) => [linha.nome, linha.atendimentos, linha.cestas]),
      [],
      ["Total de atendimentos", atendimentos.data?.length ?? 0],
      ["Total de cestas entregues", totalCestas],
      ["Famílias alcançadas no período", porFamilia.length],
    ])
  }

  return (
    <>
      <Cabecalho
        titulo="Relatórios"
        descricao="Resumo do período para prestação de contas a doadores e parceiros"
        acao={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="botao-secundario" onClick={() => window.print()}>
              <Printer className="h-5 w-5" aria-hidden="true" />
              Imprimir
            </button>
            <button type="button" className="botao-primario" onClick={exportar}>
              <Download className="h-5 w-5" aria-hidden="true" />
              Baixar planilha
            </button>
          </div>
        }
      />

      <div className="sem-impressao mb-8 grid gap-3 sm:grid-cols-2">
        <Campo rotulo="Data inicial">
          <input
            type="date"
            className="campo"
            value={inicio}
            onChange={(evento) => setInicio(evento.target.value)}
          />
        </Campo>
        <Campo rotulo="Data final">
          <input
            type="date"
            className="campo"
            value={fim}
            onChange={(evento) => setFim(evento.target.value)}
          />
        </Campo>
      </div>

      <p className="mb-6 hidden text-lg print:block">
        Período de {formatarData(inicio)} a {formatarData(fim)}
      </p>

      {carregando ? (
        <Carregando />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Indicador
              titulo="Atendimentos"
              valor={atendimentos.data?.length ?? 0}
              detalhe="No período selecionado"
              icone={<IconeAtendimento className="h-6 w-6" />}
              tom="brasa"
            />
            <Indicador
              titulo="Cestas entregues"
              valor={totalCestas}
              detalhe={`${entregas.data?.length ?? 0} entrega(s)`}
              icone={<IconeCesta className="h-6 w-6" />}
              tom="bom"
            />
            <Indicador
              titulo="Famílias alcançadas"
              valor={porFamilia.length}
              detalhe={`${familias.data?.length ?? 0} cadastradas no total`}
              icone={<IconeFamilias className="h-6 w-6" />}
            />
          </div>

          <Secao titulo="Atendimentos por tipo de ajuda">
            {porTipo.length === 0 ? (
              <div className="cartao">
                <EstadoVazio
                  titulo="Sem atendimentos no período"
                  descricao="Escolha outro intervalo de datas."
                />
              </div>
            ) : (
              <div className="cartao space-y-4 p-6">
                {porTipo.map(([tipo, quantidade]) => (
                  <div key={tipo}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-3">
                      <span className="font-semibold">
                        {ROTULOS_TIPO_ATENDIMENTO[tipo as TipoAtendimento]}
                      </span>
                      <span className="tabular-nums text-nevoa-600">
                        {quantidade} ({Math.round((quantidade / (atendimentos.data?.length || 1)) * 100)}%)
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-nevoa-200">
                      <div
                        className="h-full rounded-full bg-agua-600"
                        style={{ width: `${(quantidade / maior) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Secao>

          <Secao titulo="Detalhamento por família">
            {porFamilia.length === 0 ? (
              <div className="cartao">
                <EstadoVazio
                  titulo="Nenhum registro no período"
                  descricao="Nenhuma família recebeu atendimento ou cesta neste intervalo."
                />
              </div>
            ) : (
              <div className="cartao overflow-x-auto">
                <table className="w-full min-w-[32rem] text-left">
                  <thead className="border-b border-nevoa-200 bg-papel">
                    <tr>
                      <th className="cabecalho-tabela px-5 py-3">Família</th>
                      <th className="cabecalho-tabela px-5 py-3">Atendimentos</th>
                      <th className="cabecalho-tabela px-5 py-3">Cestas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-nevoa-200">
                    {porFamilia.map((linha) => (
                      <tr key={linha.nome}>
                        <td className="px-5 py-3 font-semibold">{linha.nome}</td>
                        <td className="px-5 py-3 tabular-nums">{linha.atendimentos}</td>
                        <td className="px-5 py-3 tabular-nums">{linha.cestas}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-nevoa-300 bg-papel font-semibold">
                    <tr>
                      <td className="px-5 py-3">Total</td>
                      <td className="px-5 py-3 tabular-nums">{atendimentos.data?.length ?? 0}</td>
                      <td className="px-5 py-3 tabular-nums">{totalCestas}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </Secao>
        </>
      )}
    </>
  )
}
