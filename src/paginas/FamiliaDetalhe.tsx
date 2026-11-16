import { ArrowLeft } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { IconeAtendimento, IconeCesta, IconeFamilias } from "../componentes/Icones"
import {
  Carregando,
  EstadoVazio,
  Etiqueta,
  Indicador,
  Secao,
} from "../componentes/Interface"
import { useAtendimentos, useEntregas, useFamilia } from "../dados/consultas"
import { formatarData, telefoneFormatado } from "../lib/formato"
import { ROTULOS_TIPO_ATENDIMENTO } from "../tipos"
import { CORES_TIPO } from "./Atendimentos"

export function FamiliaDetalhe() {
  const { id } = useParams<{ id: string }>()
  const familia = useFamilia(id)
  const atendimentos = useAtendimentos(id)
  const entregas = useEntregas(id)

  if (familia.isLoading) return <Carregando />

  if (familia.isError || !familia.data) {
    return (
      <div className="cartao">
        <EstadoVazio
          titulo="Família não encontrada"
          descricao="O cadastro pode ter sido removido."
          acao={
            <Link to="/familias" className="botao-primario">
              Voltar para a lista
            </Link>
          }
        />
      </div>
    )
  }

  const dados = familia.data
  const totalCestas = (entregas.data ?? []).reduce((soma, item) => soma + item.quantidade, 0)

  return (
    <>
      <Link
        to="/familias"
        className="sem-impressao mb-5 inline-flex items-center gap-2 font-semibold text-agua-700 underline underline-offset-4"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        Todas as famílias
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-nevoa-200 pb-6">
        <div>
          <p className="rotulo-mini">Família assistida</p>
          <h1 className="mt-1 text-[2.1rem] leading-tight">{dados.responsavel}</h1>
          <p className="mt-1 text-lg text-nevoa-600">
            {dados.endereco ?? "Sem endereço"}
            {dados.bairro ? ` · ${dados.bairro}` : ""}
          </p>
        </div>
        <Etiqueta
          texto={dados.situacao === "ativa" ? "Cadastro ativo" : "Cadastro inativo"}
          cor={
            dados.situacao === "ativa"
              ? "bg-bom-100 text-bom-600"
              : "bg-nevoa-200 text-tinta-700"
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Indicador
          titulo="Pessoas na casa"
          valor={dados.quantidade_pessoas}
          detalhe={`${dados.quantidade_criancas} criança(s)`}
          icone={<IconeFamilias className="h-6 w-6" />}
        />
        <Indicador
          titulo="Atendimentos"
          valor={atendimentos.data?.length ?? 0}
          detalhe="Desde o cadastro"
          icone={<IconeAtendimento className="h-6 w-6" />}
          tom="brasa"
        />
        <Indicador
          titulo="Cestas recebidas"
          valor={totalCestas}
          detalhe={`${entregas.data?.length ?? 0} entrega(s)`}
          icone={<IconeCesta className="h-6 w-6" />}
          tom="bom"
        />
      </div>

      <Secao titulo="Dados cadastrais">
        <dl className="cartao grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="rotulo-mini">Documento</dt>
            <dd className="text-lg">{dados.documento ?? "—"}</dd>
          </div>
          <div>
            <dt className="rotulo-mini">Telefone</dt>
            <dd className="text-lg">{telefoneFormatado(dados.telefone)}</dd>
          </div>
          <div>
            <dt className="rotulo-mini">Cadastrada em</dt>
            <dd className="text-lg">{formatarData(dados.criado_em)}</dd>
          </div>
          <div>
            <dt className="rotulo-mini">Bairro</dt>
            <dd className="text-lg">{dados.bairro ?? "—"}</dd>
          </div>
          {dados.observacoes ? (
            <div className="sm:col-span-2 lg:col-span-4">
              <dt className="rotulo-mini">Observações</dt>
              <dd className="text-lg">{dados.observacoes}</dd>
            </div>
          ) : null}
        </dl>
      </Secao>

      <Secao titulo="Histórico de atendimentos">
        <div className="cartao overflow-hidden">
          {(atendimentos.data ?? []).length === 0 ? (
            <EstadoVazio
              titulo="Nenhum atendimento"
              descricao="Esta família ainda não recebeu atendimento registrado."
            />
          ) : (
            <ul className="divide-y divide-nevoa-200">
              {atendimentos.data?.map((atendimento) => (
                <li key={atendimento.id} className="flex flex-wrap gap-3 px-5 py-4">
                  <span className="w-24 shrink-0 font-semibold tabular-nums">
                    {formatarData(atendimento.data)}
                  </span>
                  <div className="min-w-56 flex-1">
                    <p>{atendimento.descricao}</p>
                    {atendimento.encaminhamento ? (
                      <p className="text-sm text-nevoa-600">
                        Encaminhamento: {atendimento.encaminhamento}
                      </p>
                    ) : null}
                  </div>
                  <Etiqueta
                    texto={ROTULOS_TIPO_ATENDIMENTO[atendimento.tipo]}
                    cor={`${CORES_TIPO[atendimento.tipo]} h-fit`}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </Secao>

      <Secao titulo="Cestas recebidas">
        <div className="cartao overflow-hidden">
          {(entregas.data ?? []).length === 0 ? (
            <EstadoVazio
              titulo="Nenhuma cesta entregue"
              descricao="Registre a entrega na página de cestas básicas."
            />
          ) : (
            <ul className="divide-y divide-nevoa-200">
              {entregas.data?.map((entrega) => (
                <li key={entrega.id} className="flex flex-wrap gap-3 px-5 py-4">
                  <span className="w-24 shrink-0 font-semibold tabular-nums">
                    {formatarData(entrega.data)}
                  </span>
                  <span className="flex-1">
                    {entrega.quantidade} cesta(s)
                    {entrega.observacao ? ` — ${entrega.observacao}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Secao>
    </>
  )
}
