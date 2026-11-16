import pg from "pg"

const senhaBanco = process.env.SENHA_SUPABASE
const email = process.env.EMAIL_USUARIO
const senha = process.env.SENHA_USUARIO
const nome = process.env.NOME_USUARIO ?? email

if (!senhaBanco || !email || !senha) {
  console.error("Defina SENHA_SUPABASE, EMAIL_USUARIO e SENHA_USUARIO")
  process.exit(1)
}

const referencia = "baueyucqszrkgqmngddh"
const cliente = new pg.Client({
  connectionString: `postgresql://postgres:${encodeURIComponent(senhaBanco)}@db.${referencia}.supabase.co:5432/postgres`,
  ssl: { rejectUnauthorized: false },
})

await cliente.connect()

const existente = await cliente.query("select id from auth.users where email = $1", [email])

if (existente.rows.length > 0) {
  await cliente.query(
    `update auth.users
        set encrypted_password = crypt($2, gen_salt('bf')),
            email_confirmed_at = coalesce(email_confirmed_at, now()),
            updated_at = now()
      where email = $1`,
    [email, senha],
  )
  console.log("senha redefinida para o usuário existente:", email)
} else {
  const { rows } = await cliente.query(
    `insert into auth.users (
       instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       created_at, updated_at, raw_app_meta_data, raw_user_meta_data
     ) values (
       '00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated',
       $1, crypt($2, gen_salt('bf')), now(), now(), now(),
       '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('nome', $3::text)
     ) returning id`,
    [email, senha, nome],
  )
  const id = rows[0].id
  await cliente.query(
    `insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
     values ($1::text, $1::uuid, jsonb_build_object('sub', $1::text, 'email', $2::text, 'email_verified', true), 'email', now(), now(), now())
     on conflict do nothing`,
    [id, email],
  )
  console.log("usuário criado:", email)
}

await cliente.query(
  `update auth.users
      set confirmation_token = coalesce(confirmation_token, ''),
          recovery_token = coalesce(recovery_token, ''),
          email_change = coalesce(email_change, ''),
          email_change_token_new = coalesce(email_change_token_new, ''),
          email_change_token_current = coalesce(email_change_token_current, ''),
          phone_change = coalesce(phone_change, ''),
          phone_change_token = coalesce(phone_change_token, ''),
          reauthentication_token = coalesce(reauthentication_token, '')
    where email = $1`,
  [email],
)

await cliente.query(
  `update public.perfis set papel = 'lideranca'
    where id = (select id from auth.users where email = $1)`,
  [email],
)

const perfil = await cliente.query(
  `select p.nome, p.papel from public.perfis p
     join auth.users u on u.id = p.id
    where u.email = $1`,
  [email],
)
console.log("perfil:", JSON.stringify(perfil.rows[0]))

await cliente.end()
