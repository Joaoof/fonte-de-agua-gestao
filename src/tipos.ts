export type PapelUsuario = "lideranca" | "voluntario"

export type Perfil = {
  id: string
  nome: string
  papel: PapelUsuario
  criado_em: string
}

export type SituacaoFamilia = "ativa" | "inativa"

export type Familia = {
  id: string
  responsavel: string
  documento: string | null
  telefone: string | null
  endereco: string | null
  bairro: string | null
  quantidade_pessoas: number
  quantidade_criancas: number
  situacao: SituacaoFamilia
  observacoes: string | null
  criado_em: string
  criado_por: string | null
}

export type TipoAtendimento = "alimentacao" | "moradia" | "saude" | "orientacao" | "outro"

export type Atendimento = {
  id: string
  familia_id: string
  data: string
  tipo: TipoAtendimento
  descricao: string
  encaminhamento: string | null
  criado_em: string
  criado_por: string | null
  familias?: Pick<Familia, "id" | "responsavel"> | null
}

export type DoacaoCesta = {
  id: string
  data: string
  quantidade: number
  doador: string | null
  observacao: string | null
  criado_em: string
  criado_por: string | null
}

export type EntregaCesta = {
  id: string
  familia_id: string
  data: string
  quantidade: number
  observacao: string | null
  criado_em: string
  criado_por: string | null
  familias?: Pick<Familia, "id" | "responsavel"> | null
}

export type Acolhimento = {
  id: string
  nome: string
  familia_id: string | null
  data_entrada: string
  data_saida: string | null
  motivo: string | null
  observacoes: string | null
  criado_em: string
  criado_por: string | null
  familias?: Pick<Familia, "id" | "responsavel"> | null
}

export type FuncaoVoluntario = "obreiro" | "musico" | "acao_social" | "outro"

export type Voluntario = {
  id: string
  nome: string
  funcao: FuncaoVoluntario
  telefone: string | null
  ativo: boolean
  criado_em: string
  criado_por: string | null
}

export type EstoqueCestas = {
  recebidas: number
  entregues: number
  saldo: number
}

export const ROTULOS_TIPO_ATENDIMENTO: Record<TipoAtendimento, string> = {
  alimentacao: "Alimentação",
  moradia: "Moradia",
  saude: "Saúde",
  orientacao: "Orientação",
  outro: "Outro",
}

export const ROTULOS_FUNCAO: Record<FuncaoVoluntario, string> = {
  obreiro: "Obreiro",
  musico: "Músico",
  acao_social: "Ação social",
  outro: "Outro",
}
