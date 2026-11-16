import { Navigate, Route, Routes } from "react-router-dom"

import { Carregando } from "./componentes/Interface"
import { Layout } from "./componentes/Layout"
import { useAutenticacao } from "./contexto/Autenticacao"
import { Atendimentos } from "./paginas/Atendimentos"
import { CasaDeApoio } from "./paginas/CasaDeApoio"
import { Cestas } from "./paginas/Cestas"
import { Entrar } from "./paginas/Entrar"
import { FamiliaDetalhe } from "./paginas/FamiliaDetalhe"
import { Familias } from "./paginas/Familias"
import { Painel } from "./paginas/Painel"
import { Relatorios } from "./paginas/Relatorios"
import { Voluntarios } from "./paginas/Voluntarios"

export function App() {
  const { sessao, carregando } = useAutenticacao()

  if (carregando) {
    return (
      <div className="grid min-h-screen place-items-center">
        <Carregando texto="Abrindo o sistema..." />
      </div>
    )
  }

  if (!sessao) {
    return (
      <Routes>
        <Route path="/entrar" element={<Entrar />} />
        <Route path="*" element={<Navigate to="/entrar" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="/entrar" element={<Navigate to="/" replace />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Painel />} />
        <Route path="/familias" element={<Familias />} />
        <Route path="/familias/:id" element={<FamiliaDetalhe />} />
        <Route path="/atendimentos" element={<Atendimentos />} />
        <Route path="/cestas" element={<Cestas />} />
        <Route path="/casa-de-apoio" element={<CasaDeApoio />} />
        <Route path="/voluntarios" element={<Voluntarios />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
