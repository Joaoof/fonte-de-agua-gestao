import { ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

import {
  IconeAtendimento,
  IconeCasaDeApoio,
  IconeCesta,
  IconeFamilias,
} from "../componentes/Icones"
import { Carregando, EstadoVazio, Etiqueta, Indicador, Secao } from "../componentes/Interface"
import { Cabecalho } from "../componentes/Layout"
import {
  useAcolhimentos,
  useAtendimentos,
  useEntregas,
  useEstoque,
  useFamilias,
} from "../dados/consultas"
import { diferencaEmDias, formatarData, hoje, primeiroDiaDoMes } from "../lib/formato"
import { ROTULOS_TIPO_ATENDIMENTO, type TipoAtendimento } from "../tipos"

const CORES_TIPO: Record<TipoAtendimento, string> = {
  alimentacao: "bg-bom-100 text-bom-600",
  moradia: "bg-agua-100 text-agua-700",
  saude: "bg-critico-100 text-critico-600",
  orientacao: "bg-nevoa-200 text-tinta-700",
  outro: "bg-brasa-100 text-brasa-700",
}

export function Painel() {
  const inicio = primeiroDiaDoMes()
  const fim = hoje()

  const familias = useFamilias()
  const atendimentos = useAtendimentos(undefined, inicio, fim)
  const entregas = useEntregas(undefined, inicio, fim)
  const acolhidos = useAcolhimentos(true)
  const estoque = useEstoque()

  const carregando =
    familias.isLoading || atendimentos.isLoading || entregas.isLoading || acolhidos.isLoading

  const ativas = (familias.data ?? []).filter((familia) => familia.situacao === "ativa").length
  const cestasEntregues = (entregas.data ?? []).reduce((total, item) => total + item.quantidade, 0)
  const saldo = estoque.data?.saldo ?? 0
  const ultimos = (atendimentos.data ?? []).slice(0, 6)
  const pessoasAlcancadas = (familias.data ?? [])
    .filter((familia) => familia.situacao === "ativa")
    .reduce((total, familia) => total + familia.quantidade_pessoas, 0)

  return (
    <>
      <Cabecalho
        titulo="Painel"
        descricao={`Resumo do mês — ${formatarData(inicio)} a ${formatarData(fim)}`}
      />

      {carregando ? (
        <Carregando />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Indicador
              titulo="Famílias ativas"
              valor={ativas}
              detalhe={`${pessoasAlcancadas} pessoas alcançadas`}
              icone={<IconeFamilias className="h-6 w-6" />}
            />
            <Indicador
              titulo="Atendimentos no mês"
              valor={atendimentos.data?.length ?? 0}
              detalhe="Registrados por voluntários"
              icone={<IconeAtendimento className="h-6 w-6" />}
              tom="brasa"
            />
            <Indicador
              titulo="Cestas entregues"
              valor={cestasEntregues}
              detalhe={`${estoque.data?.recebidas ?? 0} recebidas no total`}
              icone={<IconeCesta className="h-6 w-6" />}
              tom="bom"
            />
            <Indicador
              titulo="Estoque de cestas"
              valor={saldo}
              detalhe="Disponíveis para entrega"
              icone={<IconeCasaDeApoio className="h-6 w-6" />}
              tom={saldo <= 5 ? "atencao" : "agua"}
              destaque={
                saldo <= 5
                  ? { texto: saldo === 0 ? "Estoque zerado" : "Estoque baixo", critico: true }
                  : undefined
              }
            />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <section>
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl">Últimos atendimentos</h2>
                  <p className="text-nevoa-600">O que foi registrado neste mês</p>
                </div>
                <Link
                  to="/atendimentos"
                  className="inline-flex items-center gap-1.5 font-semibold text-agua-700 underline underline-offset-4"
                >
                  Ver todos
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="cartao overflow-hidden">
                {ultimos.length === 0 ? (
                  <EstadoVazio
                    titulo="Nenhum atendimento neste mês"
                    descricao="Assim que um voluntário registrar um atendimento, ele aparece aqui."
                    acao={
                      <Link to="/atendimentos" className="botao-primario">
                        Registrar atendimento
                      </Link>
                    }
                  />
                ) : (
                  <ul className="divide-y divide-nevoa-200">
                    {ultimos.map((atendimento) => (
                      <li key={atendimento.id} className="flex gap-4 px-5 py-4">
                        <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-papel py-2">
                          <span className="font-titulo text-xl font-bold leading-none">
                            {atendimento.data.slice(8, 10)}
                          </span>
                          <span className="text-xs uppercase text-nevoa-500">
                            {formatarData(atendimento.data).slice(3, 5)}/
                            {atendimento.data.slice(2, 4)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">
                            {atendimento.familias?.responsavel ?? "Família removida"}
                          </p>
                          <p className="text-nevoa-600">{atendimento.descricao}</p>
                        </div>
                        <Etiqueta
                          texto={ROTULOS_TIPO_ATENDIMENTO[atendimento.tipo]}
                          cor={`${CORES_TIPO[atendimento.tipo]} h-fit shrink-0`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section>
              <div className="mb-4">
                <h2 className="text-2xl">Na casa de apoio</h2>
                <p className="text-nevoa-600">Acolhidos sem data de saída</p>
              </div>

              <div className="cartao overflow-hidden">
                {(acolhidos.data ?? []).length === 0 ? (
                  <EstadoVazio
                    titulo="Casa de apoio vazia"
                    descricao="Nenhum acolhimento em aberto no momento."
                  />
                ) : (
                  <ul className="divide-y divide-nevoa-200">
                    {(acolhidos.data ?? []).slice(0, 6).map((acolhimento) => (
                      <li key={acolhimento.id} className="px-5 py-4">
                        <p className="font-semibold">{acolhimento.nome}</p>
                        <p className="text-sm text-nevoa-600">
                          Desde {formatarData(acolhimento.data_entrada)} ·{" "}
                          {diferencaEmDias(acolhimento.data_entrada, null)} dias
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <Secao titulo="Atalhos" descricao="Ações mais usadas no dia a dia">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { para: "/familias", titulo: "Cadastrar família", texto: "Novo cadastro assistido" },
                { para: "/cestas", titulo: "Registrar cesta", texto: "Entrada ou entrega" },
                { para: "/relatorios", titulo: "Gerar relatório", texto: "Prestação de contas" },
              ].map((atalho) => (
                <Link
                  key={atalho.para}
                  to={atalho.para}
                  className="cartao group flex items-center justify-between gap-3 px-5 py-4 hover:border-agua-200 hover:bg-agua-50"
                >
                  <span>
                    <span className="block font-semibold">{atalho.titulo}</span>
                    <span className="block text-sm text-nevoa-600">{atalho.texto}</span>
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-nevoa-500 group-hover:text-agua-700"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </Secao>
        </>
      )}
    </>
  )
}
