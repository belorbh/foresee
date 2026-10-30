-- =====================================================================
-- FORESEE · banco de dados v1
-- Multi-loja: cada loja só enxerga os próprios dados (Row Level Security).
-- Pode rodar de novo sem quebrar (tabelas "if not exists", funções
-- "create or replace", regras recriadas).
-- =====================================================================

-- ---------- Tabelas -------------------------------------------------

create or replace function public.gerar_codigo_convite()
returns text language sql volatile set search_path = public as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 1 + floor(random() * 32)::int, 1), '')
  from generate_series(1, 6);
$$;

create table if not exists public.lojas (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null check (char_length(trim(nome)) between 2 and 80),
  cidade          text,
  telefone        text,
  instagram       text,
  meta_mensal     numeric(12,2) not null default 0 check (meta_mensal >= 0),
  codigo_convite  text not null unique default public.gerar_codigo_convite(),
  criado_por      uuid references auth.users(id) on delete set null,
  created_at      timestamptz not null default now()
);

create table if not exists public.membros (
  loja_id     uuid not null references public.lojas(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  nome        text not null,
  papel       text not null default 'vendedor' check (papel in ('dono', 'vendedor')),
  created_at  timestamptz not null default now(),
  primary key (loja_id, user_id)
);

create table if not exists public.produtos (
  id          uuid primary key default gen_random_uuid(),
  loja_id     uuid not null references public.lojas(id) on delete cascade,
  nome        text not null,
  categoria   text,
  marca       text,
  custo       numeric(12,2) not null default 0 check (custo >= 0),
  preco       numeric(12,2) not null default 0 check (preco >= 0),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (id, loja_id)
);

create table if not exists public.variacoes (
  id              uuid primary key default gen_random_uuid(),
  loja_id         uuid not null references public.lojas(id) on delete cascade,
  produto_id      uuid not null,
  tamanho         text not null default 'Único',
  cor             text not null default '',
  codigo          text,
  estoque         integer not null default 0,
  estoque_minimo  integer not null default 1 check (estoque_minimo >= 0),
  ativo           boolean not null default true,
  created_at      timestamptz not null default now(),
  unique (produto_id, tamanho, cor),
  unique (id, loja_id),
  foreign key (produto_id, loja_id) references public.produtos(id, loja_id) on delete cascade
);

create table if not exists public.clientes (
  id          uuid primary key default gen_random_uuid(),
  loja_id     uuid not null references public.lojas(id) on delete cascade,
  nome        text not null check (char_length(trim(nome)) >= 1),
  telefone    text,
  instagram   text,
  aniversario date,
  origem      text,
  observacao  text,
  created_at  timestamptz not null default now(),
  unique (id, loja_id)
);

create table if not exists public.vendas (
  id               uuid primary key default gen_random_uuid(),
  loja_id          uuid not null references public.lojas(id) on delete cascade,
  numero           integer not null,
  data             timestamptz not null default now(),
  cliente_id       uuid,
  vendedor_id      uuid references auth.users(id) on delete set null,
  vendedor_nome    text,
  subtotal         numeric(12,2) not null default 0,
  desconto         numeric(12,2) not null default 0,
  total            numeric(12,2) not null default 0,
  custo_total      numeric(12,2) not null default 0,
  pecas            integer not null default 0,
  forma_pagamento  text not null,
  parcelas         integer not null default 1,
  status           text not null default 'concluida' check (status in ('concluida', 'cancelada')),
  observacao       text,
  cancelada_em     timestamptz,
  created_at       timestamptz not null default now(),
  unique (loja_id, numero),
  unique (id, loja_id),
  foreign key (cliente_id, loja_id) references public.clientes(id, loja_id) on delete set null (cliente_id)
);

create table if not exists public.venda_itens (
  id           uuid primary key default gen_random_uuid(),
  loja_id      uuid not null references public.lojas(id) on delete cascade,
  venda_id     uuid not null,
  produto_id   uuid,
  variacao_id  uuid,
  descricao    text not null,
  quantidade   integer not null check (quantidade > 0),
  preco_unit   numeric(12,2) not null,
  custo_unit   numeric(12,2) not null default 0,
  total        numeric(12,2) not null,
  foreign key (venda_id, loja_id)    references public.vendas(id, loja_id)    on delete cascade,
  foreign key (produto_id, loja_id)  references public.produtos(id, loja_id)  on delete set null (produto_id),
  foreign key (variacao_id, loja_id) references public.variacoes(id, loja_id) on delete set null (variacao_id)
);

create table if not exists public.movimentos_estoque (
  id           uuid primary key default gen_random_uuid(),
  loja_id      uuid not null references public.lojas(id) on delete cascade,
  variacao_id  uuid not null,
  tipo         text not null check (tipo in ('inicial', 'entrada', 'ajuste', 'venda', 'cancelamento')),
  quantidade   integer not null,
  saldo        integer,
  motivo       text,
  venda_id     uuid,
  user_id      uuid,
  created_at   timestamptz not null default now(),
  foreign key (variacao_id, loja_id) references public.variacoes(id, loja_id) on delete cascade
);

create table if not exists public.despesas (
  id          uuid primary key default gen_random_uuid(),
  loja_id     uuid not null references public.lojas(id) on delete cascade,
  data        date not null default current_date,
  descricao   text not null,
  categoria   text not null default 'Outros',
  valor       numeric(12,2) not null check (valor > 0),
  tipo        text not null default 'variavel' check (tipo in ('fixa', 'variavel')),
  created_at  timestamptz not null default now()
);

create index if not exists membros_user_idx       on public.membros (user_id);
create index if not exists produtos_loja_idx      on public.produtos (loja_id);
create index if not exists variacoes_produto_idx  on public.variacoes (produto_id);
create index if not exists variacoes_loja_idx     on public.variacoes (loja_id);
create index if not exists clientes_loja_idx      on public.clientes (loja_id);
create index if not exists vendas_loja_data_idx   on public.vendas (loja_id, data);
create index if not exists vendas_cliente_idx     on public.vendas (cliente_id);
create index if not exists venda_itens_venda_idx  on public.venda_itens (venda_id);
create index if not exists venda_itens_loja_idx   on public.venda_itens (loja_id);
create index if not exists movimentos_var_idx     on public.movimentos_estoque (variacao_id);
create index if not exists despesas_loja_data_idx on public.despesas (loja_id, data);

-- ---------- Quem é quem ----------------------------------------------

create or replace function public.eh_membro(p_loja uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros where loja_id = p_loja and user_id = auth.uid());
$$;

create or replace function public.eh_dono(p_loja uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.membros
                 where loja_id = p_loja and user_id = auth.uid() and papel = 'dono');
$$;

-- ---------- Regras de acesso (RLS) -----------------------------------

alter table public.lojas              enable row level security;
alter table public.membros            enable row level security;
alter table public.produtos           enable row level security;
alter table public.variacoes          enable row level security;
alter table public.clientes           enable row level security;
alter table public.vendas             enable row level security;
alter table public.venda_itens        enable row level security;
alter table public.movimentos_estoque enable row level security;
alter table public.despesas           enable row level security;

drop policy if exists lojas_ver      on public.lojas;
drop policy if exists lojas_editar   on public.lojas;
create policy lojas_ver    on public.lojas for select to authenticated using (public.eh_membro(id));
create policy lojas_editar on public.lojas for update to authenticated using (public.eh_dono(id)) with check (public.eh_dono(id));

drop policy if exists membros_ver     on public.membros;
drop policy if exists membros_remover on public.membros;
create policy membros_ver     on public.membros for select to authenticated using (public.eh_membro(loja_id));
create policy membros_remover on public.membros for delete to authenticated
  using (public.eh_dono(loja_id) and user_id <> auth.uid());

-- Produtos, grade e estoque: leitura direta; gravação só pelas funções (estoque sempre registrado)
drop policy if exists produtos_ver   on public.produtos;
drop policy if exists variacoes_ver  on public.variacoes;
drop policy if exists movimentos_ver on public.movimentos_estoque;
create policy produtos_ver   on public.produtos           for select to authenticated using (public.eh_membro(loja_id));
create policy variacoes_ver  on public.variacoes          for select to authenticated using (public.eh_membro(loja_id));
create policy movimentos_ver on public.movimentos_estoque for select to authenticated using (public.eh_membro(loja_id));

-- Vendas: leitura direta; registrar/cancelar só pelas funções
drop policy if exists vendas_ver      on public.vendas;
drop policy if exists venda_itens_ver on public.venda_itens;
create policy vendas_ver      on public.vendas      for select to authenticated using (public.eh_membro(loja_id));
create policy venda_itens_ver on public.venda_itens for select to authenticated using (public.eh_membro(loja_id));

-- Clientes: toda a equipe cadastra e edita
drop policy if exists clientes_tudo on public.clientes;
create policy clientes_tudo on public.clientes for all to authenticated
  using (public.eh_membro(loja_id)) with check (public.eh_membro(loja_id));

-- Despesas: só o dono
drop policy if exists despesas_dono on public.despesas;
create policy despesas_dono on public.despesas for all to authenticated
  using (public.eh_dono(loja_id)) with check (public.eh_dono(loja_id));

-- ---------- Funções: loja e equipe -----------------------------------

create or replace function public.criar_loja(p_nome text, p_cidade text, p_seu_nome text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if auth.uid() is null then raise exception 'Faça login novamente.'; end if;
  if coalesce(trim(p_nome), '') = '' then raise exception 'Informe o nome da loja.'; end if;
  if (select count(*) from membros where user_id = auth.uid() and papel = 'dono') >= 10 then
    raise exception 'Limite de lojas atingido.';
  end if;
  insert into lojas (nome, cidade, criado_por)
    values (trim(p_nome), nullif(trim(p_cidade), ''), auth.uid())
    returning id into v_id;
  insert into membros (loja_id, user_id, nome, papel)
    values (v_id, auth.uid(), coalesce(nullif(trim(p_seu_nome), ''), 'Dono'), 'dono');
  return v_id;
end $$;

create or replace function public.entrar_com_convite(p_codigo text, p_seu_nome text)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_loja uuid;
begin
  if auth.uid() is null then raise exception 'Faça login novamente.'; end if;
  select id into v_loja from lojas where codigo_convite = upper(trim(p_codigo));
  if v_loja is null then raise exception 'Código de convite inválido.'; end if;
  insert into membros (loja_id, user_id, nome, papel)
    values (v_loja, auth.uid(), coalesce(nullif(trim(p_seu_nome), ''), 'Vendedor'), 'vendedor')
    on conflict (loja_id, user_id) do nothing;
  return v_loja;
end $$;

create or replace function public.novo_codigo_convite(p_loja uuid)
returns text language plpgsql security definer set search_path = public as $$
declare v_codigo text;
begin
  if not eh_dono(p_loja) then raise exception 'Só o dono pode trocar o código.'; end if;
  update lojas set codigo_convite = gerar_codigo_convite() where id = p_loja
    returning codigo_convite into v_codigo;
  return v_codigo;
end $$;

-- ---------- Funções: produtos e estoque ------------------------------

create or replace function public.salvar_produto(p_loja uuid, p_produto jsonb, p_variacoes jsonb)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_id      uuid := nullif(p_produto->>'id', '')::uuid;
  v_item    jsonb;
  v_var_id  uuid;
  v_ids     uuid[] := '{}';
  v_tam     text;
  v_cor     text;
  v_cod     text;
  v_min     integer;
  v_ini     integer;
  v_saldo   integer;
begin
  if not eh_membro(p_loja) then raise exception 'Sem acesso a esta loja.'; end if;
  if coalesce(trim(p_produto->>'nome'), '') = '' then raise exception 'Dê um nome ao produto.'; end if;

  if v_id is null then
    insert into produtos (loja_id, nome, categoria, marca, custo, preco)
    values (p_loja, trim(p_produto->>'nome'),
            nullif(trim(p_produto->>'categoria'), ''), nullif(trim(p_produto->>'marca'), ''),
            coalesce((p_produto->>'custo')::numeric, 0), coalesce((p_produto->>'preco')::numeric, 0))
    returning id into v_id;
  else
    update produtos set
      nome = trim(p_produto->>'nome'),
      categoria = nullif(trim(p_produto->>'categoria'), ''),
      marca = nullif(trim(p_produto->>'marca'), ''),
      custo = coalesce((p_produto->>'custo')::numeric, 0),
      preco = coalesce((p_produto->>'preco')::numeric, 0),
      ativo = true,
      updated_at = now()
    where id = v_id and loja_id = p_loja;
    if not found then raise exception 'Produto não encontrado.'; end if;
  end if;

  if p_variacoes is null or jsonb_typeof(p_variacoes) <> 'array' or jsonb_array_length(p_variacoes) = 0 then
    p_variacoes := '[{"tamanho":"Único","cor":""}]'::jsonb;
  end if;

  for v_item in select * from jsonb_array_elements(p_variacoes) loop
    v_tam := coalesce(nullif(trim(v_item->>'tamanho'), ''), 'Único');
    v_cor := coalesce(trim(v_item->>'cor'), '');
    v_cod := nullif(trim(v_item->>'codigo'), '');
    v_min := greatest(coalesce((v_item->>'estoque_minimo')::int, 1), 0);
    v_ini := greatest(coalesce((v_item->>'estoque_inicial')::int, 0), 0);
    v_var_id := nullif(v_item->>'id', '')::uuid;

    if v_var_id is not null then
      update variacoes set tamanho = v_tam, cor = v_cor, codigo = v_cod, estoque_minimo = v_min, ativo = true
        where id = v_var_id and produto_id = v_id;
      if not found then raise exception 'Variação inválida.'; end if;
    else
      select id into v_var_id from variacoes where produto_id = v_id and tamanho = v_tam and cor = v_cor;
      if v_var_id is null then
        insert into variacoes (loja_id, produto_id, tamanho, cor, codigo, estoque, estoque_minimo)
          values (p_loja, v_id, v_tam, v_cor, v_cod, 0, v_min)
          returning id into v_var_id;
      else
        update variacoes set ativo = true, codigo = coalesce(v_cod, codigo), estoque_minimo = v_min
          where id = v_var_id;
      end if;
      if v_ini > 0 then
        update variacoes set estoque = estoque + v_ini where id = v_var_id returning estoque into v_saldo;
        insert into movimentos_estoque (loja_id, variacao_id, tipo, quantidade, saldo, motivo, user_id)
          values (p_loja, v_var_id, 'inicial', v_ini, v_saldo, 'Cadastro do produto', auth.uid());
      end if;
    end if;
    v_ids := v_ids || v_var_id;
  end loop;

  update variacoes set ativo = false where produto_id = v_id and not (id = any (v_ids));
  return v_id;
end $$;

create or replace function public.arquivar_produto(p_produto uuid, p_ativo boolean)
returns void language plpgsql security definer set search_path = public as $$
declare v_loja uuid;
begin
  select loja_id into v_loja from produtos where id = p_produto;
  if v_loja is null or not eh_membro(v_loja) then raise exception 'Produto não encontrado.'; end if;
  update produtos set ativo = p_ativo, updated_at = now() where id = p_produto;
end $$;

create or replace function public.movimentar_estoque(p_variacao uuid, p_tipo text, p_quantidade integer, p_motivo text default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  v       record;
  v_delta integer;
  v_saldo integer;
begin
  select * into v from variacoes where id = p_variacao for update;
  if not found or not eh_membro(v.loja_id) then raise exception 'Peça não encontrada.'; end if;
  if p_tipo = 'entrada' then
    if p_quantidade is null or p_quantidade <= 0 then raise exception 'Informe quantas peças chegaram.'; end if;
    v_delta := p_quantidade;
  elsif p_tipo = 'ajuste' then
    if p_quantidade is null or p_quantidade < 0 then raise exception 'Informe a quantidade contada.'; end if;
    v_delta := p_quantidade - v.estoque;
  else
    raise exception 'Tipo de movimento inválido.';
  end if;
  if v_delta = 0 then return v.estoque; end if;
  update variacoes set estoque = estoque + v_delta where id = p_variacao returning estoque into v_saldo;
  insert into movimentos_estoque (loja_id, variacao_id, tipo, quantidade, saldo, motivo, user_id)
    values (v.loja_id, p_variacao, p_tipo, v_delta, v_saldo, nullif(trim(p_motivo), ''), auth.uid());
  return v_saldo;
end $$;

-- ---------- Funções: vendas ------------------------------------------

create or replace function public.registrar_venda(
  p_loja      uuid,
  p_itens     jsonb,
  p_forma     text,
  p_desconto  numeric default 0,
  p_parcelas  integer default 1,
  p_cliente   uuid default null,
  p_obs       text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_uid       uuid := auth.uid();
  v_nome      text;
  v_numero    integer;
  v_venda     uuid;
  v_item      jsonb;
  v_var       record;
  v_qtd       integer;
  v_preco     numeric(12,2);
  v_subtotal  numeric(12,2) := 0;
  v_custo     numeric(12,2) := 0;
  v_pecas     integer := 0;
  v_desc      numeric(12,2) := round(coalesce(p_desconto, 0), 2);
  v_saldo     integer;
begin
  if v_uid is null then raise exception 'Faça login novamente.'; end if;
  select nome into v_nome from membros where loja_id = p_loja and user_id = v_uid;
  if not found then raise exception 'Sem acesso a esta loja.'; end if;
  if p_itens is null or jsonb_typeof(p_itens) <> 'array' or jsonb_array_length(p_itens) = 0 then
    raise exception 'A venda precisa de pelo menos 1 peça.';
  end if;
  if coalesce(trim(p_forma), '') = '' then raise exception 'Escolha a forma de pagamento.'; end if;
  if p_cliente is not null and not exists (select 1 from clientes where id = p_cliente and loja_id = p_loja) then
    raise exception 'Cliente não encontrado.';
  end if;

  perform 1 from lojas where id = p_loja for update;   -- numeração sem repetir
  select coalesce(max(numero), 0) + 1 into v_numero from vendas where loja_id = p_loja;

  insert into vendas (loja_id, numero, cliente_id, vendedor_id, vendedor_nome, forma_pagamento, parcelas, observacao)
    values (p_loja, v_numero, p_cliente, v_uid, v_nome, trim(p_forma),
            greatest(coalesce(p_parcelas, 1), 1), nullif(trim(p_obs), ''))
    returning id into v_venda;

  for v_item in select * from jsonb_array_elements(p_itens) loop
    v_qtd := (v_item->>'quantidade')::integer;
    if v_qtd is null or v_qtd <= 0 then raise exception 'Quantidade inválida.'; end if;

    select va.id, va.produto_id, va.tamanho, va.cor, p.nome, p.preco, p.custo
      into v_var
      from variacoes va join produtos p on p.id = va.produto_id
      where va.id = nullif(v_item->>'variacao_id', '')::uuid and va.loja_id = p_loja
      for update of va;
    if not found then raise exception 'Peça não encontrada nesta loja.'; end if;

    v_preco := round(coalesce((v_item->>'preco_unit')::numeric, v_var.preco), 2);
    if v_preco < 0 then raise exception 'Preço inválido.'; end if;

    insert into venda_itens (loja_id, venda_id, produto_id, variacao_id, descricao, quantidade, preco_unit, custo_unit, total)
      values (p_loja, v_venda, v_var.produto_id, v_var.id,
              v_var.nome || ' · ' || v_var.tamanho || case when v_var.cor <> '' then ' · ' || v_var.cor else '' end,
              v_qtd, v_preco, v_var.custo, v_qtd * v_preco);

    update variacoes set estoque = estoque - v_qtd where id = v_var.id returning estoque into v_saldo;
    insert into movimentos_estoque (loja_id, variacao_id, tipo, quantidade, saldo, venda_id, user_id)
      values (p_loja, v_var.id, 'venda', -v_qtd, v_saldo, v_venda, v_uid);

    v_subtotal := v_subtotal + v_qtd * v_preco;
    v_custo    := v_custo + v_qtd * v_var.custo;
    v_pecas    := v_pecas + v_qtd;
  end loop;

  if v_desc < 0 or v_desc > v_subtotal then raise exception 'Desconto inválido.'; end if;

  update vendas set subtotal = v_subtotal, desconto = v_desc, total = v_subtotal - v_desc,
                    custo_total = v_custo, pecas = v_pecas
    where id = v_venda;

  return jsonb_build_object('id', v_venda, 'numero', v_numero, 'total', v_subtotal - v_desc);
end $$;

create or replace function public.cancelar_venda(p_venda uuid, p_motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
declare
  v       record;
  it      record;
  v_saldo integer;
begin
  select * into v from vendas where id = p_venda for update;
  if not found or not eh_membro(v.loja_id) then raise exception 'Venda não encontrada.'; end if;
  if not eh_dono(v.loja_id) then raise exception 'Só o dono da loja pode cancelar vendas.'; end if;
  if v.status = 'cancelada' then raise exception 'Esta venda já foi cancelada.'; end if;

  for it in select * from venda_itens where venda_id = p_venda and variacao_id is not null loop
    update variacoes set estoque = estoque + it.quantidade where id = it.variacao_id returning estoque into v_saldo;
    insert into movimentos_estoque (loja_id, variacao_id, tipo, quantidade, saldo, venda_id, motivo, user_id)
      values (v.loja_id, it.variacao_id, 'cancelamento', it.quantidade, v_saldo, p_venda,
              nullif(trim(p_motivo), ''), auth.uid());
  end loop;

  update vendas set status = 'cancelada', cancelada_em = now(),
         observacao = concat_ws(' | ', observacao, 'Cancelada' || coalesce(': ' || nullif(trim(p_motivo), ''), ''))
    where id = p_venda;
end $$;

-- ---------- Painel (números do Início, calculados no banco) ----------

create or replace function public.painel(
  p_loja        uuid,
  p_tz          text,
  p_hoje        timestamptz,
  p_inicio      timestamptz,
  p_fim         timestamptz,
  p_inicio_ant  timestamptz,
  p_fim_ant     timestamptz
) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_dono    boolean;
  v_mes     jsonb;
  v_ant     jsonb;
  v_hoje    jsonb;
  v_dias    jsonb;
  v_formas  jsonb;
  v_vend    jsonb;
  v_top     jsonb;
  v_desp    jsonb;
  v_est     jsonb;
  v_par     jsonb;
begin
  if not eh_membro(p_loja) then raise exception 'Sem acesso a esta loja.'; end if;
  v_dono := eh_dono(p_loja);

  select jsonb_build_object(
           'faturamento', coalesce(sum(total), 0), 'vendas', count(*), 'pecas', coalesce(sum(pecas), 0),
           'desconto', coalesce(sum(desconto), 0), 'subtotal', coalesce(sum(subtotal), 0),
           'custo', case when v_dono then coalesce(sum(custo_total), 0) end,
           'com_cliente', count(cliente_id))
    into v_mes
    from vendas where loja_id = p_loja and status = 'concluida' and data >= p_inicio and data < p_fim;

  select jsonb_build_object(
           'faturamento', coalesce(sum(total), 0), 'vendas', count(*), 'pecas', coalesce(sum(pecas), 0),
           'com_cliente', count(cliente_id))
    into v_ant
    from vendas where loja_id = p_loja and status = 'concluida' and data >= p_inicio_ant and data < p_fim_ant;

  select jsonb_build_object(
           'faturamento', coalesce(sum(total), 0), 'vendas', count(*), 'pecas', coalesce(sum(pecas), 0))
    into v_hoje
    from vendas where loja_id = p_loja and status = 'concluida' and data >= p_hoje;

  select coalesce(jsonb_agg(jsonb_build_object('dia', dia, 'total', total, 'vendas', n) order by dia), '[]'::jsonb)
    into v_dias
    from (select (data at time zone p_tz)::date as dia, sum(total) as total, count(*) as n
            from vendas where loja_id = p_loja and status = 'concluida' and data >= p_inicio and data < p_fim
           group by 1) d;

  select coalesce(jsonb_agg(jsonb_build_object('forma', forma_pagamento, 'total', total, 'vendas', n) order by total desc), '[]'::jsonb)
    into v_formas
    from (select forma_pagamento, sum(total) as total, count(*) as n
            from vendas where loja_id = p_loja and status = 'concluida' and data >= p_inicio and data < p_fim
           group by 1) f;

  select coalesce(jsonb_agg(jsonb_build_object('nome', nome, 'total', total, 'vendas', n) order by total desc), '[]'::jsonb)
    into v_vend
    from (select coalesce(vendedor_nome, '—') as nome, sum(total) as total, count(*) as n
            from vendas where loja_id = p_loja and status = 'concluida' and data >= p_inicio and data < p_fim
           group by 1) x;

  select coalesce(jsonb_agg(jsonb_build_object('produto_id', produto_id, 'nome', nome, 'pecas', pecas, 'total', total)
                            order by pecas desc, total desc), '[]'::jsonb)
    into v_top
    from (select i.produto_id, coalesce(p.nome, split_part(i.descricao, ' · ', 1)) as nome,
                 sum(i.quantidade) as pecas, sum(i.total) as total
            from venda_itens i
            join vendas v on v.id = i.venda_id
            left join produtos p on p.id = i.produto_id
           where i.loja_id = p_loja and v.status = 'concluida' and v.data >= p_inicio and v.data < p_fim
           group by 1, 2
           order by pecas desc, total desc
           limit 5) t;

  if v_dono then
    select jsonb_build_object(
             'total', coalesce(sum(valor), 0),
             'fixas', coalesce(sum(valor) filter (where tipo = 'fixa'), 0),
             'categorias', coalesce((select jsonb_agg(jsonb_build_object('categoria', categoria, 'total', t) order by t desc)
                                       from (select categoria, sum(valor) as t from despesas
                                              where loja_id = p_loja
                                                and data >= (p_inicio at time zone p_tz)::date
                                                and data <  (p_fim at time zone p_tz)::date
                                              group by 1) c), '[]'::jsonb))
      into v_desp
      from despesas
     where loja_id = p_loja
       and data >= (p_inicio at time zone p_tz)::date
       and data <  (p_fim at time zone p_tz)::date;
  end if;

  select jsonb_build_object(
           'pecas', coalesce(sum(greatest(va.estoque, 0)), 0),
           'valor_custo', case when v_dono then coalesce(sum(greatest(va.estoque, 0) * p.custo), 0) end,
           'valor_venda', coalesce(sum(greatest(va.estoque, 0) * p.preco), 0),
           'baixo', count(*) filter (where va.estoque > 0 and va.estoque <= va.estoque_minimo),
           'zerado', count(*) filter (where va.estoque <= 0),
           'produtos', count(distinct p.id))
    into v_est
    from variacoes va join produtos p on p.id = va.produto_id
   where va.loja_id = p_loja and va.ativo and p.ativo;

  select jsonb_build_object(
           'produtos', count(*),
           'pecas', coalesce(sum(est), 0),
           'valor_custo', case when v_dono then coalesce(sum(est * custo), 0) end,
           'exemplos', coalesce((jsonb_agg(nome order by est * custo desc) filter (where nome is not null)), '[]'::jsonb))
    into v_par
    from (select p.id, p.nome, p.custo, sum(greatest(va.estoque, 0)) as est
            from produtos p
            join variacoes va on va.produto_id = p.id and va.ativo
           where p.loja_id = p_loja and p.ativo and p.created_at < now() - interval '30 days'
           group by p.id, p.nome, p.custo
          having sum(greatest(va.estoque, 0)) > 0) x
   where not exists (select 1 from venda_itens i join vendas v on v.id = i.venda_id
                      where i.produto_id = x.id and v.status = 'concluida'
                        and v.data >= now() - interval '30 days');

  return jsonb_build_object('dono', v_dono, 'mes', v_mes, 'anterior', v_ant, 'hoje', v_hoje,
                            'dias', v_dias, 'formas', v_formas, 'vendedores', v_vend, 'top', v_top,
                            'despesas', v_desp, 'estoque', v_est, 'parados', v_par);
end $$;

create or replace function public.clientes_resumo(p_loja uuid)
returns table (cliente_id uuid, compras bigint, total numeric, ultima timestamptz)
language sql stable security definer set search_path = public as $$
  select v.cliente_id, count(*), sum(v.total), max(v.data)
    from vendas v
   where v.loja_id = p_loja and v.status = 'concluida' and v.cliente_id is not null
     and public.eh_membro(p_loja)
   group by v.cliente_id;
$$;

-- ---------- Permissões -----------------------------------------------

revoke all on all tables in schema public from anon;
grant select, insert, update, delete on all tables in schema public to authenticated;

revoke execute on all functions in schema public from public;
revoke execute on all functions in schema public from anon;
grant execute on all functions in schema public to authenticated;
