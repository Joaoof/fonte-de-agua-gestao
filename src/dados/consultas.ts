import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { supabase } from "../lib/supabase"
import type {
  Acolhimento,
  Atendimento,
  DoacaoCesta,
  EntregaCesta,
  EstoqueCestas,
  Familia,
  Voluntario,
} from "../tipos"

type Resposta = { error: { message: string } | null }

async function exigir<T>(promessa: PromiseLike<{ data: T | null; error: { message: string } | null }>) {
  const { data, error } = await promessa
  if (error) throw new Error(error.message)
  return (data ?? []) as T
}

export function useFamilias(busca = "") {
  return useQuery({
    queryKey: ["familias", busca],
    queryFn: async () => {
      let consulta = supabase.from("familias").select("*").order("responsavel")
      if (busca.trim()) {
        const termo = `%${busca.trim()}%`
        consulta = consulta.or(
          `responsavel.ilike.${termo},documento.ilike.${termo},endereco.ilike.${termo}`,
        )
      }
      return exigir<Familia[]>(consulta)
    },
  })
}

export function useFamilia(id: string | undefined) {
  return useQuery({
    queryKey: ["familia", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = await supabase.from("familias").select("*").eq("id", id!).single()
      if (error) throw new Error(error.message)
      return data as Familia
    },
  })
}

export function useAtendimentos(familiaId?: string, inicio?: string, fim?: string) {
  return useQuery({
    queryKey: ["atendimentos", familiaId ?? "todos", inicio ?? "", fim ?? ""],
    queryFn: async () => {
      let consulta = supabase
        .from("atendimentos")
        .select("*, familias(id, responsavel)")
        .order("data", { ascending: false })
        .order("criado_em", { ascending: false })
      if (familiaId) consulta = consulta.eq("familia_id", familiaId)
      if (inicio) consulta = consulta.gte("data", inicio)
      if (fim) consulta = consulta.lte("data", fim)
      return exigir<Atendimento[]>(consulta)
    },
  })
}

export function useEntregas(familiaId?: string, inicio?: string, fim?: string) {
  return useQuery({
    queryKey: ["entregas", familiaId ?? "todas", inicio ?? "", fim ?? ""],
    queryFn: async () => {
      let consulta = supabase
        .from("entregas_cesta")
        .select("*, familias(id, responsavel)")
        .order("data", { ascending: false })
        .order("criado_em", { ascending: false })
      if (familiaId) consulta = consulta.eq("familia_id", familiaId)
      if (inicio) consulta = consulta.gte("data", inicio)
      if (fim) consulta = consulta.lte("data", fim)
      return exigir<EntregaCesta[]>(consulta)
    },
  })
}

export function useDoacoes(inicio?: string, fim?: string) {
  return useQuery({
    queryKey: ["doacoes", inicio ?? "", fim ?? ""],
    queryFn: async () => {
      let consulta = supabase.from("doacoes_cesta").select("*").order("data", { ascending: false })
      if (inicio) consulta = consulta.gte("data", inicio)
      if (fim) consulta = consulta.lte("data", fim)
      return exigir<DoacaoCesta[]>(consulta)
    },
  })
}

export function useEstoque() {
  return useQuery({
    queryKey: ["estoque"],
    queryFn: async () => {
      const { data, error } = await supabase.from("estoque_cestas").select("*").single()
      if (error) throw new Error(error.message)
      return data as EstoqueCestas
    },
  })
}

export function useAcolhimentos(apenasAtivos = false) {
  return useQuery({
    queryKey: ["acolhimentos", apenasAtivos],
    queryFn: async () => {
      let consulta = supabase
        .from("acolhimentos")
        .select("*, familias(id, responsavel)")
        .order("data_entrada", { ascending: false })
      if (apenasAtivos) consulta = consulta.is("data_saida", null)
      return exigir<Acolhimento[]>(consulta)
    },
  })
}

export function useVoluntarios() {
  return useQuery({
    queryKey: ["voluntarios"],
    queryFn: async () =>
      exigir<Voluntario[]>(
        supabase.from("voluntarios").select("*").order("ativo", { ascending: false }).order("nome"),
      ),
  })
}

export function useSalvar(tabela: string, chavesParaInvalidar: string[]) {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, valores }: { id?: string; valores: Record<string, unknown> }) => {
      const tabelaSemTipo = supabase.from(tabela) as unknown as {
        update: (v: Record<string, unknown>) => { eq: (c: string, v: string) => Promise<Resposta> }
        insert: (v: Record<string, unknown>) => Promise<Resposta>
      }
      const resposta = id
        ? await tabelaSemTipo.update(valores).eq("id", id)
        : await tabelaSemTipo.insert(valores)
      if (resposta.error) throw new Error(traduzir(resposta.error.message))
    },
    onSuccess: () => {
      for (const chave of chavesParaInvalidar) {
        cliente.invalidateQueries({ queryKey: [chave] })
      }
    },
  })
}

export function useExcluir(tabela: string, chavesParaInvalidar: string[]) {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(tabela).delete().eq("id", id)
      if (error) throw new Error(traduzir(error.message))
    },
    onSuccess: () => {
      for (const chave of chavesParaInvalidar) {
        cliente.invalidateQueries({ queryKey: [chave] })
      }
    },
  })
}

function traduzir(mensagem: string) {
  if (mensagem.includes("violates row-level security")) {
    return "Você não tem permissão para esta ação. Apenas a liderança pode excluir registros."
  }
  if (mensagem.includes("duplicate key")) return "Já existe um registro com estes dados."
  if (mensagem.includes("violates foreign key")) {
    return "Existem registros vinculados. Remova-os antes de excluir."
  }
  return mensagem
}
