import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, posix, relative, sep } from "node:path"

const token = process.env.VERCEL_TOKEN
const nome = "fonte-de-agua-gestao"
const raiz = "dist"

function listar(diretorio) {
  const encontrados = []
  for (const item of readdirSync(diretorio)) {
    const caminho = join(diretorio, item)
    if (statSync(caminho).isDirectory()) encontrados.push(...listar(caminho))
    else encontrados.push(caminho)
  }
  return encontrados
}

const arquivos = listar(raiz).map((caminho) => ({
  file: relative(raiz, caminho).split(sep).join(posix.sep),
  data: readFileSync(caminho).toString("base64"),
  encoding: "base64",
}))

console.log("arquivos:", arquivos.map((a) => a.file).join(", "))

const resposta = await fetch("https://api.vercel.com/v13/deployments?forceNew=1", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    name: nome,
    files: arquivos,
    target: "production",
    projectSettings: {
      framework: null,
      buildCommand: null,
      installCommand: null,
      outputDirectory: null,
      devCommand: null,
    },
    routes: [{ handle: "filesystem" }, { src: "/.*", dest: "/index.html" }],
  }),
})

const corpo = await resposta.json()

if (!resposta.ok) {
  console.error("FALHOU", resposta.status, JSON.stringify(corpo).slice(0, 900))
  process.exit(1)
}

console.log("deployment:", corpo.url)
console.log("estado inicial:", corpo.readyState)

const identificador = corpo.id
for (let tentativa = 0; tentativa < 60; tentativa += 1) {
  await new Promise((resolver) => setTimeout(resolver, 4000))
  const consulta = await fetch(`https://api.vercel.com/v13/deployments/${identificador}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const estado = await consulta.json()
  if (estado.readyState === "READY") {
    console.log("PRONTO")
    console.log("url:", `https://${estado.url}`)
    for (const alias of estado.alias ?? []) console.log("alias:", `https://${alias}`)
    process.exit(0)
  }
  if (["ERROR", "CANCELED"].includes(estado.readyState)) {
    console.error("deploy falhou:", estado.readyState, estado.errorMessage ?? "")
    process.exit(1)
  }
  console.log("aguardando...", estado.readyState)
}
console.error("tempo esgotado")
process.exit(1)
