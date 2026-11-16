import { readFileSync } from "node:fs"
import pg from "pg"

const senha = process.env.SENHA_SUPABASE
const referencia = "baueyucqszrkgqmngddh"

const candidatos = [
  `postgresql://postgres:${encodeURIComponent(senha)}@db.${referencia}.supabase.co:5432/postgres`,
  `postgresql://postgres.${referencia}:${encodeURIComponent(senha)}@aws-0-sa-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${referencia}:${encodeURIComponent(senha)}@aws-1-sa-east-1.pooler.supabase.com:5432/postgres`,
  `postgresql://postgres.${referencia}:${encodeURIComponent(senha)}@aws-0-us-east-1.pooler.supabase.com:5432/postgres`,
]

const sql = readFileSync("supabase/schema.sql", "utf8")

for (const url of candidatos) {
  const host = new URL(url).host
  const cliente = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 })
  try {
    await cliente.connect()
    console.log("conectado em", host)
    await cliente.query(sql)
    console.log("SCHEMA APLICADO COM SUCESSO")
    const { rows } = await cliente.query(
      "select table_name from information_schema.tables where table_schema='public' order by 1",
    )
    console.log("tabelas:", rows.map((r) => r.table_name).join(", "))
    await cliente.end()
    process.exit(0)
  } catch (erro) {
    console.log("falhou em", host, "->", erro.message.slice(0, 120))
    try { await cliente.end() } catch {}
  }
}
process.exit(1)
