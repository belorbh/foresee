/* Foresee · app de gestão para lojas de moda
   Telas: entrar/criar conta, criar loja ou entrar com convite, Início (painel),
   Vender (caixa), Vendas, Produtos e estoque, Clientes, Despesas e lucro, Loja e equipe. */
'use strict';
(function () {
  const CFG = window.FORESEE_CONFIG || {};
  const app = document.getElementById('app');

  if (!window.supabase || !CFG.url) {
    app.innerHTML = '<div class="entrada"><div class="entrada-box"><div class="card"><h2>Não foi possível abrir o Foresee</h2><p class="muted" style="margin-top:8px">Confira a internet e abra de novo.</p></div></div></div>';
    return;
  }
  const sb = window.supabase.createClient(CFG.url, CFG.key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'foresee-auth' }
  });

  // ------------------------------------------------------------------
  // Ícones
  // ------------------------------------------------------------------
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ic = {
    home: svg('<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    bag: svg('<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 0 1 6 0"/>'),
    receipt: svg('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    shirt: svg('<path d="M8 3 3 6l2 5 3-1v11h8V10l3 1 2-5-5-3a4 4 0 0 1-8 0z"/>'),
    users: svg('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14a6 6 0 0 1 3.5 6"/>'),
    wallet: svg('<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M16 15h2"/><path d="M6 6V4h11v2"/>'),
    sliders: svg('<path d="M4 6h9M17 6h3M4 12h3M11 12h9M4 18h11M19 18h1"/><circle cx="15" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>'),
    dots: svg('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>'),
    plus: svg('<path d="M12 5v14M5 12h14"/>'),
    search: svg('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    eyeOff: svg('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>'),
    chevDown: svg('<path d="m6 9 6 6 6-6"/>'),
    chevLeft: svg('<path d="m15 18-6-6 6-6"/>'),
    chevRight: svg('<path d="m9 18 6-6-6-6"/>'),
    x: svg('<path d="M18 6 6 18M6 6l12 12"/>'),
    check: svg('<path d="m5 12 5 5L20 7"/>'),
    trash: svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    edit: svg('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>'),
    chat: svg('<path d="M21 11.5a8.5 8.5 0 0 1-12.6 7.4L3 21l2.1-5.3A8.5 8.5 0 1 1 21 11.5z"/>'),
    alert: svg('<path d="M12 3 2 20h20z"/><path d="M12 9v5M12 17.5v.01"/>'),
    up: svg('<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>'),
    down: svg('<path d="m3 7 6 6 4-4 8 8"/><path d="M15 17h6v-6"/>'),
    box: svg('<path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/>'),
    spark: svg('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
    tag: svg('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),
    logout: svg('<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>'),
    copy: svg('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>'),
    pix: svg('<path d="M12 2.8 21.2 12 12 21.2 2.8 12z"/><path d="m8.5 12 3.5-3.5 3.5 3.5-3.5 3.5z"/>'),
    cash: svg('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
    card: svg('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>'),
    calendar: svg('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    store: svg('<path d="M4 9h16l-1.5-5h-13z"/><path d="M5 9v11h14V9M9 20v-6h6v6"/>'),
    gift: svg('<rect x="3" y="8" width="18" height="13" rx="1.5"/><path d="M3 12h18M12 8v13"/><path d="M12 8S10.5 3.5 8 4.6 9 8 12 8zm0 0s1.5-4.5 4-3.4S15 8 12 8z"/>'),
    clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    target: svg('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>'),
    key: svg('<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>'),
    more: svg('<path d="M12 5v14M5 12h14"/>'),
    phone: svg('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>')
  };
  const LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 16c3.6-6.4 7.8-9.6 13-9.6S25.4 9.6 29 16c-3.6 6.4-7.8 9.6-13 9.6S6.6 22.4 3 16z" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round"/><circle cx="16" cy="16" r="5.2" fill="currentColor"/><circle cx="17.9" cy="14.1" r="1.6" fill="var(--ink)"/></svg>';

  // ------------------------------------------------------------------
  // Utilidades
  // ------------------------------------------------------------------
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const brl = (v) => fmtBRL.format(Number(v) || 0);
  const money = (v) => `<span class="money">${brl(v)}</span>`;
  const n1 = (v) => (Number(v) || 0).toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  const pct = (v, casas = 0) => `${((Number(v) || 0) * 100).toLocaleString('pt-BR', { maximumFractionDigits: casas })}%`;
  const plural = (n, um, varios) => `${n} ${Number(n) === 1 ? um : varios}`;
  const cap = (s) => String(s || '').charAt(0).toUpperCase() + String(s || '').slice(1);
  const primeiroNome = (s) => String(s || '').trim().split(/\s+/)[0] || '';
  const iniciais = (nome) => String(nome || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase() || '?';
  const soDigitos = (s) => String(s || '').replace(/\D/g, '');

  function parseMoney(s) {
    if (typeof s === 'number') return s;
    let t = String(s || '').trim().replace(/[R$\s]/g, '');
    if (!t) return 0;
    if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');
    const n = Number(t);
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
  }
  const moneyInput = (v) => (v || v === 0) && Number(v) !== 0 ? Number(v).toFixed(2).replace('.', ',') : '';

  function fmtTel(s) {
    const d = soDigitos(s);
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return s || '';
  }
  function waLink(tel, texto) {
    let d = soDigitos(tel);
    if (d.length < 10) return null;
    if (d.length <= 11) d = '55' + d;
    return `https://wa.me/${d}${texto ? '?text=' + encodeURIComponent(texto) : ''}`;
  }

  const DIAS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const inicioDia = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const inicioMes = (d = new Date(), delta = 0) => new Date(d.getFullYear(), d.getMonth() + delta, 1);
  const addDias = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
  const diasNoMes = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const isoData = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const dataLocal = (s) => { const [y, m, d] = String(s).slice(0, 10).split('-').map(Number); return new Date(y, m - 1, d); };
  const fmtData = (iso) => new Date(iso).toLocaleDateString('pt-BR');
  const fmtDataCurta = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
  const fmtHora = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const fmtDiaLongo = (d) => `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
  const nomeMes = (d) => `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
  const diasAtras = (iso) => Math.round((inicioDia() - inicioDia(new Date(iso))) / 86400000);
  function quando(iso) {
    const n = diasAtras(iso);
    if (n <= 0) return 'hoje';
    if (n === 1) return 'ontem';
    if (n < 30) return `há ${n} dias`;
    if (n < 365) { const m = Math.floor(n / 30); return `há ${m} ${m === 1 ? 'mês' : 'meses'}`; }
    const a = Math.floor(n / 365);
    return `há ${a} ${a === 1 ? 'ano' : 'anos'}`;
  }
  function saudacao() {
    const h = new Date().getHours();
    return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  }
  function variacao(atual, anterior) {
    atual = Number(atual) || 0; anterior = Number(anterior) || 0;
    if (!anterior) return '';
    const d = atual / anterior - 1;
    const cls = d >= 0 ? 'up' : 'down';
    return `<span class="${cls}">${d >= 0 ? '▲' : '▼'} ${pct(Math.abs(d))}</span>`;
  }

  const ORDEM_TAM = ['RN', 'PP', 'P', 'M', 'G', 'GG', 'XG', 'XGG', 'EG', 'EGG', 'G1', 'G2', 'G3', 'G4', 'U', 'ÚNICO', 'UNICO'];
  function rankTam(t) {
    const up = String(t || '').toUpperCase();
    const i = ORDEM_TAM.indexOf(up);
    if (i >= 0) return i;
    const n = parseFloat(up.replace(',', '.'));
    return Number.isNaN(n) ? 1000 : 100 + n;
  }
  const ordemVar = (a, b) => (a.cor || '').localeCompare(b.cor || '') || rankTam(a.tamanho) - rankTam(b.tamanho) || String(a.tamanho).localeCompare(String(b.tamanho));
  const rotuloVar = (v) => [v.tamanho, v.cor].filter(Boolean).join(' · ');
  const normCor = (s) => cap(String(s || '').trim().replace(/\s+/g, ' '));
  const normTam = (s) => String(s || '').trim().toUpperCase().replace(/\s+/g, ' ');

  const LS = {
    get(k, d) { try { const v = localStorage.getItem('foresee.' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('foresee.' + k, JSON.stringify(v)); } catch (e) { /* sem espaço */ } }
  };

  function msgErro(e) {
    const m = (e && (e.message || e.error_description || e.msg)) || String(e || '');
    const mapa = [
      [/Invalid login credentials/i, 'E-mail ou senha incorretos.'],
      [/already registered|already been registered|User already exists/i, 'Esse e-mail já tem conta. Entre com a sua senha.'],
      [/Password should be at least|at least 6 characters/i, 'A senha precisa ter pelo menos 6 caracteres.'],
      [/weak.?password/i, 'Senha muito fraca. Misture letras e números.'],
      [/invalid format|Unable to validate email|email address .* is invalid/i, 'Esse e-mail não parece válido.'],
      [/rate limit|too many requests/i, 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'],
      [/Failed to fetch|NetworkError|Load failed|network/i, 'Sem conexão com a internet. Confira e tente de novo.'],
      [/JWT expired|invalid JWT|refresh token|not authenticated/i, 'Sua sessão expirou. Entre de novo.'],
      [/variacoes_produto_id_tamanho_cor_key|duplicate key.*varia/i, 'Esse produto já tem esse tamanho e cor.'],
      [/Email not confirmed/i, 'Confirme seu e-mail antes de entrar.'],
      [/should be different/i, 'A nova senha precisa ser diferente da antiga.'],
      [/permission denied|row-level security/i, 'Você não tem permissão para fazer isso.']
    ];
    for (const [re, txt] of mapa) if (re.test(m)) return txt;
    return m || 'Algo deu errado. Tente de novo.';
  }
  async function run(promessa) {
    const { data, error } = await promessa;
    if (error) throw error;
    return data;
  }

  let toastTimer;
  function toast(msg, tipo) {
    const velho = $('.toast');
    if (velho) velho.remove();
    const t = document.createElement('div');
    t.className = 'toast' + (tipo === 'erro' ? ' erro' : '');
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.remove(), tipo === 'erro' ? 4800 : 2600);
  }

  function abrirFolha(html, opcoes = {}) {
    const ov = document.createElement('div');
    ov.className = 'overlay';
    ov.innerHTML = `<div class="folha" role="dialog" aria-modal="true"><div class="alca"></div>${html}</div>`;
    document.body.appendChild(ov);
    document.body.style.overflow = 'hidden';
    let fechada = false;
    const fechar = () => {
      if (fechada) return;
      fechada = true;
      ov.remove();
      if (!$('.overlay')) document.body.style.overflow = '';
      if (opcoes.aoFechar) opcoes.aoFechar();
    };
    ov.addEventListener('click', (e) => { if (e.target === ov) fechar(); });
    $$('[data-fechar]', ov).forEach((b) => b.addEventListener('click', fechar));
    const folha = $('.folha', ov);
    if (opcoes.aoAbrir) opcoes.aoAbrir(folha, fechar);
    const foco = $('[autofocus]', folha);
    if (foco && window.matchMedia('(min-width: 700px)').matches) setTimeout(() => foco.focus(), 60);
    return { folha, fechar };
  }
  const cabFolha = (titulo, sub) => `<div class="folha-cab"><div class="grow"><h2>${titulo}</h2>${sub ? `<p class="small muted" style="margin-top:2px">${sub}</p>` : ''}</div><button class="icon-btn" type="button" data-fechar aria-label="Fechar">${ic.x}</button></div>`;

  function confirmar(titulo, { detalhe = '', ok = 'Confirmar', perigo = false } = {}) {
    return new Promise((resolve) => {
      let resposta = false;
      abrirFolha(`${cabFolha(titulo)}${detalhe ? `<p class="muted" style="margin-bottom:18px">${detalhe}</p>` : ''}
        <div class="grid c2" style="grid-template-columns:1fr 1fr"><button class="btn" type="button" data-fechar>Voltar</button>
        <button class="btn ${perigo ? 'perigo cheio' : 'prim'}" type="button" data-ok>${ok}</button></div>`, {
        aoAbrir: (f, fechar) => { $('[data-ok]', f).addEventListener('click', () => { resposta = true; fechar(); }); },
        aoFechar: () => resolve(resposta)
      });
    });
  }

  async function ocupado(btn, fn) {
    if (!btn) return fn();
    const html = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spin" style="width:18px;height:18px;border-width:2px"></span>';
    try { return await fn(); } finally { btn.disabled = false; btn.innerHTML = html; }
  }

  const carregandoHTML = (tela) => `<div class="carregando" ${tela ? 'style="min-height:100vh"' : ''}><div class="spin"></div></div>`;
  const vazioHTML = (icone, titulo, texto, href, botao) => `<div class="vazio">${icone}<h3>${titulo}</h3><p class="small">${texto}</p>${href ? `<a class="btn prim" href="${href}">${ic.plus}${botao}</a>` : ''}</div>`;
  const erroHTML = (e) => `<div class="vazio">${ic.alert}<h3>Não deu para carregar</h3><p class="small">${esc(msgErro(e))}</p><button class="btn" type="button" onclick="location.reload()">Tentar de novo</button></div>`;

  // ------------------------------------------------------------------
  // Estado
  // ------------------------------------------------------------------
  const S = {
    user: null, membros: [], m: null, loja: null, papel: null,
    produtos: null, clientes: null, resumoClientes: null,
    carrinho: [], ocultar: false
  };
  const dono = () => S.papel === 'dono';
  const gerente = () => S.papel === 'dono' || S.papel === 'gerente';
  const soVendedor = () => !gerente();
  const NOME_PAPEL = { dono: 'Dono(a)', gerente: 'Gerente', vendedor: 'Vendedor(a)' };
  const ROTAS_VENDEDOR = ['vender', 'vendas', 'ajustes'];
  const rotaInicial = () => (soVendedor() ? '#/vender' : '#/hoje');
  let rotaToken = 0;
  let recuperando = false;
  let promptInstalar = null;

  function limparEstado() {
    Object.assign(S, { user: null, membros: [], m: null, loja: null, papel: null, produtos: null, clientes: null, resumoClientes: null, carrinho: [] });
  }
  function salvarCarrinho() { if (S.loja) LS.set('carrinho.' + S.loja.id, S.carrinho); }

  // ------------------------------------------------------------------
  // Entrada: login, conta, senha
  // ------------------------------------------------------------------
  function telaEntrada(conteudo) {
    app.innerHTML = `<div class="entrada"><div class="entrada-box">
      <div class="entrada-logo"><div class="logo">${LOGO}</div><div><b>Foresee</b><span>A sua loja, vista por inteiro.</span></div></div>
      ${conteudo}</div></div>`;
  }

  function telaLogin(modo = 'entrar') {
    if (modo === 'esqueci') return telaEsqueci();
    const criar = modo === 'criar';
    telaEntrada(`<form class="card form" id="f-auth" novalidate>
      <div><h2>${criar ? 'Criar conta' : 'Entrar'}</h2>
        <p class="small muted" style="margin-top:4px">${criar ? 'Leva 1 minuto. Depois você cadastra a sua loja ou entra na equipe de uma loja.' : 'Use o e-mail e a senha da sua conta.'}</p></div>
      ${criar ? '<label class="campo"><span>Seu nome</span><input class="input" name="nome" autocomplete="name" required></label>' : ''}
      <label class="campo"><span>E-mail</span><input class="input" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" required></label>
      <label class="campo"><span>Senha</span><input class="input" name="senha" type="password" autocomplete="${criar ? 'new-password' : 'current-password'}" required>
        ${criar ? '<span class="ajuda">Mínimo de 6 caracteres.</span>' : ''}</label>
      <p class="erro-msg hidden" id="auth-erro"></p>
      <button class="btn prim bloco grande" type="submit">${criar ? 'Criar conta' : 'Entrar'}</button>
      <div class="row between small">
        ${criar
          ? '<span class="muted">Já tem conta?</span><button type="button" class="link-btn" data-ir="entrar">Entrar</button>'
          : '<button type="button" class="link-btn" data-ir="esqueci">Esqueci a senha</button><button type="button" class="link-btn" data-ir="criar">Criar conta</button>'}
      </div></form>`);
    $$('[data-ir]').forEach((b) => b.addEventListener('click', () => telaLogin(b.dataset.ir)));
    const f = $('#f-auth');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const erro = $('#auth-erro');
      erro.classList.add('hidden');
      const email = f.email.value.trim().toLowerCase();
      const senha = f.senha.value;
      const nome = criar ? f.nome.value.trim() : '';
      const falha = (msg) => { erro.textContent = msg; erro.classList.remove('hidden'); };
      if (criar && !nome) return falha('Digite seu nome.');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return falha('Digite um e-mail válido.');
      if (senha.length < 6) return falha('A senha precisa ter pelo menos 6 caracteres.');
      await ocupado(f.querySelector('button[type=submit]'), async () => {
        try {
          if (criar) {
            const { data, error } = await sb.auth.signUp({ email, password: senha, options: { data: { nome } } });
            if (error) throw error;
            if (!data.session) {
              telaEntrada(`<div class="card stack"><h2>Confirme seu e-mail</h2><p class="muted">Enviamos um link para <b>${esc(email)}</b>. Abra o e-mail, toque no link e depois entre por aqui.</p><button class="btn bloco" id="voltar">Voltar para entrar</button></div>`);
              $('#voltar').addEventListener('click', () => telaLogin('entrar'));
              return;
            }
            S.user = data.user;
          } else {
            const { data, error } = await sb.auth.signInWithPassword({ email, password: senha });
            if (error) throw error;
            S.user = data.user;
          }
          await entrarNoApp();
        } catch (err) { falha(msgErro(err)); }
      });
    });
  }

  function telaEsqueci() {
    telaEntrada(`<form class="card form" id="f-esq" novalidate>
      <div><h2>Esqueci a senha</h2><p class="small muted" style="margin-top:4px">Digite seu e-mail. Mandamos um link para criar uma senha nova.</p></div>
      <label class="campo"><span>E-mail</span><input class="input" name="email" type="email" autocomplete="email" inputmode="email" autocapitalize="off" required></label>
      <p class="erro-msg hidden" id="esq-erro"></p>
      <button class="btn prim bloco grande" type="submit">Enviar link</button>
      <button class="link-btn" type="button" id="voltar">Voltar para entrar</button></form>`);
    $('#voltar').addEventListener('click', () => telaLogin('entrar'));
    const f = $('#f-esq');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = f.email.value.trim().toLowerCase();
      const erro = $('#esq-erro');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { erro.textContent = 'Digite um e-mail válido.'; erro.classList.remove('hidden'); return; }
      await ocupado(f.querySelector('button[type=submit]'), async () => {
        try {
          await run(sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }));
          telaEntrada(`<div class="card stack"><h2>Confira seu e-mail</h2><p class="muted">Se <b>${esc(email)}</b> tiver conta no Foresee, o link para criar uma senha nova chega em alguns minutos. Olhe também a caixa de spam.</p><button class="btn bloco" id="voltar2">Voltar para entrar</button></div>`);
          $('#voltar2').addEventListener('click', () => telaLogin('entrar'));
        } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
      });
    });
  }

  function telaNovaSenha() {
    telaEntrada(`<form class="card form" id="f-nova" novalidate>
      <div><h2>Criar senha nova</h2><p class="small muted" style="margin-top:4px">Escolha uma senha com pelo menos 6 caracteres.</p></div>
      <label class="campo"><span>Senha nova</span><input class="input" name="senha" type="password" autocomplete="new-password" required></label>
      <p class="erro-msg hidden" id="nova-erro"></p>
      <button class="btn prim bloco grande" type="submit">Salvar senha</button></form>`);
    const f = $('#f-nova');
    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const erro = $('#nova-erro');
      if (f.senha.value.length < 6) { erro.textContent = 'A senha precisa ter pelo menos 6 caracteres.'; erro.classList.remove('hidden'); return; }
      await ocupado(f.querySelector('button[type=submit]'), async () => {
        try {
          const data = await run(sb.auth.updateUser({ password: f.senha.value }));
          S.user = data.user;
          recuperando = false;
          history.replaceState(null, '', location.pathname + '#/inicio');
          toast('Senha atualizada.');
          await entrarNoApp();
        } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
      });
    });
  }

  // ------------------------------------------------------------------
  // Loja: escolher, criar, convite
  // ------------------------------------------------------------------
  async function entrarNoApp(lojaPreferida) {
    app.innerHTML = carregandoHTML(true);
    try {
      const membros = await run(sb.from('membros')
        .select('loja_id, papel, nome, lojas(id, nome, cidade, telefone, instagram, meta_mensal, codigo_convite)')
        .eq('user_id', S.user.id));
      S.membros = (membros || []).filter((m) => m.lojas);
      if (!S.membros.length) return telaBoasVindas();
      const alvo = lojaPreferida || LS.get('loja', null);
      usarLoja(S.membros.find((x) => x.loja_id === alvo) || S.membros[0]);
      montarShell();
      if (!/^#\/[a-z]/.test(location.hash)) history.replaceState(null, '', location.pathname + rotaInicial());
      rotear();
    } catch (e) {
      app.innerHTML = `<div class="entrada"><div class="entrada-box">${erroHTML(e)}<button class="btn bloco" style="margin-top:12px" id="sair-erro">Sair</button></div></div>`;
      $('#sair-erro').addEventListener('click', sair);
    }
  }

  function usarLoja(m) {
    S.m = m; S.loja = m.lojas; S.papel = m.papel;
    S.produtos = null; S.clientes = null; S.resumoClientes = null; S.vendedores = null;
    S.carrinho = LS.get('carrinho.' + m.loja_id, []);
    LS.set('loja', m.loja_id);
  }

  function telaBoasVindas() {
    const nome = primeiroNome((S.user && S.user.user_metadata && S.user.user_metadata.nome) || '');
    telaEntrada(`<div class="stack">
      <div><h1>${nome ? `Olá, ${esc(nome)}!` : 'Bem-vindo!'}</h1><p class="muted" style="margin-top:6px">Como você vai usar o Foresee?</p></div>
      <div class="escolha">
        <div class="card" role="button" tabindex="0" id="op-criar"><div class="ic">${ic.store}</div><div><h3>Cadastrar minha loja</h3><p class="small muted">Sou dono(a) e vou montar a loja do zero.</p></div></div>
        <div class="card" role="button" tabindex="0" id="op-convite"><div class="ic">${ic.key}</div><div><h3>Entrar com código de convite</h3><p class="small muted">Trabalho numa loja que já usa o Foresee.</p></div></div>
      </div>
      <button class="link-btn" id="sair-bv">Sair da conta</button></div>`);
    $('#op-criar').addEventListener('click', () => formCriarLoja());
    $('#op-convite').addEventListener('click', () => formConvite());
    $('#sair-bv').addEventListener('click', sair);
  }

  function formCriarLoja() {
    const meuNome = (S.user && S.user.user_metadata && S.user.user_metadata.nome) || '';
    abrirFolha(`${cabFolha('Cadastrar loja', 'Você poderá mudar tudo depois.')}
      <form class="form" id="f-loja">
        <label class="campo"><span>Nome da loja</span><input class="input" name="nome" required autofocus placeholder="Ex.: Belo Estilo"></label>
        <label class="campo"><span>Cidade</span><input class="input" name="cidade" placeholder="Ex.: Setubinha"></label>
        <label class="campo"><span>Seu nome</span><input class="input" name="seu" value="${esc(meuNome)}" required></label>
        <p class="erro-msg hidden" id="loja-erro"></p>
        <button class="btn prim bloco grande" type="submit">Criar loja</button></form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-loja', f);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const erro = $('#loja-erro', f);
          if (form.nome.value.trim().length < 2) { erro.textContent = 'Digite o nome da loja.'; erro.classList.remove('hidden'); return; }
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              const id = await run(sb.rpc('criar_loja', { p_nome: form.nome.value.trim(), p_cidade: form.cidade.value.trim(), p_seu_nome: form.seu.value.trim() }));
              fechar();
              history.replaceState(null, '', location.pathname + '#/inicio');
              await entrarNoApp(id);
              toast('Loja criada! Agora cadastre seus produtos.');
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
      }
    });
  }

  function formConvite() {
    const meuNome = (S.user && S.user.user_metadata && S.user.user_metadata.nome) || '';
    abrirFolha(`${cabFolha('Entrar com código', 'Peça o código de 6 letras para o dono da loja.')}
      <form class="form" id="f-conv">
        <label class="campo"><span>Código de convite</span><input class="input grande" name="codigo" required autofocus maxlength="6" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase;letter-spacing:.2em;text-align:center"></label>
        <label class="campo"><span>Seu nome</span><input class="input" name="seu" value="${esc(meuNome)}" required></label>
        <p class="erro-msg hidden" id="conv-erro"></p>
        <button class="btn prim bloco grande" type="submit">Entrar na loja</button></form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-conv', f);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const erro = $('#conv-erro', f);
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              const id = await run(sb.rpc('entrar_com_convite', { p_codigo: form.codigo.value.trim(), p_seu_nome: form.seu.value.trim() }));
              fechar();
              history.replaceState(null, '', location.pathname + '#/inicio');
              await entrarNoApp(id);
              toast('Pronto! Você entrou na loja.');
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
      }
    });
  }

  async function sair() {
    const ok = await confirmar('Sair da conta?', { ok: 'Sair' });
    if (!ok) return;
    try { await sb.auth.signOut(); } catch (e) { /* sai mesmo assim */ }
    limparEstado();
    history.replaceState(null, '', location.pathname);
    telaLogin();
  }

  // ------------------------------------------------------------------
  // Estrutura do app e rotas
  // ------------------------------------------------------------------
  function montarShell() {
    const itens = soVendedor() ? [['vendas', 'Minhas vendas', ic.receipt], ['ajustes', 'Minha conta', ic.sliders]] : [
      ['hoje', 'Hoje', svg('<path d="M3 12h4l3-8 4 16 3-8h4"/>')], ['inicio', 'Mês', ic.home], ['vendas', 'Vendas', ic.receipt], ['produtos', 'Produtos e estoque', ic.shirt],
      ['clientes', 'Clientes', ic.users], ...(dono() ? [['despesas', 'Despesas e lucro', ic.wallet]] : []),
      ['ajustes', 'Loja e equipe', ic.sliders]
    ];
    app.innerHTML = `<div class="shell">
      <aside class="sidebar">
        <div class="brand"><div class="logo">${LOGO}</div>Foresee</div>
        <a class="side-link cta" href="#/vender">${ic.plus}<span>Nova venda</span></a>
        ${itens.map(([r, t, i]) => `<a class="side-link" data-rota="${r}" href="#/${r}">${i}<span>${t}</span></a>`).join('')}
        <div class="side-foot">Foresee ${esc(CFG.versao || '')}</div>
      </aside>
      <div class="principal">
        <header class="topbar" id="topbar">
          <div class="brand"><div class="logo">${LOGO}</div></div>
          <button class="loja-switch grow" id="btn-loja" type="button"><span class="ellipsis">${esc(S.loja.nome)}</span>${ic.chevDown.replace('<svg', '<svg style="width:16px;height:16px;flex:none"')}</button>
          <button class="icon-btn" id="btn-atualizar" type="button" aria-label="Atualizar o app" title="Atualizar">${svg('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>')}</button>
          <button class="icon-btn" id="btn-olho" type="button" aria-label="Esconder valores" title="Esconder valores">${S.ocultar ? ic.eyeOff : ic.eye}</button>
        </header>
        <main class="view" id="view"></main>
      </div>
      ${soVendedor() ? `<nav class="bottomnav" aria-label="Menu" style="grid-template-columns:repeat(3,1fr)">
        <a class="navbtn" data-rota="vendas" href="#/vendas">${ic.receipt}<span>Minhas vendas</span></a>
        <a class="navbtn vender" data-rota="vender" href="#/vender"><span class="bolha">${ic.plus}</span><span>Vender</span></a>
        <a class="navbtn" data-rota="ajustes" href="#/ajustes">${ic.sliders}<span>Conta</span></a>
      </nav>` : `<nav class="bottomnav" aria-label="Menu">
        <a class="navbtn" data-rota="hoje" href="#/hoje">${svg('<path d="M3 12h4l3-8 4 16 3-8h4"/>')}<span>Hoje</span></a>
        <a class="navbtn" data-rota="inicio" href="#/inicio">${ic.home}<span>Mês</span></a>
        <a class="navbtn vender" data-rota="vender" href="#/vender"><span class="bolha">${ic.plus}</span><span>Vender</span></a>
        <a class="navbtn" data-rota="produtos" href="#/produtos">${ic.shirt}<span>Produtos</span></a>
        <a class="navbtn" data-rota="mais" href="#/mais">${ic.dots}<span>Mais</span></a>
      </nav>`}</div>`;
    $('#btn-olho').addEventListener('click', () => {
      S.ocultar = !S.ocultar;
      LS.set('ocultar', S.ocultar);
      document.body.classList.toggle('ocultar', S.ocultar);
      $('#btn-olho').innerHTML = S.ocultar ? ic.eyeOff : ic.eye;
      toast(S.ocultar ? 'Valores escondidos.' : 'Valores à mostra.');
    });
    $('#btn-loja').addEventListener('click', trocarLoja);
    $('#btn-atualizar').addEventListener('click', atualizarApp);
  }

  async function atualizarApp() {
    const b = $('#btn-atualizar');
    if (b) b.classList.add('girando');
    try {
      const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : null;
      if (reg) await reg.update().catch(() => {});
    } catch (e) { /* segue */ }
    location.reload();
  }

  function trocarLoja() {
    abrirFolha(`${cabFolha('Suas lojas')}
      <div class="lista">${S.membros.map((m) => `<button class="item" type="button" data-loja="${m.loja_id}">
        <div class="avatar">${esc(iniciais(m.lojas.nome))}</div>
        <div class="grow"><div class="tit">${esc(m.lojas.nome)}</div><div class="sub">${esc(m.lojas.cidade || '')}${m.lojas.cidade ? ' · ' : ''}${NOME_PAPEL[m.papel] || 'Equipe'}</div></div>
        ${m.loja_id === S.loja.id ? `<span class="badge ok">${ic.check.replace('<svg', '<svg style="width:14px;height:14px"')} Atual</span>` : ''}</button>`).join('')}</div>
      <div class="grid c2" style="margin-top:14px;grid-template-columns:1fr 1fr">
        <button class="btn" type="button" id="nova-loja">${ic.store}Cadastrar loja</button>
        <button class="btn" type="button" id="usar-codigo">${ic.key}Usar código</button></div>`, {
      aoAbrir: (f, fechar) => {
        $$('[data-loja]', f).forEach((b) => b.addEventListener('click', () => {
          const m = S.membros.find((x) => x.loja_id === b.dataset.loja);
          fechar();
          if (!m || m.loja_id === S.loja.id) return;
          usarLoja(m);
          montarShell();
          if (location.hash === rotaInicial()) rotear(); else location.hash = rotaInicial();
          toast(`Agora em: ${m.lojas.nome}`);
        }));
        $('#nova-loja', f).addEventListener('click', () => { fechar(); formCriarLoja(); });
        $('#usar-codigo', f).addEventListener('click', () => { fechar(); formConvite(); });
      }
    });
  }

  const TELAS = {};
  function rotear() {
    if (!S.loja || recuperando) return;
    $$('.overlay').forEach((o) => o.remove());
    document.body.style.overflow = '';
    folhaCarrinho = null;
    const view = $('#view');
    if (!view) return;
    const partes = location.hash.replace(/^#\/?/, '').split('/');
    let rota = partes[0] || (soVendedor() ? 'vender' : 'hoje');
    const arg = partes[1] ? decodeURIComponent(partes[1]) : '';
    if (!TELAS[rota]) rota = 'inicio';
    if (rota === 'despesas' && !dono()) rota = 'inicio';
    if (soVendedor() && !ROTAS_VENDEDOR.includes(rota)) rota = 'vender';
    const grupoMais = ['vendas', 'despesas', 'ajustes', 'mais', 'clientes', 'cliente'];
    $$('[data-rota]').forEach((a) => {
      const r = a.dataset.rota;
      const ativo = r === rota || (r === 'produtos' && rota === 'produto') || (r === 'clientes' && rota === 'cliente') ||
        (a.classList.contains('navbtn') && r === 'mais' && grupoMais.includes(rota));
      a.classList.toggle('ativo', ativo);
    });
    window.scrollTo(0, 0);
    const token = ++rotaToken;
    Promise.resolve(TELAS[rota](view, arg, token)).catch((e) => { if (token === rotaToken) view.innerHTML = erroHTML(e); });
  }
  const vivo = (token) => token === rotaToken;

  // ------------------------------------------------------------------
  // Dados compartilhados
  // ------------------------------------------------------------------
  async function carregarProdutos(forcar) {
    if (S.produtos && !forcar) return S.produtos;
    const data = await run(sb.from('produtos')
      .select('id, nome, categoria, marca, custo, preco, ativo, created_at, variacoes(id, tamanho, cor, codigo, estoque, estoque_minimo, ativo)')
      .eq('loja_id', S.loja.id).order('nome'));
    (data || []).forEach((p) => {
      p.custo = Number(p.custo) || 0;
      p.preco = Number(p.preco) || 0;
      p.variacoes = (p.variacoes || []).filter((v) => v.ativo).sort(ordemVar);
      p.estoque = p.variacoes.reduce((s, v) => s + Math.max(0, v.estoque), 0);
      p.baixo = p.variacoes.some((v) => v.estoque > 0 && v.estoque <= v.estoque_minimo);
      p.zerado = p.variacoes.some((v) => v.estoque <= 0);
    });
    S.produtos = data || [];
    return S.produtos;
  }

  // ---------- Notificações de venda (push) ----------
  const FN_PUSH = (CFG.url || '') + '/functions/v1/notificar-venda';
  async function chamarPush(method, body) {
    const sessao = (await sb.auth.getSession()).data.session;
    const r = await fetch(FN_PUSH, { method, headers: { 'Content-Type': 'application/json', apikey: CFG.key, Authorization: 'Bearer ' + (sessao ? sessao.access_token : CFG.key) }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(j.erro || 'Não deu para falar com o servidor de notificações.');
    return j;
  }
  const ehIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
  const instalado = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const suportaPush = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  function b64ParaBytes(b64) {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  }
  async function estadoPush() {
    if (!suportaPush()) return 'sem-suporte';
    if (Notification.permission === 'denied') return 'bloqueado';
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && (await reg.pushManager.getSubscription());
    if (!sub) return 'desligado';
    const { data } = await sb.from('push_inscricoes').select('endpoint').eq('endpoint', sub.endpoint).eq('loja_id', S.loja.id);
    return data && data.length ? 'ligado' : 'desligado';
  }
  async function ativarPush() {
    if (!suportaPush()) throw new Error(ehIOS() && !instalado() ? 'No iPhone, primeiro adicione o Foresee à Tela de Início e abra por lá.' : 'Este navegador não recebe notificações.');
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') throw new Error('Você não permitiu as notificações. Libere nos ajustes do celular.');
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      const { publicKey } = await chamarPush('GET');
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ParaBytes(publicKey) });
    }
    const j = sub.toJSON();
    await run(sb.from('push_inscricoes').upsert({ endpoint: j.endpoint, loja_id: S.loja.id, user_id: S.user.id, p256dh: j.keys.p256dh, auth: j.keys.auth, aparelho: navigator.userAgent.slice(0, 150) }, { onConflict: 'endpoint,loja_id' }));
  }
  async function desativarPush() {
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = reg && (await reg.pushManager.getSubscription());
    if (sub) await run(sb.from('push_inscricoes').delete().eq('endpoint', sub.endpoint).eq('loja_id', S.loja.id));
  }

  async function carregarVendedores(forcar) {
    if (S.vendedores && !forcar) return S.vendedores;
    S.vendedores = await run(sb.from('vendedores').select('id, nome, comissao_pct, ativo, user_id').eq('loja_id', S.loja.id).order('nome'));
    return S.vendedores;
  }

  async function carregarClientes(forcar) {
    if (S.clientes && S.resumoClientes && !forcar) return S.clientes;
    const [lista, resumo] = await Promise.all([
      run(sb.from('clientes').select('*').eq('loja_id', S.loja.id).order('nome')),
      run(sb.rpc('clientes_resumo', { p_loja: S.loja.id }))
    ]);
    const mapa = {};
    (resumo || []).forEach((r) => { mapa[r.cliente_id] = { compras: Number(r.compras) || 0, total: Number(r.total) || 0, ultima: r.ultima }; });
    S.resumoClientes = mapa;
    S.clientes = (lista || []).map((c) => Object.assign(c, mapa[c.id] || { compras: 0, total: 0, ultima: null }));
    return S.clientes;
  }

  const CATEGORIAS_PRODUTO = ['Camisetas', 'Camisas', 'Polos', 'Calças', 'Bermudas', 'Shorts', 'Jaquetas', 'Moletons', 'Vestidos', 'Saias', 'Blusas', 'Calçados', 'Bonés', 'Cintos', 'Meias', 'Cuecas', 'Acessórios', 'Perfumes', 'Outros'];
  const ORIGENS = ['Instagram', 'Viu a loja na rua', 'Indicação', 'WhatsApp', 'TikTok', 'Google', 'Cliente antigo', 'Outros'];
  const CANAIS = [['Loja física', ic.store], ['Instagram', svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>')], ['WhatsApp', ic.chat]];
  const FORMAS = [['Pix', ic.pix], ['Dinheiro', ic.cash], ['Débito', ic.card], ['Crédito', ic.card], ['Crediário', ic.calendar], ['Outro', ic.dots]];
  const CATEGORIAS_DESPESA = ['Aluguel', 'Funcionários e comissões', 'Pró-labore', 'Energia e água', 'Internet e telefone', 'Marketing e anúncios', 'Taxas de cartão e sistema', 'Impostos', 'Embalagens', 'Frete', 'Manutenção', 'Outros'];

  // ------------------------------------------------------------------
  // INÍCIO (painel)
  // ------------------------------------------------------------------
  // ------------------------------------------------------------------
  // HOJE (como a tela Hoje do App Belor)
  // ------------------------------------------------------------------
  function sparkline(vals) {
    const v = vals.map((x) => Number(x) || 0);
    if (v.length < 2 || !v.some((x) => x > 0)) return '';
    const W = 120, H = 30, max = Math.max(...v), min = Math.min(...v), amp = max - min || 1;
    const pts = v.map((x, i) => `${(i / (v.length - 1) * W).toFixed(1)},${(H - 3 - ((x - min) / amp) * (H - 6)).toFixed(1)}`).join(' ');
    const ult = pts.split(' ').pop().split(',');
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${ult[0]}" cy="${ult[1]}" r="2.6" fill="var(--accent)"/></svg>`;
  }
  const COR_FORMA = { Pix: 'var(--s1)', Dinheiro: 'var(--s2)', 'Crédito': 'var(--s3)', 'Débito': 'var(--s4)' };
  function barrasH(itens, total, porNome) {
    let i = 0;
    const cor = (n) => (porNome && porNome[n]) || (/^(—|outros?|não informado)$/i.test(n) ? 'var(--ghost)' : ['var(--s1)', 'var(--s2)', 'var(--s3)', 'var(--s4)'][Math.min(3, i++)]);
    return `<div class="hbars">${itens.map(([nome, val, rot]) => { const c = cor(nome); return `<div><div class="hb-top"><span><i class="sw" style="background:${c}"></i>${esc(nome)}</span><span>${rot || money(val)} <i>· ${pct(val / (total || 1))}</i></span></div>
      <div class="hb-track"><div class="hb-fill" style="width:${(val / (total || 1) * 100).toFixed(1)}%;background:${c}"></div></div></div>`; }).join('')}</div>`;
  }
  function escala(v) { if (!(v > 0)) v = 1; const alvo = v / 5, p = Math.pow(10, Math.floor(Math.log10(alvo))); const step = [1, 2, 2.5, 5, 10].map((x) => x * p).find((x) => x >= alvo); const n = Math.max(1, Math.ceil(v / step - 1e-9)); return { max: n * step, step, n }; }
  const tkFmt = (v) => (S.ocultar ? '' : v >= 1000 ? (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k' : Math.round(v).toLocaleString('pt-BR'));
  function barrasBelor(itens, o = {}) {
    const W = 340, H = o.h || 168, pl = 30, pr = 6, pt = 14, pb = 22, iw = W - pl - pr, ih = H - pt - pb;
    const E = escala(Math.max(o.meta || 0, ...itens.map((it) => it.v || 0)) * 1.06), mx = E.max;
    const step = iw / Math.max(1, itens.length), bw = Math.max(2, Math.min(18, step - 2));
    const Y = (v) => pt + ih - (v / mx) * ih;
    let sv = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.aria || 'gráfico')}">`;
    for (let k = 0; k <= E.n; k++) { const v = E.step * k, y = Y(v); sv += `<line class="${k ? 'gl' : 'ax'}" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text class="tk" x="${pl - 5}" y="${y + 3}" text-anchor="end">${tkFmt(v)}</text>`; }
    itens.forEach((it, i) => {
      const x = pl + i * step + (step - bw) / 2, v = it.v || 0, y = Y(v), h = pt + ih - y, r = Math.min(4, bw / 2, h);
      if (v > 0) sv += `<path class="bar ${it.cls || ''}" d="M${x},${pt + ih} V${y + r} Q${x},${y} ${x + r},${y} H${x + bw - r} Q${x + bw},${y} ${x + bw},${y + r} V${pt + ih} Z"><title>${esc(it.t || '')}</title></path>`;
      if (it.tick) sv += `<text class="tk ${it.cls || ''}" x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${esc(it.tick)}</text>`;
    });
    if (o.meta) sv += `<line class="tgt" x1="${pl}" x2="${W - pr}" y1="${Y(o.meta)}" y2="${Y(o.meta)}"/>`;
    return `<div class="chart-b">${sv}</svg></div>`;
  }

  TELAS.hoje = async function (v, _, token) {
    const agora = new Date(), hoje = inicioDia(agora);
    v.innerHTML = `<div class="card hoje-hero"><div class="esqueleto" style="height:120px"></div></div>
      <div class="grid k4" style="margin-top:12px">${'<div class="card kpi"><div class="esqueleto" style="height:58px"></div></div>'.repeat(4)}</div>`;
    const ini = addDias(hoje, -13);
    const [vendas, novos, listaHoje] = await Promise.all([
      run(sb.from('vendas').select('id, data, total, pecas, cliente_id, forma_pagamento, parcelas, vendedor_nome, canal, status')
        .eq('loja_id', S.loja.id).eq('status', 'concluida').gte('data', ini.toISOString()).order('data')),
      run(sb.from('clientes').select('origem, created_at').eq('loja_id', S.loja.id).gte('created_at', hoje.toISOString())),
      run(sb.from('vendas').select('id, numero, data, canal, cliente_id, vendedor_nome, vendedor_cad_id, comissao, subtotal, desconto, total, pecas, forma_pagamento, parcelas, status, observacao, clientes(nome, telefone)')
        .eq('loja_id', S.loja.id).gte('data', hoje.toISOString()).lt('data', addDias(hoje, 1).toISOString()).order('data', { ascending: false }))
    ]);
    if (!vivo(token)) return;
    const porDia = {};
    vendas.forEach((x) => {
      const k = isoData(new Date(x.data));
      const d = porDia[k] = porDia[k] || { fat: 0, vendas: 0, pecas: 0, comCad: 0 };
      d.fat += Number(x.total); d.vendas += 1; d.pecas += x.pecas; if (x.cliente_id) d.comCad += 1;
    });
    const kHoje = isoData(hoje);
    const h = porDia[kHoje] || { fat: 0, vendas: 0, pecas: 0, comCad: 0 };
    const vHoje = vendas.filter((x) => isoData(new Date(x.data)) === kHoje);
    let kOntem = null;
    for (let i = 1; i <= 13; i++) { const k = isoData(addDias(hoje, -i)); if (porDia[k]) { kOntem = k; break; } }
    const o = kOntem ? porDia[kOntem] : null;
    const meta = Number(S.loja.meta_mensal) || 0;
    const metaDia = meta ? meta / diasNoMes(agora) : 0;
    const prog = metaDia ? h.fat / metaDia : 0;
    const falta = Math.max(0, metaDia - h.fat);
    const ticket = h.vendas ? h.fat / h.vendas : 0;
    const pa = h.vendas ? h.pecas / h.vendas : 0;
    const ticketRef = ticket || (o && o.vendas ? o.fat / o.vendas : 0);
    const comp = (a, b) => { if (!b) return ''; const d = (a - b) / b; return `<span class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '▲' : '▼'} ${pct(Math.abs(d))}</span> vs ${fmtDataCurta(dataLocal(kOntem))}`; };
    const dias14 = Array.from({ length: 14 }, (_, i) => isoData(addDias(hoje, i - 13)));
    const serieVendas = dias14.slice(-7).map((k) => (porDia[k] ? porDia[k].vendas : 0));
    const serieTicket = dias14.filter((k) => porDia[k]).map((k) => porDia[k].fat / porDia[k].vendas).slice(-7);
    const DS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

    let html = `<div class="page-head"><div><h1>${saudacao()}, ${esc(primeiroNome(S.m.nome))}</h1><p class="sub">Hoje · ${esc(S.loja.nome)}</p></div></div>
      <div class="card hoje-hero">
      <div class="hoje-rot">Vendido hoje · ${DIAS[hoje.getDay()]}, ${fmtDataCurta(hoje)}</div>
      <div class="hoje-valor num">${money(h.fat)}</div>
      <div class="hoje-sub"><b>${h.vendas}</b> ${h.vendas === 1 ? 'venda' : 'vendas'}${ticket ? ` · ticket <b>${money(ticket)}</b>` : ''}${pa ? ` · PA <b>${n1(pa)}</b>` : ''}</div>
      ${metaDia ? `<div class="hoje-meta"><div class="row between small"><span>Meta do dia <b>${money(metaDia)}</b></span><b>${pct(prog)}</b></div>
        <div class="barra ${prog >= 1 ? 'ok' : ''}" style="margin:8px 0"><i style="width:${Math.min(100, prog * 100).toFixed(1)}%"></i></div>
        <div class="small">${prog >= 1 ? `Meta do dia batida! <b>+${money(h.fat - metaDia)}</b>` : `Faltam <b>${money(falta)}</b> pra meta do dia${ticketRef ? ` · umas <b>${Math.ceil(falta / ticketRef)}</b> vendas` : ''}`}</div></div>`
        : (dono() ? '<a class="small" href="#/ajustes">Defina a meta do mês para ver a meta do dia →</a>' : '')}
    </div>`;
    html += `<div class="grid k4" style="margin-top:12px">
      <div class="card kpi"><div class="rotulo">Vendas</div><div class="valor">${h.vendas}</div><div class="det">${o ? comp(h.vendas, o.vendas) : 'últimos 7 dias'}</div>${sparkline(serieVendas)}</div>
      <div class="card kpi"><div class="rotulo">Ticket médio</div><div class="valor">${ticket ? money(ticket) : '–'}</div><div class="det">${o && ticket ? comp(ticket, o.fat / o.vendas) : 'por venda'}</div>${sparkline(serieTicket)}</div>
      <div class="card kpi"><div class="rotulo">Peças por cliente</div><div class="valor">${pa ? n1(pa) : '–'}</div><div class="det">${plural(h.pecas, 'peça', 'peças')} hoje</div></div>
      <div class="card kpi"><div class="rotulo">Cadastros</div><div class="valor">${h.vendas ? `${h.comCad}<small class="faint" style="font-size:15px"> de ${h.vendas}</small>` : '–'}</div><div class="det">${h.vendas ? `<span class="${h.comCad / h.vendas >= 0.9 ? 'up' : 'down'}">${pct(h.comCad / h.vendas)}</span> das vendas com cadastro` : 'sem vendas ainda'}</div></div>
    </div>`;
    if (listaHoje.length) {
      html += `<div class="card" style="margin-top:12px;padding-bottom:4px"><h2>Vendas de hoje <span class="acao faint">toque para ver o detalhe</span></h2><div class="lista">${listaHoje.map((x) => `<button class="item" type="button" data-venda="${x.id}">
        <div class="avatar ${x.status === 'cancelada' ? 'cinza' : ''}" style="font-size:12px">nº${x.numero}</div>
        <div class="grow" style="min-width:0"><div class="tit ellipsis">${x.clientes ? esc(x.clientes.nome) : '<span class="muted">Sem cliente cadastrado</span>'}</div>
          <div class="sub">${fmtHora(x.data)} · ${esc(x.canal || 'Loja física')} · ${esc(x.forma_pagamento)}${x.parcelas > 1 ? ` ${x.parcelas}x` : ''} · ${plural(x.pecas, 'peça', 'peças')}${x.vendedor_nome ? ' · ' + esc(x.vendedor_nome) : ''}</div></div>
        <div class="right">${x.status === 'cancelada' ? '<span class="badge danger">Cancelada</span>' : `<b class="num">${money(x.total)}</b>`}</div></button>`).join('')}</div></div>`;
    }
    html += '<div class="grid c2" style="margin-top:12px">';
    if (novos.length) {
      const oc = {};
      novos.forEach((c) => { const k = c.origem || 'Não informado'; oc[k] = (oc[k] || 0) + 1; });
      const it = Object.entries(oc).sort((a, b) => b[1] - a[1]).map(([n, q]) => [n, q, plural(q, 'cliente', 'clientes')]);
      html += `<div class="card"><h2>Clientes novos hoje <span class="acao faint">${plural(novos.length, 'cadastrado', 'cadastrados')}</span></h2>${barrasH(it, novos.length)}</div>`;
    }
    const pv = {};
    vHoje.forEach((x) => { const k = x.vendedor_nome || '—'; pv[k] = (pv[k] || 0) + Number(x.total); });
    if (vHoje.length) html += `<div class="card"><h2>Por vendedor <span class="acao faint">hoje</span></h2>${barrasH(Object.entries(pv).sort((a, b) => b[1] - a[1]), h.fat)}</div>`;
    const pf = {};
    vHoje.forEach((x) => { pf[x.forma_pagamento] = (pf[x.forma_pagamento] || 0) + Number(x.total); });
    if (vHoje.length) html += `<div class="card"><h2>Formas de pagamento <span class="acao faint">hoje</span></h2>${barrasH(Object.entries(pf).sort((a, b) => b[1] - a[1]), h.fat, COR_FORMA)}</div>`;
    const pc = {};
    vHoje.forEach((x) => { const k = x.canal || 'Loja física'; pc[k] = (pc[k] || 0) + Number(x.total); });
    if (Object.keys(pc).length > 1) html += `<div class="card"><h2>Onde vendeu <span class="acao faint">hoje</span></h2>${barrasH(Object.entries(pc).sort((a, b) => b[1] - a[1]), h.fat)}</div>`;
    html += '</div>';
    // últimos 7 dias
    const ult7 = dias14.slice(-7).map((k) => ({ k, fat: porDia[k] ? porDia[k].fat : 0, vendas: porDia[k] ? porDia[k].vendas : 0 }));
    html += `<div class="card" style="margin-top:12px"><h2>Últimos 7 dias ${metaDia ? `<span class="acao faint">meta/dia ${brl(metaDia)}</span>` : ''}</h2>
      ${barrasBelor(ult7.map((x) => ({ v: x.fat, tick: DS[dataLocal(x.k).getDay()], cls: x.k === kHoje ? 'today' : '', t: `${cap(DIAS[dataLocal(x.k).getDay()])}, ${fmtDataCurta(dataLocal(x.k))}: ${brl(x.fat)} · ${plural(x.vendas, 'venda', 'vendas')}` })), { meta: metaDia, h: 150, aria: 'Faturamento dos últimos 7 dias' })}
      <div class="legenda"><span><i style="background:var(--gold)"></i>Faturamento</span>${metaDia ? '<span><i class="tracejado"></i>Meta do dia</span>' : ''}</div></div>`;
    if (o) {
      const tk = o.fat / o.vendas;
      html += `<div class="card" style="margin-top:12px"><h2>Último dia de venda <span class="acao faint">${cap(DIAS[dataLocal(kOntem).getDay()])}, ${fmtDataCurta(dataLocal(kOntem))}</span></h2>
        <div class="lista">
          <div class="item" style="cursor:default"><span class="grow">Faturamento</span><b class="num">${money(o.fat)}</b></div>
          <div class="item" style="cursor:default"><span class="grow">Vendas</span><b class="num">${o.vendas}</b></div>
          <div class="item" style="cursor:default"><span class="grow">Ticket médio</span><b class="num">${money(tk)}</b></div>
          <div class="item" style="cursor:default"><span class="grow">Peças por cliente</span><b class="num">${n1(o.pecas / o.vendas)}</b></div>
          ${metaDia ? `<div class="item" style="cursor:default"><span class="grow">x meta do dia</span><span class="badge ${o.fat >= metaDia ? 'ok' : o.fat >= metaDia * 0.85 ? 'warn' : 'danger'}">${pct(o.fat / metaDia)}</span></div>` : ''}
        </div></div>`;
    }
    v.innerHTML = html;
    v.onclick = (e) => {
      const b = e.target.closest('[data-venda]');
      if (b) detalheVenda(listaHoje.find((x) => x.id === b.dataset.venda));
    };
  };

  TELAS.inicio = async function (v, _, token) {
    const agora = new Date();
    v.innerHTML = `<div class="page-head"><div><h1>${saudacao()}, ${esc(primeiroNome(S.m.nome))}</h1>
      <p class="sub">${cap(fmtDiaLongo(agora))} · ${esc(S.loja.nome)}</p></div></div>
      <div class="grid k4">${'<div class="card kpi"><div class="esqueleto" style="height:58px"></div></div>'.repeat(4)}</div>
      <div class="card" style="margin-top:12px"><div class="esqueleto" style="height:150px"></div></div>`;

    const hoje = inicioDia(agora);
    const ini = inicioMes(agora);
    const fim = inicioMes(agora, 1);
    const iniAnt = inicioMes(agora, -1);
    const diaAnt = Math.min(agora.getDate(), diasNoMes(iniAnt));
    const fimAnt = new Date(iniAnt.getFullYear(), iniAnt.getMonth(), diaAnt, agora.getHours(), agora.getMinutes(), agora.getSeconds());
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone) || 'America/Sao_Paulo';
    if (dono()) { try { await run(sb.rpc('gerar_despesas_fixas', { p_loja: S.loja.id, p_mes: isoData(ini) })); } catch (e) { /* segue */ } }
    const p = await run(sb.rpc('painel', {
      p_loja: S.loja.id, p_tz: tz, p_hoje: hoje.toISOString(), p_inicio: ini.toISOString(), p_fim: fim.toISOString(),
      p_inicio_ant: iniAnt.toISOString(), p_fim_ant: fimAnt.toISOString()
    }));
    if (!vivo(token)) return;

    const m = p.mes, a = p.anterior, h = p.hoje;
    const fat = Number(m.faturamento) || 0;
    const meta = Number(S.loja.meta_mensal) || 0;
    const nDias = diasNoMes(agora);
    const diaHoje = agora.getDate();
    const ticketH = h.vendas ? h.faturamento / h.vendas : 0;
    const ticketM = m.vendas ? fat / m.vendas : 0;
    const ticketA = a.vendas ? a.faturamento / a.vendas : 0;

    let html = `<div class="page-head"><div><h1>${saudacao()}, ${esc(primeiroNome(S.m.nome))}</h1>
      <p class="sub">${cap(fmtDiaLongo(agora))} · ${esc(S.loja.nome)}</p></div></div>`;

    html += `<div class="grid k4">
      <div class="card kpi destaque"><div class="rotulo">Vendido hoje</div><div class="valor">${money(h.faturamento)}</div><div class="det">${plural(h.vendas, 'venda', 'vendas')} · ${plural(h.pecas, 'peça', 'peças')}</div></div>
      <div class="card kpi"><div class="rotulo">No mês</div><div class="valor">${money(fat)}</div><div class="det">${variacao(fat, a.faturamento) || plural(m.vendas, 'venda', 'vendas')}${a.faturamento ? ' vs mês passado' : ''}</div></div>
      <div class="card kpi"><div class="rotulo">Ticket médio</div><div class="valor">${money(m.vendas ? ticketM : ticketH)}</div><div class="det">${variacao(ticketM, ticketA) ? variacao(ticketM, ticketA) + ' vs mês passado' : 'por venda no mês'}</div></div>
      <div class="card kpi"><div class="rotulo">Peças por venda</div><div class="valor">${m.vendas ? n1(m.pecas / m.vendas) : '–'}</div><div class="det">${plural(m.pecas, 'peça vendida', 'peças vendidas')}</div></div>
    </div>`;

    // Primeiros passos
    const passos = [
      { feito: p.estoque.produtos > 0 || m.vendas > 0, t: 'Cadastre seus produtos e o estoque', href: '#/produto/novo' },
      { feito: m.vendas > 0 || a.vendas > 0, t: 'Registre a primeira venda', href: '#/vender' },
      ...(dono() ? [
        { feito: meta > 0, t: 'Defina a meta de vendas do mês', href: '#/ajustes' },
        { feito: p.despesas && Number(p.despesas.total) > 0, t: 'Lance as despesas do mês (aluguel, luz...)', href: '#/despesas' }
      ] : [])
    ];
    const faltam = passos.filter((x) => !x.feito).length;
    if (faltam) {
      html += `<div class="section-title">Primeiros passos</div><div class="card"><div class="check-lista">
        ${passos.map((x, i) => `<a href="${x.href}" class="${x.feito ? 'feito' : ''}"><span class="n">${x.feito ? '✓' : i + 1}</span><span class="t grow">${x.t}</span>${x.feito ? '' : ic.chevRight.replace('<svg', '<svg style="width:18px;height:18px;color:var(--ink-3)"')}</a>`).join('')}
      </div></div>`;
    }

    // Insights
    const ins = gerarInsights(p, { meta, nDias, diaHoje, ticketM, ticketA });
    if (ins.length) {
      html += `<div class="section-title">O que o Foresee está vendo</div><div class="card"><div class="insights">
        ${ins.slice(0, 6).map((x) => `<div class="insight ${x.tipo}"><div class="ic">${x.icone}</div><div><b>${x.titulo}</b><p>${x.texto}</p>${x.href ? `<a href="${x.href}">${x.acao} →</a>` : ''}</div></div>`).join('')}
      </div></div>`;
    }

    // Meta + lucro
    html += '<div class="grid c2" style="margin-top:12px">';
    const restantes = nDias - diaHoje + 1;
    const projecao = diaHoje ? (fat / diaHoje) * nDias : 0;
    if (meta > 0) {
      const prog = fat / meta;
      const falta = Math.max(0, meta - fat);
      const ritmoOk = prog >= diaHoje / nDias;
      html += `<div class="card"><h2>${ic.target.replace('<svg', '<svg style="width:20px;height:20px"')} Meta do mês ${dono() ? '<a class="acao" href="#/ajustes">Alterar</a>' : ''}</h2>
        <div class="row between" style="align-items:flex-end"><div class="meta-num">${money(fat)}</div><div class="right small muted">de ${money(meta)}<br><b style="color:var(--ink)">${pct(prog)}</b></div></div>
        <div class="barra ${ritmoOk ? '' : 'warn'}" style="margin:12px 0"><i style="width:${Math.min(100, prog * 100).toFixed(1)}%"></i></div>
        <p class="small muted">${falta > 0
          ? `Faltam ${money(falta)}. Para bater a meta: <b style="color:var(--ink)">${money(falta / restantes)} por dia</b> ${restantes === 1 ? 'hoje' : `nos ${restantes} dias que restam`}.`
          : '<b style="color:var(--accent-2)">Meta batida!</b> Tudo que entrar agora é extra.'}
          No ritmo atual, o mês fecha em <b style="color:var(--ink)">${money(projecao)}</b>.</p></div>`;
    } else {
      html += `<div class="card"><h2>${ic.target.replace('<svg', '<svg style="width:20px;height:20px"')} Meta do mês</h2>
        <p class="muted small">Sem meta definida. No ritmo atual, o mês fecha em <b style="color:var(--ink)">${money(projecao)}</b>.</p>
        ${dono() ? '<a class="btn peq" href="#/ajustes" style="margin-top:12px">Definir meta</a>' : ''}</div>`;
    }
    if (dono()) {
      const cmv = Number(m.custo) || 0;
      const desp = p.despesas ? Number(p.despesas.total) || 0 : 0;
      const com = Number(m.comissao) || 0;
      const bruto = fat - cmv;
      const liquido = bruto - desp - com;
      const base = Math.max(fat, cmv + desp + com, 1);
      html += `<div class="card"><h2>${ic.wallet.replace('<svg', '<svg style="width:20px;height:20px"')} Lucro do mês <a class="acao" href="#/despesas">Despesas</a></h2>
        <div class="cascata">
          <div class="linha"><span>Vendas</span><b class="num">${money(fat)}</b><div class="barra"><i style="width:${(fat / base * 100).toFixed(1)}%"></i></div></div>
          <div class="linha"><span class="muted">− Custo das peças vendidas</span><span class="num">${money(cmv)}</span><div class="barra warn"><i style="width:${(cmv / base * 100).toFixed(1)}%"></i></div></div>
          <div class="linha"><span class="muted">− Despesas da loja</span><span class="num">${money(desp)}</span><div class="barra danger"><i style="width:${(desp / base * 100).toFixed(1)}%"></i></div></div>
          ${com ? `<div class="linha"><span class="muted">− Comissões dos vendedores</span><span class="num">${money(com)}</span><div class="barra danger"><i style="width:${(com / base * 100).toFixed(1)}%"></i></div></div>` : ''}
          <div class="linha total"><span>${liquido >= 0 ? 'Lucro' : 'Prejuízo'}</span><span class="num ${liquido >= 0 ? 'up' : 'down'}">${money(liquido)}</span></div>
        </div>
        <p class="small faint" style="margin-top:8px">${fat ? `${Math.abs(liquido / fat) <= 1 ? `Margem líquida de ${pct(liquido / fat)} · ` : ''}margem bruta de ${pct(bruto / fat)}` : 'Os números aparecem com as vendas.'}${!desp ? ' · <a href="#/despesas">lance as despesas</a> para ver o lucro real' : ''}</p></div>`;
    }
    html += '</div>';

    // Gráfico do mês
    const porDia = {};
    (p.dias || []).forEach((d) => { porDia[dataLocal(d.dia).getDate()] = { total: Number(d.total) || 0, vendas: d.vendas }; });
    const cs = getComputedStyle(v);
    const largura = Math.max(280, Math.min(1060, v.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 34));
    html += `<div class="card" style="margin-top:12px"><h2>Vendas por dia · ${cap(MESES[agora.getMonth()])}</h2>
      ${graficoDias(porDia, nDias, diaHoje, meta ? meta / nDias : 0, largura)}
      ${meta ? '<p class="tiny faint" style="margin-top:6px">A linha tracejada é a meta por dia.</p>' : ''}</div>`;

    // Top produtos, pagamentos, vendedores, estoque
    html += '<div class="grid c2" style="margin-top:12px">';
    const top = p.top || [];
    html += `<div class="card"><h2>Mais vendidos do mês</h2>${top.length ? `<div class="lista">${top.map((t, i) => `
        <div class="item" style="cursor:default"><div class="avatar ${i ? 'cinza' : ''}">${i + 1}</div><div class="grow"><div class="tit ellipsis">${esc(t.nome)}</div>
        <div class="barra" style="height:6px;margin-top:6px"><i style="width:${(t.pecas / top[0].pecas * 100).toFixed(0)}%"></i></div></div>
        <div class="right"><b class="num">${plural(t.pecas, 'peça', 'peças')}</b><div class="small muted">${money(t.total)}</div></div></div>`).join('')}</div>`
      : '<p class="muted small">Ainda sem vendas neste mês.</p>'}</div>`;
    const formas = p.formas || [];
    html += `<div class="card"><h2>Formas de pagamento</h2>${formas.length ? `<div class="stack">${formas.map((f) => `
        <div><div class="row between small"><span><b>${esc(f.forma)}</b> · ${plural(f.vendas, 'venda', 'vendas')}</span><span class="num">${money(f.total)} · ${pct(f.total / (fat || 1))}</span></div>
        <div class="barra" style="height:6px;margin-top:6px"><i style="width:${(f.total / (fat || 1) * 100).toFixed(1)}%"></i></div></div>`).join('')}</div>`
      : '<p class="muted small">Ainda sem vendas neste mês.</p>'}</div>`;
    const canais = p.canais || [];
    if (canais.length) {
      html += `<div class="card"><h2>Onde vende</h2><div class="stack">${canais.map((c) => `
        <div><div class="row between small"><span><b>${esc(c.canal)}</b> · ${plural(c.vendas, 'venda', 'vendas')}</span><span class="num">${money(c.total)} · ${pct(c.total / (fat || 1))}</span></div>
        <div class="barra" style="height:6px;margin-top:6px"><i style="width:${(c.total / (fat || 1) * 100).toFixed(1)}%"></i></div></div>`).join('')}</div></div>`;
    }
    if ((p.vendedores || []).length > 1 || (p.vendedores || []).some((x) => x.comissao)) {
      html += `<div class="card"><h2>Vendas por pessoa</h2><div class="lista">${p.vendedores.map((x) => `
        <div class="item" style="cursor:default"><div class="avatar cinza">${esc(iniciais(x.nome))}</div><div class="grow"><div class="tit">${esc(x.nome)}</div><div class="sub">${plural(x.vendas, 'venda', 'vendas')} · ticket ${money(x.total / (x.vendas || 1))}${x.comissao ? ` · comissão ${money(x.comissao)}` : ''}</div></div><b class="num">${money(x.total)}</b></div>`).join('')}</div></div>`;
    }
    const e = p.estoque;
    html += `<div class="card"><h2>${ic.box.replace('<svg', '<svg style="width:20px;height:20px"')} Estoque <a class="acao" href="#/produtos">Ver</a></h2>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:14px">
        <div><div class="tiny faint">PEÇAS NA LOJA</div><div style="font-size:22px;font-weight:750" class="num">${e.pecas}</div></div>
        <div><div class="tiny faint">VALE (PREÇO DE VENDA)</div><div style="font-size:22px;font-weight:750" class="num">${money(e.valor_venda)}</div></div>
        ${e.valor_custo !== null && e.valor_custo !== undefined ? `<div><div class="tiny faint">CUSTOU</div><div style="font-size:17px;font-weight:700" class="num">${money(e.valor_custo)}</div></div>` : ''}
        <div><div class="tiny faint">PRODUTOS</div><div style="font-size:17px;font-weight:700" class="num">${e.produtos}</div></div>
      </div>
      <div class="chips" style="margin-top:14px">
        ${e.baixo ? `<a class="chip" href="#/produtos/baixo"><span class="badge warn">${e.baixo}</span> estoque baixo</a>` : ''}
        ${e.zerado ? `<a class="chip" href="#/produtos/zerado"><span class="badge danger">${e.zerado}</span> zerados</a>` : ''}
      </div></div>`;
    html += '</div>';

    v.innerHTML = html;
  };

  function graficoDias(porDia, nDias, diaHoje, metaDia, largura) {
    const W = Math.round(largura || 640), H = W < 500 ? 150 : 180, esq = 4, base = H - 22, topo = 14;
    const vals = Array.from({ length: nDias }, (_, i) => (porDia[i + 1] ? porDia[i + 1].total : 0));
    const max = Math.max(1, ...vals, metaDia || 0) * 1.08;
    const bw = (W - esq * 2) / nDias;
    const y = (val) => base - (val / max) * (base - topo);
    let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Vendas por dia do mês">`;
    vals.forEach((val, i) => {
      const dia = i + 1;
      const x = esq + i * bw + bw * 0.14;
      const w = bw * 0.72;
      const futuro = dia > diaHoje;
      if (val > 0) {
        const yy = y(val);
        s += `<rect class="bar ${dia === diaHoje ? 'hoje' : ''}" x="${x.toFixed(1)}" y="${yy.toFixed(1)}" width="${w.toFixed(1)}" height="${(base - yy).toFixed(1)}" rx="3"><title>Dia ${dia}: ${brl(val)} (${plural(porDia[dia].vendas, 'venda', 'vendas')})</title></rect>`;
      } else {
        s += `<rect class="bar vazio" x="${x.toFixed(1)}" y="${base - 3}" width="${w.toFixed(1)}" height="3" rx="1.5" opacity="${futuro ? 0.5 : 1}"/>`;
      }
      if (dia === 1 || dia % 5 === 0 || dia === diaHoje) {
        s += `<text x="${(x + w / 2).toFixed(1)}" y="${H - 6}" text-anchor="middle" ${dia === diaHoje ? 'style="font-weight:700;fill:var(--ink)"' : ''}>${dia}</text>`;
      }
    });
    if (metaDia > 0) s += `<line class="meta-linha" x1="${esq}" x2="${W - esq}" y1="${y(metaDia).toFixed(1)}" y2="${y(metaDia).toFixed(1)}"/>`;
    return s + '</svg>';
  }

  function gerarInsights(p, ctx) {
    const out = [];
    const m = p.mes, a = p.anterior;
    const fat = Number(m.faturamento) || 0;
    const add = (tipo, icone, titulo, texto, href, acao) => out.push({ tipo, icone, titulo, texto, href, acao });

    if (dono() && fat > 0) {
      const cmv = Number(m.custo) || 0;
      const desp = p.despesas ? Number(p.despesas.total) || 0 : 0;
      const projFat = (fat / ctx.diaHoje) * ctx.nDias;
      const com = Number(m.comissao) || 0;
      const projLucro = projFat - ((cmv + com) / fat) * projFat - desp;
      if (desp > 0 && projLucro < 0) {
        add('danger', ic.alert, 'O mês caminha para prejuízo', `No ritmo atual, as vendas não cobrem o custo das peças e as despesas. Faltariam ${money(-projLucro)} no fim do mês.`, '#/despesas', 'Ver despesas');
      }
      const margemBruta = (fat - cmv) / fat;
      if (cmv > 0 && margemBruta < 0.4) {
        add('warn', ic.tag, `Margem baixa: ${pct(margemBruta)} por peça`, `Em moda, o normal é vender por 2 a 2,5 vezes o custo (margem de 50% a 60%). Revise os preços ou negocie com o fornecedor.`, '#/produtos', 'Ver preços');
      }
    }
    const e = p.estoque;
    if (e.zerado > 0) add('danger', ic.box, `${plural(e.zerado, 'tamanho zerado', 'tamanhos zerados')}`, 'Cliente procura e não acha: é venda perdida. Reponha os que mais saem.', '#/produtos/zerado', 'Ver quais');
    if (e.baixo > 0) add('warn', ic.box, `${plural(e.baixo, 'tamanho acabando', 'tamanhos acabando')}`, 'Estão no estoque mínimo. Faça o pedido antes de zerar.', '#/produtos/baixo', 'Ver quais');
    const par = p.parados;
    if (par && par.produtos > 0) {
      const ex = (par.exemplos || []).slice(0, 3).map(esc).join(', ');
      add('warn', ic.clock, `${plural(par.produtos, 'produto parado', 'produtos parados')} há mais de 30 dias`,
        `${plural(par.pecas, 'peça', 'peças')} sem vender${par.valor_custo !== null && par.valor_custo !== undefined ? ` (${money(par.valor_custo)} de dinheiro parado)` : ''}${ex ? `: ${ex}` : ''}. Pense em vitrine, promoção ou kit.`, '#/produtos', 'Ver produtos');
    }
    if (m.vendas >= 3) {
      const taxa = m.com_cliente / m.vendas;
      if (taxa < 0.7) add('warn', ic.users, `Só ${pct(taxa)} das vendas com cliente cadastrado`, 'Sem cadastro você não consegue chamar o cliente de volta. Meta: 9 em cada 10 vendas.', '#/clientes', 'Ver clientes');
      else if (taxa >= 0.9) add('good', ic.users, `${pct(taxa)} das vendas com cliente cadastrado`, 'Ótimo! Essa lista vale ouro para chamar o cliente quando chegar novidade.', '#/clientes', 'Ver clientes');
      const descPct = Number(m.subtotal) ? Number(m.desconto) / Number(m.subtotal) : 0;
      if (descPct > 0.06) add('warn', ic.tag, `Desconto médio de ${pct(descPct, 1)}`, `O ideal é até 6%. Neste mês saíram ${money(m.desconto)} em descontos.`, '#/vendas', 'Ver vendas');
      const ppv = m.pecas / m.vendas;
      if (m.vendas >= 5 && ppv < 1.6) add('info', ic.bag, `${n1(ppv)} peça por venda`, 'Ofereça uma segunda peça no caixa (cinto, meia, boné). Subir para 2 peças por venda aumenta o faturamento sem precisar de cliente novo.');
    }
    if (a.vendas >= 3 && m.vendas >= 3 && ctx.ticketA) {
      const d = ctx.ticketM / ctx.ticketA - 1;
      if (d <= -0.1) add('warn', ic.down, `Ticket médio caiu ${pct(-d)}`, `Está em ${money(ctx.ticketM)} contra ${money(ctx.ticketA)} no mesmo período do mês passado.`);
      else if (d >= 0.1) add('good', ic.up, `Ticket médio subiu ${pct(d)}`, `Está em ${money(ctx.ticketM)} contra ${money(ctx.ticketA)} no mesmo período do mês passado.`);
    }
    if (Number(a.faturamento) > 0 && fat > 0) {
      const d = fat / a.faturamento - 1;
      if (d <= -0.15) add('warn', ic.down, `Vendas ${pct(-d)} abaixo do mês passado`, `Até hoje: ${money(fat)} contra ${money(a.faturamento)} no mesmo período do mês passado.`, '#/vendas', 'Ver vendas');
      else if (d >= 0.15) add('good', ic.up, `Vendas ${pct(d)} acima do mês passado`, `Até hoje: ${money(fat)} contra ${money(a.faturamento)} no mesmo período do mês passado.`);
    }
    if (ctx.meta > 0 && fat > 0) {
      const proj = (fat / ctx.diaHoje) * ctx.nDias;
      if (proj < ctx.meta * 0.9 && ctx.diaHoje >= 5) add('warn', ic.target, 'No ritmo atual, a meta não bate', `A projeção é ${money(proj)} (${pct(proj / ctx.meta)} da meta).`);
    }
    if (dono() && p.despesas && Number(p.despesas.total) === 0 && ctx.diaHoje >= 5 && fat > 0) {
      add('info', ic.wallet, 'Despesas do mês ainda não lançadas', 'Sem as despesas, o lucro mostrado é maior do que o real.', '#/despesas', 'Lançar despesas');
    }
    const ordem = { danger: 0, warn: 1, info: 2, good: 3 };
    return out.sort((x, y) => ordem[x.tipo] - ordem[y.tipo]);
  }

  // ------------------------------------------------------------------
  // VENDER (caixa)
  // ------------------------------------------------------------------
  TELAS.vender = async function (v, _, token) {
    v.innerHTML = `<div class="page-head"><div><h1>Nova venda</h1><p class="sub">Toque na peça para colocar no carrinho</p></div></div>
      <div class="caixa"><div>
        <div class="busca">${ic.search}<input class="input" id="busca-venda" type="search" placeholder="Buscar produto, código ou categoria" autocomplete="off"></div>
        <div class="chips rolar" id="cats-venda" style="margin:12px 0"></div>
        <div class="lista-venda" id="lista-venda">${'<div class="esqueleto" style="height:64px"></div>'.repeat(4)}</div>
      </div><aside class="carrinho-lateral card" id="carrinho-lateral"></aside></div>
      <button class="barra-carrinho hidden" type="button" id="barra-carrinho"></button>`;
    renderCarrinho();
    const produtos = (await carregarProdutos()).filter((p) => p.ativo);
    if (S.carrinho.length) {
      const est = {};
      produtos.forEach((p) => p.variacoes.forEach((x) => { est[x.id] = x.estoque; }));
      let mudou = false;
      S.carrinho = S.carrinho.filter((i) => {
        if (!(i.variacao_id in est)) { mudou = true; return false; }
        i.estoque = est[i.variacao_id];
        if (i.qtd > i.estoque) { i.qtd = Math.max(0, i.estoque); mudou = true; }
        return i.qtd > 0;
      });
      if (mudou) { salvarCarrinho(); renderCarrinho(); toast('O carrinho foi ajustado ao estoque atual.'); }
    }
    if (!vivo(token)) return;
    const lista = $('#lista-venda');
    if (!produtos.length) {
      lista.style.display = 'block';
      lista.innerHTML = soVendedor() ? vazioHTML(ic.shirt, 'Nenhum produto cadastrado', 'Peça para o dono ou gerente cadastrar os produtos.', null, '') : vazioHTML(ic.shirt, 'Nenhum produto cadastrado', 'Cadastre os produtos para vender pelo Foresee.', '#/produto/novo', 'Cadastrar produto');
      return;
    }
    const cats = [...new Set(produtos.map((p) => p.categoria).filter(Boolean))].sort();
    let cat = '';
    const catsEl = $('#cats-venda');
    if (cats.length > 1) {
      catsEl.innerHTML = ['', ...cats].map((c) => `<button class="chip ${c === cat ? 'ativo' : ''}" type="button" data-cat="${esc(c)}">${c ? esc(c) : 'Todos'}</button>`).join('');
      catsEl.addEventListener('click', (e) => {
        const b = e.target.closest('[data-cat]');
        if (!b) return;
        cat = b.dataset.cat;
        $$('[data-cat]', catsEl).forEach((x) => x.classList.toggle('ativo', x.dataset.cat === cat));
        desenhar();
      });
    } else catsEl.classList.add('hidden');
    const busca = $('#busca-venda');
    function desenhar() {
      const t = busca.value.trim().toLowerCase();
      const filtrados = produtos.filter((p) => (!cat || p.categoria === cat) && (!t ||
        p.nome.toLowerCase().includes(t) || (p.categoria || '').toLowerCase().includes(t) || (p.marca || '').toLowerCase().includes(t) ||
        p.variacoes.some((x) => (x.codigo || '').toLowerCase() === t)));
      lista.innerHTML = filtrados.length ? filtrados.map((p) => `<button class="produto-venda" type="button" data-prod="${p.id}">
          <div class="avatar ${p.estoque ? '' : 'cinza'}">${esc(iniciais(p.nome))}</div>
          <div class="grow" style="min-width:0"><div class="tit ellipsis" style="font-weight:650">${esc(p.nome)}</div>
          <div class="small ${p.estoque ? 'muted' : 'down'}">${p.estoque ? plural(p.estoque, 'peça', 'peças') + ' em estoque' : 'Sem estoque'}${p.categoria ? ' · ' + esc(p.categoria) : ''}</div></div>
          <div class="preco">${money(p.preco)}</div></button>`).join('')
        : '<p class="muted" style="padding:20px 4px">Nenhum produto encontrado.</p>';
    }
    lista.addEventListener('click', (e) => {
      const b = e.target.closest('[data-prod]');
      if (!b) return;
      const p = produtos.find((x) => x.id === b.dataset.prod);
      if (p) escolherVariacao(p);
    });
    busca.addEventListener('input', desenhar);
    busca.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      const t = busca.value.trim().toLowerCase();
      for (const p of produtos) {
        const x = p.variacoes.find((vv) => (vv.codigo || '').toLowerCase() === t);
        if (x) { adicionarAoCarrinho(p, x); busca.value = ''; desenhar(); return; }
      }
    });
    desenhar();
  };

  function escolherVariacao(p) {
    if (!p.variacoes.length) { toast('Esse produto não tem tamanhos cadastrados.', 'erro'); return; }
    if (p.variacoes.length === 1) { adicionarAoCarrinho(p, p.variacoes[0]); return; }
    const porCor = {};
    p.variacoes.forEach((x) => { (porCor[x.cor || ''] = porCor[x.cor || ''] || []).push(x); });
    abrirFolha(`${cabFolha(esc(p.nome), money(p.preco))}
      ${Object.keys(porCor).map((cor) => `${cor ? `<h3 style="margin:6px 0 8px">${esc(cor)}</h3>` : ''}<div class="opcoes-var" style="margin-bottom:12px">
        ${porCor[cor].map((x) => { const resta = x.estoque - noCarrinho(x.id); return `<button class="opcao-var ${resta <= 0 ? 'sem' : ''}" type="button" data-var="${x.id}" ${resta <= 0 ? 'aria-disabled="true"' : ''}><b>${esc(x.tamanho)}</b><span>${x.estoque <= 0 ? 'sem estoque' : resta <= 0 ? 'todas no carrinho' : plural(resta, 'peça', 'peças')}</span></button>`; }).join('')}
      </div>`).join('')}`, {
      aoAbrir: (f, fechar) => {
        $$('[data-var]', f).forEach((b) => b.addEventListener('click', async () => {
          const x = p.variacoes.find((vv) => vv.id === b.dataset.var);
          if (x.estoque - noCarrinho(x.id) <= 0) {
            toast(x.estoque <= 0 ? `${rotuloVar(x)} está sem estoque.` : `Só tem ${plural(x.estoque, 'peça', 'peças')} de ${rotuloVar(x)}, e todas já estão no carrinho.`, 'erro');
            return;
          }
          fechar();
          adicionarAoCarrinho(p, x);
        }));
      }
    });
  }

  const noCarrinho = (vid) => S.carrinho.filter((i) => i.variacao_id === vid).reduce((t, i) => t + i.qtd, 0);
  function adicionarAoCarrinho(p, x) {
    if (x.estoque - noCarrinho(x.id) <= 0) {
      toast(x.estoque <= 0 ? `${p.nome} ${rotuloVar(x)} está sem estoque.` : `Só tem ${plural(x.estoque, 'peça', 'peças')} de ${p.nome} ${rotuloVar(x)}.`, 'erro');
      return;
    }
    const item = S.carrinho.find((i) => i.variacao_id === x.id);
    if (item) { item.qtd += 1; item.estoque = x.estoque; }
    else S.carrinho.push({ variacao_id: x.id, produto_id: p.id, nome: p.nome, tamanho: x.tamanho, cor: x.cor, preco: p.preco, qtd: 1, estoque: x.estoque });
    salvarCarrinho();
    renderCarrinho();
    toast(`+1 ${p.nome} ${rotuloVar(x)}`);
  }

  const totalCarrinho = () => S.carrinho.reduce((s, i) => s + i.preco * i.qtd, 0);
  const pecasCarrinho = () => S.carrinho.reduce((s, i) => s + i.qtd, 0);

  function carrinhoHTML() {
    if (!S.carrinho.length) return `<h2>Carrinho</h2><p class="muted small">Toque nos produtos para adicionar.</p>`;
    return `<h2>Carrinho <span class="badge">${plural(pecasCarrinho(), 'peça', 'peças')}</span><button class="link-btn acao" type="button" data-limpar>Limpar</button></h2>
      <div>${S.carrinho.map((i, n) => `<div class="cart-item">
        <div style="min-width:0"><div style="font-weight:650" class="ellipsis">${esc(i.nome)}</div>
          <div class="small muted">${esc(rotuloVar(i))} · <button class="link-btn small" type="button" data-preco="${n}">${brl(i.preco)}</button></div></div>
        <div class="right"><div class="stepper"><button type="button" data-menos="${n}" aria-label="Menos">−</button><span>${i.qtd}</span><button type="button" data-mais="${n}" aria-label="Mais">+</button></div>
          <div class="small num" style="margin-top:4px">${money(i.preco * i.qtd)}</div></div></div>`).join('')}</div>
      <div class="total-linha grande"><span>Total</span><span>${money(totalCarrinho())}</span></div>
      <button class="btn prim bloco grande" type="button" data-pagar style="margin-top:12px">Ir para o pagamento</button>`;
  }

  function ligarCarrinho(el, aoMudar) {
    el.onclick = async (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      if (b.hasAttribute('data-limpar')) {
        if (!(await confirmar('Limpar o carrinho?', { ok: 'Limpar', perigo: true }))) return;
        S.carrinho = [];
      } else if (b.dataset.mais !== undefined) {
        const it = S.carrinho[+b.dataset.mais];
        if (it.qtd >= it.estoque) { toast(`Só tem ${plural(Math.max(it.estoque, 0), 'peça', 'peças')} de ${it.nome} ${rotuloVar(it)} em estoque.`, 'erro'); return; }
        it.qtd += 1;
      } else if (b.dataset.menos !== undefined) {
        const i = S.carrinho[+b.dataset.menos];
        i.qtd -= 1;
        if (i.qtd <= 0) S.carrinho.splice(+b.dataset.menos, 1);
      } else if (b.dataset.preco !== undefined) {
        editarPrecoItem(+b.dataset.preco);
        return;
      } else if (b.hasAttribute('data-pagar')) {
        abrirPagamento();
        return;
      } else return;
      salvarCarrinho();
      renderCarrinho();
      if (aoMudar) aoMudar();
    };
  }

  let folhaCarrinho = null;
  function renderCarrinho() {
    const lat = $('#carrinho-lateral');
    if (lat) { lat.innerHTML = carrinhoHTML(); ligarCarrinho(lat); }
    const barra = $('#barra-carrinho');
    if (barra) {
      const n = pecasCarrinho();
      barra.classList.toggle('hidden', !n);
      barra.innerHTML = `<div class="grow"><div class="small" style="opacity:.75">${plural(n, 'peça', 'peças')} no carrinho</div><div style="font-weight:800;font-size:18px" class="num">${money(totalCarrinho())}</div></div><span class="btn prim">Finalizar</span>`;
      barra.onclick = abrirCarrinhoMobile;
    }
    if (folhaCarrinho) {
      if (!S.carrinho.length) { folhaCarrinho.fechar(); folhaCarrinho = null; } else {
        const alvo = $('#carrinho-folha', folhaCarrinho.folha);
        if (alvo) { alvo.innerHTML = carrinhoHTML(); }
      }
    }
  }

  function abrirCarrinhoMobile() {
    folhaCarrinho = abrirFolha(`<div class="row between" style="margin-bottom:4px"><span></span><button class="icon-btn" type="button" data-fechar aria-label="Fechar">${ic.x}</button></div><div id="carrinho-folha">${carrinhoHTML()}</div>`, {
      aoAbrir: (f) => ligarCarrinho($('#carrinho-folha', f)),
      aoFechar: () => { folhaCarrinho = null; }
    });
  }

  function editarPrecoItem(n) {
    const i = S.carrinho[n];
    if (!i) return;
    abrirFolha(`${cabFolha('Preço desta peça', esc(i.nome + ' · ' + rotuloVar(i)))}
      <form class="form" id="f-preco"><label class="campo"><span>Preço unitário</span><div class="prefix"><b>R$</b><input class="input grande" name="preco" inputmode="decimal" value="${moneyInput(i.preco)}" autofocus></div>
      <span class="ajuda">Para desconto na venda toda, use o campo de desconto no pagamento.</span></label>
      <button class="btn prim bloco grande" type="submit">Salvar</button></form>`, {
      aoAbrir: (f, fechar) => {
        $('#f-preco', f).addEventListener('submit', (e) => {
          e.preventDefault();
          i.preco = parseMoney(e.target.preco.value);
          salvarCarrinho();
          fechar();
          renderCarrinho();
        });
      }
    });
  }

  function abrirPagamento() {
    if (!S.carrinho.length) return;
    if (folhaCarrinho) { folhaCarrinho.fechar(); folhaCarrinho = null; }
    const hojeIso = isoData(new Date());
    const st = { descModo: 'R$', descValor: 0, cliente: null, forma: '', parcelas: 1, recebido: 0, obs: '', canal: LS.get('canal.' + S.loja.id, 'Loja física'), data: hojeIso, vendedor: null };
    const sub = totalCarrinho();
    const desconto = () => Math.min(sub, Math.max(0, st.descModo === '%' ? Math.round(sub * st.descValor) / 100 : st.descValor));
    const total = () => Math.max(0, sub - desconto());

    const { folha, fechar } = abrirFolha(`${cabFolha('Pagamento', `${plural(pecasCarrinho(), 'peça', 'peças')} · ${brl(sub)}`)}
      <div class="form" id="pag">
        <div class="campo"><span>Onde foi a venda</span><div class="pagamentos">${CANAIS.map(([c, i]) => `<button class="pag" type="button" data-canal="${c}">${i}${c}</button>`).join('')}</div></div>
        <label class="campo"><span>Data da venda</span><input class="input" type="date" id="data-venda" value="${hojeIso}" max="${hojeIso}" min="${isoData(addDias(new Date(), -365))}">
          <span class="ajuda" id="data-info">Hoje</span></label>
        <div class="campo hidden" id="campo-vendedor"><span>Vendedor</span><div class="chips" id="pag-vendedores"></div></div>
        <div class="campo"><span>Cliente</span><div id="pag-cliente"></div></div>
        <div class="campo"><span>Desconto</span><div class="row"><div class="seg" id="desc-modo"><button type="button" data-m="R$" class="ativo">R$</button><button type="button" data-m="%">%</button></div>
          <input class="input grow" id="desc-valor" inputmode="decimal" placeholder="0"></div><span class="ajuda" id="desc-info"></span></div>
        <div class="campo"><span>Forma de pagamento</span><div class="pagamentos">${FORMAS.map(([f, i]) => `<button class="pag" type="button" data-forma="${f}">${i}${f}</button>`).join('')}</div></div>
        <div class="campo hidden" id="campo-parcelas"><span>Parcelas</span><select class="input" id="parcelas">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}x</option>`).join('')}</select></div>
        <div class="campo hidden" id="campo-troco"><span>Valor recebido (para calcular o troco)</span><div class="prefix"><b>R$</b><input class="input" id="recebido" inputmode="decimal"></div><span class="ajuda" id="troco"></span></div>
        <button class="link-btn small" type="button" id="add-obs" style="justify-self:start">+ Adicionar observação</button>
        <label class="campo hidden" id="campo-obs"><span>Observação</span><input class="input" id="obs" maxlength="200" placeholder="Ex.: troca até sábado"></label>
        <div class="card flat" style="background:var(--surface-2);border:0">
          <div class="total-linha"><span class="muted">Subtotal</span><span>${money(sub)}</span></div>
          <div class="total-linha"><span class="muted">Desconto</span><span id="tot-desc">${money(0)}</span></div>
          <div class="total-linha grande"><span>Total</span><span id="tot-total">${money(sub)}</span></div>
        </div>
        <p class="erro-msg hidden" id="pag-erro"></p>
        <button class="btn prim bloco grande" type="button" id="confirmar-venda">Confirmar venda</button>
      </div>`);

    const atualizar = () => {
      const d = desconto();
      $('#tot-desc', folha).innerHTML = d ? `− ${money(d)}` : money(0);
      $('#tot-total', folha).innerHTML = money(total());
      $('#desc-info', folha).textContent = d ? `${pct(d / sub, 1)} de desconto (${brl(d)})` : '';
      const conf = $('#confirmar-venda', folha);
      conf.innerHTML = `Confirmar venda · <span class="money">${brl(total())}</span>`;
      $$('[data-forma]', folha).forEach((b) => b.classList.toggle('ativo', b.dataset.forma === st.forma));
      $$('[data-canal]', folha).forEach((b) => b.classList.toggle('ativo', b.dataset.canal === st.canal));
      $('#data-info', folha).textContent = st.data === hojeIso ? 'Hoje' : `Venda de ${cap(fmtDiaLongo(dataLocal(st.data)))} (lançada depois)`;
      $('#campo-parcelas', folha).classList.toggle('hidden', st.forma !== 'Crédito');
      $('#campo-troco', folha).classList.toggle('hidden', st.forma !== 'Dinheiro');
      const parc = $('#parcelas', folha);
      Array.from(parc.options).forEach((o, i) => { o.textContent = `${i + 1}x de ${brl(total() / (i + 1))}`; });
      const troco = st.recebido - total();
      $('#troco', folha).innerHTML = st.recebido ? (troco >= 0 ? `Troco: <b>${brl(troco)}</b>` : `Faltam ${brl(-troco)}`) : '';
    };
    const desenharCliente = () => {
      const box = $('#pag-cliente', folha);
      if (st.cliente) {
        box.innerHTML = `<div class="item" style="padding:8px 0;cursor:default"><div class="avatar">${esc(iniciais(st.cliente.nome))}</div><div class="grow"><div class="tit">${esc(st.cliente.nome)}</div><div class="sub">${esc(fmtTel(st.cliente.telefone) || 'sem telefone')}</div></div><button class="btn peq" type="button" id="cli-trocar">Trocar</button></div>`;
      } else {
        box.innerHTML = `<button class="btn bloco" type="button" id="cli-trocar">${ic.users}Adicionar cliente</button><span class="ajuda" style="display:block;margin-top:6px">Venda com cliente cadastrado vira cliente que volta.</span>`;
      }
      $('#cli-trocar', folha).addEventListener('click', () => escolherCliente((c) => { st.cliente = c; desenharCliente(); }));
    };
    desenharCliente();
    (soVendedor() ? Promise.resolve([]) : carregarVendedores()).then((vs) => {
      const ativos = (vs || []).filter((x) => x.ativo);
      if (!ativos.length || !$('#pag-vendedores', folha)) return;
      const ultimo = LS.get('vendedor.' + S.loja.id, null);
      st.vendedor = ativos.some((x) => x.id === ultimo) ? ultimo : null;
      const desenhar = () => {
        $('#pag-vendedores', folha).innerHTML = [{ id: null, nome: 'Sem vendedor' }, ...ativos].map((x) => `<button class="chip ${x.id === st.vendedor ? 'ativo' : ''}" type="button" data-vend="${x.id || ''}">${esc(x.nome)}${x.comissao_pct ? ` <span class="x">${n1(x.comissao_pct)}%</span>` : ''}</button>`).join('');
      };
      desenhar();
      $('#campo-vendedor', folha).classList.remove('hidden');
      $('#pag-vendedores', folha).addEventListener('click', (e) => {
        const b = e.target.closest('[data-vend]');
        if (!b) return;
        st.vendedor = b.dataset.vend || null;
        LS.set('vendedor.' + S.loja.id, st.vendedor);
        desenhar();
      });
    }).catch(() => {});
    $('#desc-modo', folha).addEventListener('click', (e) => {
      const b = e.target.closest('[data-m]');
      if (!b) return;
      st.descModo = b.dataset.m;
      $$('#desc-modo button', folha).forEach((x) => x.classList.toggle('ativo', x === b));
      st.descValor = parseMoney($('#desc-valor', folha).value);
      atualizar();
    });
    $('#desc-valor', folha).addEventListener('input', (e) => { st.descValor = parseMoney(e.target.value); atualizar(); });
    $$('[data-forma]', folha).forEach((b) => b.addEventListener('click', () => { st.forma = b.dataset.forma; $('#pag-erro', folha).classList.add('hidden'); atualizar(); }));
    $$('[data-canal]', folha).forEach((b) => b.addEventListener('click', () => { st.canal = b.dataset.canal; LS.set('canal.' + S.loja.id, st.canal); atualizar(); }));
    $('#data-venda', folha).addEventListener('change', (e) => { const v = e.target.value; st.data = v && v <= hojeIso ? v : hojeIso; if (v !== st.data) e.target.value = st.data; atualizar(); });
    $('#parcelas', folha).addEventListener('change', (e) => { st.parcelas = +e.target.value; });
    $('#recebido', folha).addEventListener('input', (e) => { st.recebido = parseMoney(e.target.value); atualizar(); });
    $('#add-obs', folha).addEventListener('click', (e) => { e.target.classList.add('hidden'); $('#campo-obs', folha).classList.remove('hidden'); $('#obs', folha).focus(); });
    atualizar();

    $('#confirmar-venda', folha).addEventListener('click', async (e) => {
      const erro = $('#pag-erro', folha);
      if (!st.forma) { erro.textContent = 'Escolha a forma de pagamento.'; erro.classList.remove('hidden'); return; }
      const itens = S.carrinho.map((i) => ({ variacao_id: i.variacao_id, quantidade: i.qtd, preco_unit: i.preco }));
      const carrinhoAntes = S.carrinho.slice();
      await ocupado(e.currentTarget, async () => {
        try {
          const r = await run(sb.rpc('registrar_venda', {
            p_loja: S.loja.id, p_itens: itens, p_forma: st.forma, p_desconto: desconto(),
            p_parcelas: st.forma === 'Crédito' ? st.parcelas : 1, p_cliente: st.cliente ? st.cliente.id : null,
            p_obs: ($('#obs', folha).value || '').trim() || null,
            p_data: st.data === hojeIso ? null : (() => { const d = dataLocal(st.data); d.setHours(12, 0, 0, 0); return d.toISOString(); })(),
            p_canal: st.canal,
            p_vendedor: st.vendedor
          }));
          chamarPush('POST', { venda_id: r.id }).catch(() => {});
          S.carrinho = [];
          salvarCarrinho();
          S.produtos = null;
          S.resumoClientes = null;
          S.clientes = null;
          fechar();
          if (location.hash === '#/vender') rotear();
          vendaConcluida(r, carrinhoAntes, { sub, desconto: desconto(), forma: st.forma, parcelas: st.parcelas, cliente: st.cliente, canal: st.canal, data: st.data === hojeIso ? null : st.data });
        } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
      });
    });
  }

  function textoComprovante(numero, data, itens, t) {
    const linhas = itens.map((i) => `${i.qtd}x ${i.nome} (${rotuloVar(i)}) — ${brl(i.preco * i.qtd)}`);
    return [`*${S.loja.nome}*`, `Comprovante da venda nº ${numero} · ${fmtData(data)} ${fmtHora(data)}`, '', ...linhas, '',
      t.desconto ? `Subtotal: ${brl(t.sub)}\nDesconto: − ${brl(t.desconto)}` : null,
      `*Total: ${brl(t.sub - t.desconto)}*`, `Pagamento: ${t.forma}${t.forma === 'Crédito' && t.parcelas > 1 ? ` em ${t.parcelas}x` : ''}`, '', 'Obrigado pela compra!']
      .filter((x) => x !== null).join('\n');
  }

  function vendaConcluida(r, itens, t) {
    const agora = t.data ? (() => { const d = dataLocal(t.data); d.setHours(12); return d.toISOString(); })() : new Date().toISOString();
    const link = t.cliente && t.cliente.telefone ? waLink(t.cliente.telefone, textoComprovante(r.numero, agora, itens, t)) : null;
    abrirFolha(`<div style="text-align:center;padding:10px 0 4px">
        <div style="width:64px;height:64px;border-radius:22px;background:var(--accent-soft);color:var(--accent-2);display:grid;place-items:center;margin:0 auto 14px">${ic.check.replace('<svg', '<svg style="width:34px;height:34px"')}</div>
        <h2>Venda nº ${r.numero} registrada</h2>
        <div class="meta-num" style="margin:8px 0 2px">${money(r.total)}</div>
        <p class="muted small">${esc(t.canal)} · ${esc(t.forma)}${t.cliente ? ' · ' + esc(t.cliente.nome) : ' · sem cliente cadastrado'}</p>
        ${t.data ? `<p class="small" style="margin-top:4px"><span class="badge info">Venda de ${fmtDataCurta(dataLocal(t.data))}</span></p>` : ''}</div>
      <div class="stack" style="margin-top:18px">
        ${link ? `<a class="btn bloco" href="${link}" target="_blank" rel="noopener">${ic.chat}Mandar comprovante no WhatsApp</a>` : ''}
        <button class="btn prim bloco grande" type="button" data-fechar>Nova venda</button>
        <a class="btn bloco" href="#/vendas" id="ver-vendas">${soVendedor() ? 'Ver minhas vendas' : 'Ver vendas de hoje'}</a></div>`, {
      aoAbrir: (f, fechar) => { $('#ver-vendas', f).addEventListener('click', fechar); }
    });
  }

  function escolherCliente(aoEscolher) {
    abrirFolha(`${cabFolha('Escolher cliente')}
      <div class="busca" style="margin-bottom:10px">${ic.search}<input class="input" id="busca-cli" type="search" placeholder="Nome ou telefone" autocomplete="off" autofocus></div>
      <button class="btn bloco" type="button" id="novo-cli" style="margin-bottom:6px">${ic.plus}Cadastrar cliente novo</button>
      <div class="lista" id="lista-cli">${carregandoHTML()}</div>`, {
      aoAbrir: async (f, fechar) => {
        $('#novo-cli', f).addEventListener('click', () => { fechar(); formCliente(null, (c) => aoEscolher(c)); });
        let clientes;
        try { clientes = await carregarClientes(); } catch (e) { $('#lista-cli', f).innerHTML = erroHTML(e); return; }
        const desenhar = () => {
          const t = $('#busca-cli', f).value.trim().toLowerCase();
          const d = soDigitos(t);
          const lista = clientes.filter((c) => !t || c.nome.toLowerCase().includes(t) || (d && soDigitos(c.telefone).includes(d))).slice(0, 40);
          $('#lista-cli', f).innerHTML = lista.length ? lista.map((c) => `<button class="item" type="button" data-cli="${c.id}"><div class="avatar">${esc(iniciais(c.nome))}</div>
            <div class="grow"><div class="tit">${esc(c.nome)}</div><div class="sub">${esc(fmtTel(c.telefone) || 'sem telefone')}${c.compras ? ' · ' + plural(c.compras, 'compra', 'compras') : ''}</div></div></button>`).join('')
            : `<p class="muted small" style="padding:14px 4px">${clientes.length ? 'Nenhum cliente encontrado.' : 'Nenhum cliente cadastrado ainda.'}</p>`;
        };
        $('#busca-cli', f).addEventListener('input', desenhar);
        $('#lista-cli', f).addEventListener('click', (e) => {
          const b = e.target.closest('[data-cli]');
          if (!b) return;
          fechar();
          aoEscolher(clientes.find((c) => c.id === b.dataset.cli));
        });
        desenhar();
      }
    });
  }

  // ------------------------------------------------------------------
  // VENDAS (histórico)
  // ------------------------------------------------------------------
  TELAS.vendas = async function (v, arg, token) {
    const periodo = ['hoje', '7d', 'mes', 'passado'].includes(arg) ? arg : 'hoje';
    const agora = new Date();
    const faixas = {
      hoje: [inicioDia(agora), addDias(inicioDia(agora), 1), 'Hoje'],
      '7d': [addDias(inicioDia(agora), -6), addDias(inicioDia(agora), 1), '7 dias'],
      mes: [inicioMes(agora), inicioMes(agora, 1), 'Este mês'],
      passado: [inicioMes(agora, -1), inicioMes(agora), 'Mês passado']
    };
    const [de, ate] = faixas[periodo];
    v.innerHTML = `<div class="page-head"><div><h1>${soVendedor() ? 'Minhas vendas' : 'Vendas'}</h1><p class="sub">Toque numa venda para ver os detalhes</p></div><a class="btn prim" href="#/vender">${ic.plus}Vender</a></div>
      <div class="seg" style="margin-bottom:14px">${Object.entries(faixas).map(([k, f]) => `<button type="button" data-per="${k}" class="${k === periodo ? 'ativo' : ''}">${f[2]}</button>`).join('')}</div>
      <div id="vendas-conteudo">${carregandoHTML()}</div>`;
    $$('[data-per]', v).forEach((b) => b.addEventListener('click', () => { location.hash = '#/vendas/' + b.dataset.per; }));

    const vendas = await run(sb.from('vendas')
      .select('id, numero, data, canal, cliente_id, vendedor_nome, vendedor_cad_id, comissao, subtotal, desconto, total, pecas, forma_pagamento, parcelas, status, observacao, clientes(nome, telefone)')
      .eq('loja_id', S.loja.id).gte('data', de.toISOString()).lt('data', ate.toISOString())
      .order('data', { ascending: false }));
    if (!vivo(token)) return;
    const box = $('#vendas-conteudo');
    const ok = vendas.filter((x) => x.status === 'concluida');
    const fat = ok.reduce((s, x) => s + Number(x.total), 0);
    const pecas = ok.reduce((s, x) => s + x.pecas, 0);
    const canceladas = vendas.length - ok.length;
    let html = `<div class="grid k4" style="margin-bottom:14px">
      <div class="card kpi destaque"><div class="rotulo">Faturamento</div><div class="valor">${money(fat)}</div><div class="det">${plural(ok.length, 'venda', 'vendas')}</div></div>
      <div class="card kpi"><div class="rotulo">Ticket médio</div><div class="valor">${money(ok.length ? fat / ok.length : 0)}</div></div>
      <div class="card kpi"><div class="rotulo">Peças</div><div class="valor">${pecas}</div><div class="det">${ok.length ? n1(pecas / ok.length) + ' por venda' : '–'}</div></div>
      ${soVendedor() ? `<div class="card kpi destaque"><div class="rotulo">Sua comissão</div><div class="valor">${money(ok.reduce((t, x) => t + Number(x.comissao || 0), 0))}</div><div class="det">${faixas[periodo][2].toLowerCase()}</div></div>`
        : `<div class="card kpi"><div class="rotulo">Canceladas</div><div class="valor">${canceladas}</div></div>`}</div>`;
    if (!vendas.length) {
      html += vazioHTML(ic.receipt, 'Nenhuma venda nesse período', 'As vendas registradas no caixa aparecem aqui.', '#/vender', 'Fazer uma venda');
    } else {
      const grupos = {};
      vendas.forEach((x) => { const k = isoData(new Date(x.data)); (grupos[k] = grupos[k] || []).push(x); });
      html += '<div class="card" style="padding:4px 14px">';
      Object.keys(grupos).sort().reverse().forEach((k) => {
        const lista = grupos[k];
        const tot = lista.filter((x) => x.status === 'concluida').reduce((s, x) => s + Number(x.total), 0);
        html += `<div class="dia-cab"><span>${cap(fmtDiaLongo(dataLocal(k)))}</span><span class="num">${money(tot)}</span></div><div class="lista">`;
        html += lista.map((x) => `<button class="item" type="button" data-venda="${x.id}">
            <div class="avatar ${x.status === 'cancelada' ? 'cinza' : ''}" style="font-size:12px">nº${x.numero}</div>
            <div class="grow" style="min-width:0"><div class="tit ellipsis">${x.clientes ? esc(x.clientes.nome) : '<span class="muted">Sem cliente cadastrado</span>'}</div>
              <div class="sub">${fmtHora(x.data)} · ${esc(x.canal || 'Loja física')} · ${esc(x.forma_pagamento)}${x.parcelas > 1 ? ` ${x.parcelas}x` : ''} · ${plural(x.pecas, 'peça', 'peças')}${x.vendedor_nome ? ' · ' + esc(x.vendedor_nome) : ''}</div></div>
            <div class="right">${x.status === 'cancelada' ? '<span class="badge danger">Cancelada</span>' : `<b class="num">${money(x.total)}</b>`}${Number(x.desconto) > 0 && x.status !== 'cancelada' ? `<div class="tiny faint">−${brl(x.desconto)}</div>` : ''}${soVendedor() && Number(x.comissao) > 0 && x.status !== 'cancelada' ? `<div class="tiny up">comissão ${brl(x.comissao)}</div>` : ''}</div></button>`).join('');
        html += '</div>';
      });
      html += '</div>';
    }
    box.innerHTML = html;
    box.addEventListener('click', (e) => {
      const b = e.target.closest('[data-venda]');
      if (b) detalheVenda(vendas.find((x) => x.id === b.dataset.venda));
    });
  };

  function formEditarVenda(venda, fecharDetalhe) {
    const hojeIso = isoData(new Date());
    const dataOrig = isoData(new Date(venda.data));
    const st = { canal: venda.canal || 'Loja física', forma: venda.forma_pagamento, parcelas: venda.parcelas || 1, cliente: venda.cliente_id ? { id: venda.cliente_id, nome: venda.clientes ? venda.clientes.nome : 'Cliente' } : null,
      desc: Number(venda.desconto) || 0, vendedor: venda.vendedor_cad_id || null, mudouVend: false, data: dataOrig };
    const sub = Number(venda.subtotal);
    const { folha, fechar } = abrirFolha(`${cabFolha(`Editar venda nº ${venda.numero}`, 'As peças não mudam aqui. Pra trocar peça, cancele a venda e lance de novo.')}
      <div class="form">
        <div class="campo"><span>Onde foi a venda</span><div class="pagamentos">${CANAIS.map(([c, i]) => `<button class="pag" type="button" data-canal="${c}">${i}${c}</button>`).join('')}</div></div>
        <label class="campo"><span>Data da venda</span><input class="input" type="date" id="ed-data" value="${dataOrig}" max="${hojeIso}" min="${isoData(addDias(new Date(), -365))}"></label>
        <div class="campo hidden" id="ed-campo-vend"><span>Vendedor</span><div class="chips" id="ed-vendedores"></div></div>
        <div class="campo"><span>Cliente</span><div id="ed-cliente"></div></div>
        <div class="campo"><span>Desconto (R$)</span><div class="prefix"><b>R$</b><input class="input" id="ed-desc" inputmode="decimal" value="${st.desc ? String(st.desc).replace('.', ',') : ''}" placeholder="0"></div><span class="ajuda" id="ed-info"></span></div>
        <div class="campo"><span>Forma de pagamento</span><div class="pagamentos">${FORMAS.map(([f, i]) => `<button class="pag" type="button" data-forma="${f}">${i}${f}</button>`).join('')}</div></div>
        <div class="campo hidden" id="ed-campo-parc"><span>Parcelas</span><select class="input" id="ed-parc">${Array.from({ length: 12 }, (_, i) => `<option value="${i + 1}">${i + 1}x</option>`).join('')}</select></div>
        <label class="campo"><span>Observação</span><input class="input" id="ed-obs" maxlength="200" value="${esc(venda.observacao || '')}" placeholder="Ex.: troca até sábado"></label>
        <div class="card flat" style="background:var(--surface-2);border:0"><div class="total-linha grande"><span>Total</span><span id="ed-total">${money(sub)}</span></div></div>
        <p class="erro-msg hidden" id="ed-erro"></p>
        <button class="btn prim bloco grande" type="button" id="ed-salvar">Salvar alterações</button>
      </div>`);
    const total = () => Math.max(0, sub - Math.min(sub, st.desc));
    const desenhar = () => {
      $$('[data-canal]', folha).forEach((b) => b.classList.toggle('ativo', b.dataset.canal === st.canal));
      $$('[data-forma]', folha).forEach((b) => b.classList.toggle('ativo', b.dataset.forma === st.forma));
      $('#ed-campo-parc', folha).classList.toggle('hidden', st.forma !== 'Crédito');
      $('#ed-parc', folha).value = String(st.parcelas);
      $('#ed-total', folha).innerHTML = money(total());
      $('#ed-info', folha).textContent = st.desc > sub ? 'O desconto não pode ser maior que a venda.' : '';
      $('#ed-cliente', folha).innerHTML = `<button class="btn bloco" type="button" id="ed-cli">${ic.users}${st.cliente ? esc(st.cliente.nome) + ' (trocar)' : 'Sem cliente cadastrado (escolher)'}</button>${st.cliente ? '<button class="link-btn small" type="button" id="ed-cli-x" style="margin-top:6px">Tirar cliente</button>' : ''}`;
      $('#ed-cli', folha).addEventListener('click', () => escolherCliente((c) => { st.cliente = c; desenhar(); }));
      const x = $('#ed-cli-x', folha); if (x) x.addEventListener('click', () => { st.cliente = null; desenhar(); });
    };
    $$('[data-canal]', folha).forEach((b) => b.addEventListener('click', () => { st.canal = b.dataset.canal; desenhar(); }));
    $$('[data-forma]', folha).forEach((b) => b.addEventListener('click', () => { st.forma = b.dataset.forma; desenhar(); }));
    $('#ed-parc', folha).addEventListener('change', (e) => { st.parcelas = Number(e.target.value) || 1; });
    $('#ed-data', folha).addEventListener('change', (e) => { const v = e.target.value; st.data = v && v <= hojeIso ? v : dataOrig; if (v !== st.data) e.target.value = st.data; });
    $('#ed-desc', folha).addEventListener('input', (e) => { st.desc = parseMoney(e.target.value); desenhar(); });
    desenhar();
    carregarVendedores().then((vs) => {
      const ativos = vs.filter((x) => x.ativo || x.id === st.vendedor);
      if (!ativos.length || !$('#ed-vendedores', folha)) return;
      $('#ed-campo-vend', folha).classList.remove('hidden');
      const pintar = () => {
        $('#ed-vendedores', folha).innerHTML = [{ id: null, nome: 'Sem vendedor' }, ...ativos].map((x) => `<button class="chip ${x.id === st.vendedor ? 'ativo' : ''}" type="button" data-vend="${x.id || ''}">${esc(x.nome)}${x.comissao_pct ? ` <span class="x">${n1(x.comissao_pct)}%</span>` : ''}</button>`).join('');
      };
      pintar();
      $('#ed-vendedores', folha).addEventListener('click', (e) => {
        const b = e.target.closest('[data-vend]'); if (!b) return;
        st.vendedor = b.dataset.vend || null; st.mudouVend = true; pintar();
      });
    }).catch(() => {});
    $('#ed-salvar', folha).addEventListener('click', async (e) => {
      const erro = $('#ed-erro', folha);
      if (st.desc > sub) { erro.textContent = 'O desconto não pode ser maior que a venda.'; erro.classList.remove('hidden'); return; }
      await ocupado(e.currentTarget, async () => {
        try {
          await run(sb.rpc('editar_venda', {
            p_venda: venda.id,
            p_data: st.data === dataOrig ? null : (() => { const d = dataLocal(st.data); d.setHours(12, 0, 0, 0); return d.toISOString(); })(),
            p_canal: st.canal, p_forma: st.forma, p_parcelas: st.forma === 'Crédito' ? st.parcelas : 1,
            p_cliente: st.cliente ? st.cliente.id : null, p_desconto: Math.min(st.desc, sub),
            p_obs: ($('#ed-obs', folha).value || '').trim() || null,
            p_mudar_vendedor: st.mudouVend, p_vendedor: st.vendedor
          }));
          S.clientes = null; S.resumoClientes = null;
          fechar(); fecharDetalhe();
          toast('Venda atualizada.');
          rotear();
        } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
      });
    });
  }

  async function detalheVenda(venda) {
    const { folha, fechar } = abrirFolha(`${cabFolha(`Venda nº ${venda.numero}`, `${cap(fmtDiaLongo(new Date(venda.data)))} às ${fmtHora(venda.data)}${venda.vendedor_nome ? ' · ' + esc(venda.vendedor_nome) : ''}`)}<div id="det-venda">${carregandoHTML()}</div>`);
    let itens;
    try { itens = await run(sb.from('venda_itens').select('descricao, quantidade, preco_unit, total').eq('venda_id', venda.id)); } catch (e) { $('#det-venda', folha).innerHTML = erroHTML(e); return; }
    const box = $('#det-venda', folha);
    if (!box) return;
    const itensC = itens.map((i) => { const [nome, ...resto] = i.descricao.split(' · '); return { nome, tamanho: resto[0] || '', cor: resto[1] || '', qtd: i.quantidade, preco: Number(i.preco_unit) }; });
    const link = venda.clientes && venda.clientes.telefone && venda.status === 'concluida'
      ? waLink(venda.clientes.telefone, textoComprovante(venda.numero, venda.data, itensC, { sub: Number(venda.subtotal), desconto: Number(venda.desconto), forma: venda.forma_pagamento, parcelas: venda.parcelas }))
      : null;
    box.innerHTML = `${venda.status === 'cancelada' ? '<p class="badge danger" style="margin-bottom:10px">Venda cancelada</p>' : ''}
      <div class="lista">${itens.map((i) => `<div class="item" style="cursor:default"><div class="grow"><div class="tit">${esc(i.descricao)}</div><div class="sub">${i.quantidade} × ${brl(i.preco_unit)}</div></div><b class="num">${money(i.total)}</b></div>`).join('')}</div>
      <div class="card flat" style="background:var(--surface-2);border:0;margin-top:10px">
        <div class="total-linha"><span class="muted">Subtotal</span><span>${money(venda.subtotal)}</span></div>
        ${Number(venda.desconto) ? `<div class="total-linha"><span class="muted">Desconto</span><span>− ${money(venda.desconto)}</span></div>` : ''}
        <div class="total-linha grande"><span>Total</span><span>${money(venda.total)}</span></div>
        <div class="small muted" style="margin-top:6px">${esc(venda.canal || 'Loja física')} · ${esc(venda.forma_pagamento)}${venda.parcelas > 1 ? ` em ${venda.parcelas}x` : ''}${venda.clientes ? ' · ' + esc(venda.clientes.nome) : ''}</div>
        ${venda.observacao ? `<div class="small" style="margin-top:6px">${esc(venda.observacao)}</div>` : ''}
      </div>
      <div class="stack" style="margin-top:14px">
        ${link ? `<a class="btn bloco" href="${link}" target="_blank" rel="noopener">${ic.chat}Mandar comprovante no WhatsApp</a>` : ''}
        ${venda.cliente_id && gerente() ? `<a class="btn bloco" href="#/cliente/${venda.cliente_id}" id="ver-cli">${ic.users}Ver cliente</a>` : ''}
        ${gerente() && venda.status === 'concluida' ? `<button class="btn bloco" type="button" id="editar-venda">${ic.edit || ic.dots}Editar venda</button>` : ''}
        ${dono() && venda.status === 'concluida' ? `<button class="btn bloco" type="button" id="trocar-vend">${ic.users}${venda.vendedor_cad_id ? `Vendedor: ${esc(venda.vendedor_nome)} · comissão ${brl(venda.comissao)} (trocar)` : 'Definir vendedor (comissão)'}</button>` : ''}
        ${dono() && venda.status === 'concluida' ? `<button class="btn perigo bloco" type="button" id="cancelar-venda">${ic.x}Cancelar venda</button>` : ''}
      </div>`;
    const verCli = $('#ver-cli', box);
    if (verCli) verCli.addEventListener('click', fechar);
    const ev = $('#editar-venda', box);
    if (ev) ev.addEventListener('click', () => formEditarVenda(venda, fechar));
    const tv = $('#trocar-vend', box);
    if (tv) tv.addEventListener('click', async () => {
      let vs;
      try { vs = (await carregarVendedores()).filter((x) => x.ativo || x.id === venda.vendedor_cad_id); } catch (e) { toast(msgErro(e), 'erro'); return; }
      if (!vs.length) { toast('Cadastre os vendedores em Loja e equipe.', 'erro'); return; }
      abrirFolha(`${cabFolha('Vendedor desta venda', `Venda nº ${venda.numero} · ${brl(venda.total)}`)}
        <div class="lista">${[{ id: null, nome: 'Sem vendedor', comissao_pct: 0 }, ...vs].map((x) => `<button class="item" type="button" data-v="${x.id || ''}">
          <div class="avatar cinza">${esc(iniciais(x.nome))}</div><div class="grow"><div class="tit">${esc(x.nome)}</div>
          <div class="sub">${x.id ? `${n1(x.comissao_pct)}% · comissão ${brl(Math.round(venda.total * x.comissao_pct) / 100)}` : 'sem comissão'}</div></div>
          ${(x.id || null) === (venda.vendedor_cad_id || null) ? '<span class="badge ok">Atual</span>' : ''}</button>`).join('')}</div>`, {
        aoAbrir: (f2, fechar2) => {
          $$('[data-v]', f2).forEach((b) => b.addEventListener('click', async () => {
            try {
              await run(sb.rpc('definir_vendedor_venda', { p_venda: venda.id, p_vendedor: b.dataset.v || null }));
              fechar2(); fechar();
              toast('Vendedor atualizado.');
              rotear();
            } catch (err) { toast(msgErro(err), 'erro'); }
          }));
        }
      });
    });
    const canc = $('#cancelar-venda', box);
    if (canc) canc.addEventListener('click', async () => {
      const motivo = await pedirTexto('Cancelar a venda?', 'As peças voltam para o estoque. Escreva o motivo (opcional).', 'Ex.: cliente desistiu', 'Cancelar venda', true);
      if (motivo === null) return;
      try {
        await run(sb.rpc('cancelar_venda', { p_venda: venda.id, p_motivo: motivo || null }));
        S.produtos = null; S.clientes = null; S.resumoClientes = null;
        fechar();
        toast('Venda cancelada. Peças de volta ao estoque.');
        rotear();
      } catch (e) { toast(msgErro(e), 'erro'); }
    });
  }

  function pedirTexto(titulo, detalhe, placeholder, ok, perigo) {
    return new Promise((resolve) => {
      let valor = null;
      abrirFolha(`${cabFolha(titulo)}<p class="muted" style="margin-bottom:12px">${detalhe}</p>
        <form class="form" id="f-texto"><input class="input" name="t" placeholder="${esc(placeholder)}" maxlength="200" autofocus>
        <div class="grid c2" style="grid-template-columns:1fr 1fr"><button class="btn" type="button" data-fechar>Voltar</button><button class="btn ${perigo ? 'perigo cheio' : 'prim'}" type="submit">${ok}</button></div></form>`, {
        aoAbrir: (f, fechar) => { $('#f-texto', f).addEventListener('submit', (e) => { e.preventDefault(); valor = e.target.t.value.trim(); fechar(); }); },
        aoFechar: () => resolve(valor)
      });
    });
  }

  // ------------------------------------------------------------------
  // PRODUTOS
  // ------------------------------------------------------------------
  TELAS.produtos = async function (v, arg, token) {
    let filtro = ['baixo', 'zerado', 'arquivados'].includes(arg) ? arg : 'todos';
    v.innerHTML = `<div class="page-head"><div><h1>Produtos</h1><p class="sub" id="prod-resumo">Carregando…</p></div><a class="btn prim" href="#/produto/novo">${ic.plus}Novo</a></div>
      <div class="busca">${ic.search}<input class="input" id="busca-prod" type="search" placeholder="Buscar produto" autocomplete="off"></div>
      <div class="chips rolar" id="filtros-prod" style="margin:12px 0">
        ${[['todos', 'Todos'], ['baixo', 'Estoque baixo'], ['zerado', 'Zerados'], ['arquivados', 'Arquivados']].map(([k, t]) => `<button class="chip ${k === filtro ? 'ativo' : ''}" type="button" data-f="${k}">${t}</button>`).join('')}
      </div>
      <div class="card" style="padding:4px 14px" id="lista-prod">${carregandoHTML()}</div>`;
    const produtos = await carregarProdutos(true);
    if (!vivo(token)) return;
    const ativos = produtos.filter((p) => p.ativo);
    const pecas = ativos.reduce((s, p) => s + p.estoque, 0);
    const valor = ativos.reduce((s, p) => s + p.estoque * p.preco, 0);
    $('#prod-resumo').innerHTML = `${plural(ativos.length, 'produto', 'produtos')} · ${plural(pecas, 'peça', 'peças')} · ${money(valor)} em estoque`;
    const busca = $('#busca-prod');
    const lista = $('#lista-prod');
    function desenhar() {
      const t = busca.value.trim().toLowerCase();
      let ls = filtro === 'arquivados' ? produtos.filter((p) => !p.ativo) : ativos;
      if (filtro === 'baixo') ls = ls.filter((p) => p.baixo);
      if (filtro === 'zerado') ls = ls.filter((p) => p.zerado);
      if (t) ls = ls.filter((p) => p.nome.toLowerCase().includes(t) || (p.categoria || '').toLowerCase().includes(t) || (p.marca || '').toLowerCase().includes(t) || p.variacoes.some((x) => (x.codigo || '').toLowerCase() === t));
      if (!produtos.length) {
        lista.style.padding = '0'; lista.style.border = '0';
        lista.innerHTML = vazioHTML(ic.shirt, 'Cadastre seu primeiro produto', 'Nome, preço, tamanhos, cores e quantas peças você tem de cada.', '#/produto/novo', 'Cadastrar produto');
        return;
      }
      lista.innerHTML = ls.length ? `<div class="lista">${ls.map((p) => `<a class="item" href="#/produto/${p.id}">
          <div class="avatar ${p.estoque ? '' : 'cinza'}">${esc(iniciais(p.nome))}</div>
          <div class="grow" style="min-width:0"><div class="tit ellipsis">${esc(p.nome)}</div>
            <div class="sub">${p.categoria ? esc(p.categoria) + ' · ' : ''}${money(p.preco)}</div>
            <div class="tamanhos">${p.variacoes.map((x) => `<span class="tam ${x.estoque <= 0 ? 'zero' : x.estoque <= x.estoque_minimo ? 'baixo' : ''}">${esc(rotuloVar(x))} ${x.estoque}</span>`).join('')}</div></div>
          <div class="right"><b class="num">${p.estoque}</b><div class="tiny faint">peças</div></div></a>`).join('')}</div>`
        : `<p class="muted" style="padding:18px 4px">${filtro === 'baixo' ? 'Nenhum produto com estoque baixo.' : filtro === 'zerado' ? 'Nenhum tamanho zerado.' : filtro === 'arquivados' ? 'Nenhum produto arquivado.' : 'Nenhum produto encontrado.'}</p>`;
    }
    $('#filtros-prod').addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      filtro = b.dataset.f;
      $$('[data-f]', v).forEach((x) => x.classList.toggle('ativo', x === b));
      desenhar();
    });
    busca.addEventListener('input', desenhar);
    desenhar();
  };

  const TAM_LETRAS = ['PP', 'P', 'M', 'G', 'GG', 'XG'];
  const TAM_NUMEROS = ['36', '38', '40', '42', '44', '46', '48'];

  TELAS.produto = async function (v, id, token) {
    const novo = !id || id === 'novo';
    let p = null;
    if (!novo) {
      v.innerHTML = carregandoHTML();
      const lista = await carregarProdutos();
      p = lista.find((x) => x.id === id) || (await carregarProdutos(true)).find((x) => x.id === id);
      if (!vivo(token)) return;
      if (!p) { v.innerHTML = vazioHTML(ic.shirt, 'Produto não encontrado', 'Ele pode ter sido apagado.', '#/produtos', 'Voltar'); return; }
    }
    const cats = [...new Set([...(S.produtos || []).map((x) => x.categoria).filter(Boolean), ...CATEGORIAS_PRODUTO])];
    const existentes = new Map();
    (p ? p.variacoes : []).forEach((x) => existentes.set(`${x.tamanho}|${x.cor}`, x));
    const ed = {
      tamanhos: p ? [...new Set(p.variacoes.map((x) => x.tamanho))].sort((a, b) => rankTam(a) - rankTam(b)) : [],
      cores: p ? [...new Set(p.variacoes.map((x) => x.cor).filter(Boolean))] : [],
      iniciais: {}
    };
    if (p && ed.tamanhos.length === 1 && ed.tamanhos[0] === 'Único') ed.tamanhos = [];
    const minimo = p && p.variacoes.length ? Math.max(...p.variacoes.map((x) => x.estoque_minimo)) : 1;

    v.innerHTML = `<a class="link-btn row" href="#/produtos" style="gap:4px;margin-top:4px">${ic.chevLeft.replace('<svg', '<svg style="width:18px;height:18px"')}Produtos</a>
      <div class="page-head"><div><h1>${novo ? 'Novo produto' : esc(p.nome)}</h1>${!novo && !p.ativo ? '<p class="sub"><span class="badge warn">Arquivado</span></p>' : ''}</div></div>
      <form class="stack" id="f-prod" novalidate>
        <div class="card form">
          <label class="campo"><span>Nome do produto</span><input class="input" name="nome" required value="${esc(p ? p.nome : '')}" placeholder="Ex.: Camiseta Oversized Algodão"></label>
          <div class="duo"><label class="campo"><span>Categoria</span><input class="input" name="categoria" list="lista-cats" value="${esc(p ? p.categoria || '' : '')}" placeholder="Ex.: Camisetas"></label>
            <label class="campo"><span>Marca / fornecedor</span><input class="input" name="marca" value="${esc(p ? p.marca || '' : '')}"></label></div>
          <datalist id="lista-cats">${cats.map((c) => `<option value="${esc(c)}"></option>`).join('')}</datalist>
          <div class="duo"><label class="campo"><span>Custo (quanto pagou)</span><div class="prefix"><b>R$</b><input class="input" name="custo" inputmode="decimal" value="${p ? moneyInput(p.custo) : ''}" placeholder="0,00"></div></label>
            <label class="campo"><span>Preço de venda</span><div class="prefix"><b>R$</b><input class="input" name="preco" inputmode="decimal" value="${p ? moneyInput(p.preco) : ''}" placeholder="0,00"></div></label></div>
          <div class="row wrap" style="gap:8px"><span class="small muted">Preço pelo custo:</span>${[2, 2.5, 3].map((x) => `<button class="chip" type="button" data-mk="${x}">${String(x).replace('.', ',')}x</button>`).join('')}</div>
          <p class="small" id="margem"></p>
        </div>
        <div class="card form">
          <div><h2 style="margin-bottom:4px">Tamanhos e cores</h2><p class="small muted">Escolha os tamanhos, adicione as cores e diga quantas peças tem de cada.</p></div>
          <div class="campo"><span>Tamanhos</span>
            <div class="chips" id="tams">${[...TAM_LETRAS, ...TAM_NUMEROS, 'Único'].map((t) => `<button class="chip" type="button" data-tam="${t}">${t}</button>`).join('')}</div>
            <div class="row" style="margin-top:8px"><input class="input" id="tam-outro" placeholder="Outro tamanho (ex.: 50, G1)" style="max-width:220px"><button class="btn peq" type="button" id="add-tam">Adicionar</button></div></div>
          <div class="campo"><span>Cores</span>
            <div class="chips" id="cores"></div>
            <div class="row" style="margin-top:8px"><input class="input" id="cor-nova" placeholder="Ex.: Preta" style="max-width:220px"><button class="btn peq" type="button" id="add-cor">Adicionar cor</button></div>
            <span class="ajuda">Sem cor? Deixe vazio.</span></div>
          <div class="campo"><span>${novo ? 'Quantas peças você tem de cada' : 'Estoque de cada um'}</span><div class="grade-wrap" id="grade"></div>
            ${novo ? '' : '<span class="ajuda">Toque no número para registrar chegada de mercadoria ou corrigir a contagem.</span>'}</div>
          <label class="campo"><span>Avisar quando tiver até</span><div class="row"><input class="input" name="minimo" type="number" min="0" inputmode="numeric" value="${minimo}" style="max-width:90px"><span class="muted small">peça(s) de um tamanho</span></div></label>
        </div>
        <p class="erro-msg hidden" id="prod-erro"></p>
        <button class="btn prim bloco grande" type="submit">${novo ? 'Cadastrar produto' : 'Salvar alterações'}</button>
        ${novo ? '' : `<div class="card"><h2>Histórico do estoque</h2><div id="hist">${carregandoHTML()}</div></div>
          <button class="btn ${p.ativo ? 'perigo' : ''} bloco" type="button" id="arquivar">${p.ativo ? `${ic.trash}Arquivar produto` : 'Reativar produto'}</button>`}
      </form>`;

    const f = $('#f-prod');
    const mostrarMargem = () => {
      const c = parseMoney(f.custo.value), pr = parseMoney(f.preco.value);
      const el = $('#margem');
      if (!pr) { el.innerHTML = ''; return; }
      if (!c) { el.innerHTML = '<span class="muted">Informe o custo para ver a margem.</span>'; return; }
      const lucro = pr - c;
      el.innerHTML = `Lucro de <b class="${lucro >= 0 ? 'up' : 'down'}">${brl(lucro)}</b> por peça · margem ${pct(lucro / pr)} · markup ${n1(pr / c)}x`;
    };
    f.custo.addEventListener('input', mostrarMargem);
    f.preco.addEventListener('input', mostrarMargem);
    $$('[data-mk]', f).forEach((b) => b.addEventListener('click', () => {
      const c = parseMoney(f.custo.value);
      if (!c) { toast('Digite o custo primeiro.', 'erro'); f.custo.focus(); return; }
      const bruto = c * Number(b.dataset.mk);
      const redondo = Math.floor(bruto) + 0.9;
      f.preco.value = moneyInput(redondo >= bruto ? redondo : redondo + 1);
      mostrarMargem();
    }));
    mostrarMargem();

    function desenharTams() {
      const presets = [...TAM_LETRAS, ...TAM_NUMEROS, 'Único'];
      const extras = ed.tamanhos.filter((t) => !presets.includes(t));
      $('#tams').innerHTML = [...presets, ...extras].map((t) => `<button class="chip ${ed.tamanhos.includes(t) || (t === 'Único' && !ed.tamanhos.length) ? 'ativo' : ''}" type="button" data-tam="${esc(t)}">${esc(t)}</button>`).join('');
    }
    function desenharCores() {
      $('#cores').innerHTML = ed.cores.length ? ed.cores.map((c) => `<button class="chip ativo" type="button" data-cor="${esc(c)}">${esc(c)} <span class="x">✕</span></button>`).join('') : '<span class="small faint">Nenhuma cor (produto de uma cor só)</span>';
    }
    function desenharGrade() {
      const tams = ed.tamanhos.length ? ed.tamanhos : ['Único'];
      const cores = ed.cores.length ? ed.cores : [''];
      $('#grade').innerHTML = `<table class="grade"><thead><tr><th class="cor"></th>${tams.map((t) => `<th>${esc(t)}</th>`).join('')}</tr></thead><tbody>
        ${cores.map((c) => `<tr><th class="cor">${esc(c || (cores.length > 1 ? '—' : ''))}</th>${tams.map((t) => {
          const k = `${t}|${c}`;
          const ex = existentes.get(k);
          if (ex) return `<td><button class="celula-estoque ${ex.estoque <= 0 ? 'zero' : ex.estoque <= ex.estoque_minimo ? 'baixo' : ''}" type="button" data-ajuste="${ex.id}">${ex.estoque}</button></td>`;
          return `<td><input class="input" type="number" min="0" inputmode="numeric" data-ini="${esc(k)}" value="${ed.iniciais[k] || ''}" placeholder="0"></td>`;
        }).join('')}</tr>`).join('')}</tbody></table>`;
    }
    desenharTams(); desenharCores(); desenharGrade();

    $('#tams').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tam]');
      if (!b) return;
      const t = b.dataset.tam;
      if (t === 'Único') ed.tamanhos = [];
      else if (ed.tamanhos.includes(t)) ed.tamanhos = ed.tamanhos.filter((x) => x !== t);
      else ed.tamanhos = [...ed.tamanhos, t].sort((a, b2) => rankTam(a) - rankTam(b2));
      desenharTams(); desenharGrade();
    });
    const addTam = () => {
      const t = normTam($('#tam-outro').value);
      if (!t) return;
      if (!ed.tamanhos.includes(t)) ed.tamanhos = [...ed.tamanhos, t].sort((a, b2) => rankTam(a) - rankTam(b2));
      $('#tam-outro').value = '';
      desenharTams(); desenharGrade();
    };
    $('#add-tam').addEventListener('click', addTam);
    $('#tam-outro').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTam(); } });
    const addCor = () => {
      const c = normCor($('#cor-nova').value);
      if (!c) return;
      if (!ed.cores.includes(c)) ed.cores.push(c);
      $('#cor-nova').value = '';
      desenharCores(); desenharGrade();
    };
    $('#add-cor').addEventListener('click', addCor);
    $('#cor-nova').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addCor(); } });
    $('#cores').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cor]');
      if (!b) return;
      ed.cores = ed.cores.filter((c) => c !== b.dataset.cor);
      desenharCores(); desenharGrade();
    });
    $('#grade').addEventListener('input', (e) => {
      if (e.target.dataset.ini !== undefined) ed.iniciais[e.target.dataset.ini] = Math.max(0, parseInt(e.target.value, 10) || 0);
    });
    $('#grade').addEventListener('click', (e) => {
      const b = e.target.closest('[data-ajuste]');
      if (!b) return;
      const x = p.variacoes.find((vv) => vv.id === b.dataset.ajuste);
      if (x) ajustarEstoque(p, x);
    });

    f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const erro = $('#prod-erro');
      const falha = (m) => { erro.textContent = m; erro.classList.remove('hidden'); erro.scrollIntoView({ block: 'center', behavior: 'smooth' }); };
      erro.classList.add('hidden');
      const nome = f.nome.value.trim();
      if (!nome) return falha('Dê um nome ao produto.');
      const preco = parseMoney(f.preco.value);
      if (!preco) return falha('Informe o preço de venda.');
      const minimoV = Math.max(0, parseInt(f.minimo.value, 10) || 0);
      const tams = ed.tamanhos.length ? ed.tamanhos : ['Único'];
      const cores = ed.cores.length ? ed.cores : [''];
      const variacoes = [];
      const chaves = new Set();
      cores.forEach((c) => tams.forEach((t) => {
        const k = `${t}|${c}`;
        chaves.add(k);
        const ex = existentes.get(k);
        variacoes.push(ex ? { id: ex.id, tamanho: t, cor: c, codigo: ex.codigo, estoque_minimo: minimoV }
          : { tamanho: t, cor: c, estoque_inicial: ed.iniciais[k] || 0, estoque_minimo: minimoV });
      }));
      const saindo = [...existentes.entries()].filter(([k, x]) => !chaves.has(k) && x.estoque > 0);
      if (saindo.length) {
        const ok = await confirmar('Tirar tamanhos com peças?', {
          detalhe: `Você tirou da grade: ${saindo.map(([, x]) => `${esc(rotuloVar(x))} (${x.estoque})`).join(', ')}. Essas peças saem do estoque.`,
          ok: 'Tirar mesmo assim', perigo: true
        });
        if (!ok) return;
      }
      await ocupado(f.querySelector('button[type=submit]'), async () => {
        try {
          const novoId = await run(sb.rpc('salvar_produto', {
            p_loja: S.loja.id,
            p_produto: { id: p ? p.id : null, nome, categoria: f.categoria.value.trim(), marca: f.marca.value.trim(), custo: parseMoney(f.custo.value), preco },
            p_variacoes: variacoes
          }));
          S.produtos = null;
          toast(novo ? 'Produto cadastrado!' : 'Produto salvo.');
          if (novo) {
            const outro = await confirmar('Produto cadastrado!', { detalhe: 'Quer cadastrar outro?', ok: 'Cadastrar outro' });
            if (outro) { if (location.hash === '#/produto/novo') rotear(); else location.hash = '#/produto/novo'; }
            else location.hash = '#/produtos';
          } else {
            location.hash = '#/produto/' + novoId;
            rotear();
          }
        } catch (err) { falha(msgErro(err)); }
      });
    });

    if (!novo) {
      $('#arquivar').addEventListener('click', async () => {
        if (p.ativo) {
          const ok = await confirmar('Arquivar este produto?', { detalhe: 'Ele some do caixa e das listas, mas as vendas antigas continuam no histórico. Dá para reativar depois.', ok: 'Arquivar', perigo: true });
          if (!ok) return;
        }
        try {
          await run(sb.rpc('arquivar_produto', { p_produto: p.id, p_ativo: !p.ativo }));
          S.produtos = null;
          toast(p.ativo ? 'Produto arquivado.' : 'Produto reativado.');
          location.hash = '#/produtos';
        } catch (err) { toast(msgErro(err), 'erro'); }
      });
      const ids = p.variacoes.map((x) => x.id);
      if (!ids.length) { $('#hist').innerHTML = '<p class="muted small">Sem movimentações.</p>'; return; }
      try {
        const movs = await run(sb.from('movimentos_estoque').select('variacao_id, tipo, quantidade, saldo, motivo, created_at')
          .in('variacao_id', ids).order('created_at', { ascending: false }).limit(25));
        if (!vivo(token)) return;
        const nomeVar = {};
        p.variacoes.forEach((x) => { nomeVar[x.id] = rotuloVar(x); });
        const TIPOS = { inicial: 'Cadastro', entrada: 'Chegou mercadoria', ajuste: 'Contagem', venda: 'Venda', cancelamento: 'Venda cancelada' };
        $('#hist').innerHTML = movs.length ? `<div class="lista">${movs.map((x) => `<div class="item" style="cursor:default">
            <div class="grow"><div class="tit">${TIPOS[x.tipo] || x.tipo} · ${esc(nomeVar[x.variacao_id] || '')}</div>
            <div class="sub">${fmtData(x.created_at)} ${fmtHora(x.created_at)}${x.motivo ? ' · ' + esc(x.motivo) : ''}</div></div>
            <div class="right"><b class="num ${x.quantidade >= 0 ? 'up' : 'down'}">${x.quantidade > 0 ? '+' : ''}${x.quantidade}</b><div class="tiny faint">fica ${x.saldo}</div></div></div>`).join('')}</div>`
          : '<p class="muted small">Sem movimentações.</p>';
      } catch (err) { const h = $('#hist'); if (h) h.innerHTML = `<p class="muted small">${esc(msgErro(err))}</p>`; }
    }
  };

  function ajustarEstoque(p, x) {
    let tipo = 'entrada';
    abrirFolha(`${cabFolha(esc(p.nome), `${esc(rotuloVar(x))} · estoque atual: <b>${x.estoque}</b>`)}
      <form class="form" id="f-est">
        <div class="seg" id="tipo-est" style="width:100%"><button type="button" data-t="entrada" class="ativo" style="flex:1">Chegou mercadoria</button><button type="button" data-t="ajuste" style="flex:1">Contei o estoque</button></div>
        <label class="campo"><span id="rot-qtd">Quantas peças chegaram?</span><input class="input grande" name="qtd" type="number" min="0" inputmode="numeric" autofocus></label>
        <label class="campo"><span>Observação (opcional)</span><input class="input" name="motivo" maxlength="120" placeholder="Ex.: pedido do fornecedor"></label>
        <p class="small muted" id="prev-est"></p>
        <p class="erro-msg hidden" id="est-erro"></p>
        <button class="btn prim bloco grande" type="submit">Salvar</button></form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-est', f);
        const prev = () => {
          const q = parseInt(form.qtd.value, 10);
          $('#prev-est', f).innerHTML = Number.isNaN(q) ? '' : tipo === 'entrada' ? `Vai ficar com <b>${x.estoque + q}</b> peças.` : `Diferença: <b>${q - x.estoque > 0 ? '+' : ''}${q - x.estoque}</b> peças.`;
        };
        $('#tipo-est', f).addEventListener('click', (e) => {
          const b = e.target.closest('[data-t]');
          if (!b) return;
          tipo = b.dataset.t;
          $$('#tipo-est button', f).forEach((y) => y.classList.toggle('ativo', y === b));
          $('#rot-qtd', f).textContent = tipo === 'entrada' ? 'Quantas peças chegaram?' : 'Quantas peças tem agora (contadas)?';
          prev();
        });
        form.qtd.addEventListener('input', prev);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const q = parseInt(form.qtd.value, 10);
          const erro = $('#est-erro', f);
          if (Number.isNaN(q) || q < 0 || (tipo === 'entrada' && q === 0)) { erro.textContent = 'Digite a quantidade.'; erro.classList.remove('hidden'); return; }
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              await run(sb.rpc('movimentar_estoque', { p_variacao: x.id, p_tipo: tipo, p_quantidade: q, p_motivo: form.motivo.value.trim() || null }));
              S.produtos = null;
              fechar();
              toast('Estoque atualizado.');
              rotear();
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
      }
    });
  }

  // ------------------------------------------------------------------
  // CLIENTES
  // ------------------------------------------------------------------
  TELAS.clientes = async function (v, arg, token) {
    let filtro = 'todos';
    v.innerHTML = `<div class="page-head"><div><h1>Clientes</h1><p class="sub" id="cli-resumo">Carregando…</p></div><button class="btn prim" type="button" id="novo-cliente">${ic.plus}Novo</button></div>
      <div class="busca">${ic.search}<input class="input" id="busca-clientes" type="search" placeholder="Nome, telefone ou Instagram" autocomplete="off"></div>
      <div class="chips rolar" id="filtros-cli" style="margin:12px 0">
        ${[['todos', 'Todos'], ['sumidos', 'Sumidos (60+ dias)'], ['aniver', 'Aniversariantes do mês'], ['melhores', 'Melhores clientes'], ['nunca', 'Nunca compraram']].map(([k, t]) => `<button class="chip ${k === filtro ? 'ativo' : ''}" type="button" data-f="${k}">${t}</button>`).join('')}
      </div>
      <div class="card" style="padding:4px 14px" id="lista-clientes">${carregandoHTML()}</div>`;
    $('#novo-cliente').addEventListener('click', () => formCliente(null, (c) => { location.hash = '#/cliente/' + c.id; }));
    const clientes = await carregarClientes(true);
    if (!vivo(token)) return;
    const mesAtual = new Date().getMonth();
    const sumido = (c) => c.ultima && diasAtras(c.ultima) >= 60;
    $('#cli-resumo').textContent = `${plural(clientes.length, 'cliente', 'clientes')} · ${plural(clientes.filter(sumido).length, 'sumido', 'sumidos')} há 60+ dias`;
    const lista = $('#lista-clientes');
    const busca = $('#busca-clientes');
    function desenhar() {
      const t = busca.value.trim().toLowerCase();
      const d = soDigitos(t);
      let ls = clientes;
      if (filtro === 'sumidos') ls = ls.filter(sumido).sort((a, b) => new Date(a.ultima) - new Date(b.ultima));
      if (filtro === 'aniver') ls = ls.filter((c) => c.aniversario && dataLocal(c.aniversario).getMonth() === mesAtual).sort((a, b) => dataLocal(a.aniversario).getDate() - dataLocal(b.aniversario).getDate());
      if (filtro === 'melhores') ls = ls.filter((c) => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 30);
      if (filtro === 'nunca') ls = ls.filter((c) => !c.compras);
      if (t) ls = ls.filter((c) => c.nome.toLowerCase().includes(t) || (d && soDigitos(c.telefone).includes(d)) || (c.instagram || '').toLowerCase().includes(t.replace('@', '')));
      if (!clientes.length) {
        lista.style.padding = '0'; lista.style.border = '0';
        lista.innerHTML = `<div class="vazio">${ic.users}<h3>Nenhum cliente ainda</h3><p class="small">Cadastre no caixa, na hora da venda, ou aqui.</p></div>`;
        return;
      }
      lista.innerHTML = ls.length ? `<div class="lista">${ls.map((c) => `<a class="item" href="#/cliente/${c.id}">
          <div class="avatar">${esc(iniciais(c.nome))}</div>
          <div class="grow" style="min-width:0"><div class="tit ellipsis">${esc(c.nome)} ${sumido(c) ? '<span class="badge warn">Sumido</span>' : ''}</div>
            <div class="sub ellipsis">${esc(fmtTel(c.telefone) || 'sem telefone')}${c.origem ? ' · ' + esc(c.origem) : ''}${filtro === 'aniver' && c.aniversario ? ' · faz aniversário dia ' + dataLocal(c.aniversario).getDate() : ''}</div></div>
          <div class="right">${c.compras ? `<b class="num">${money(c.total)}</b><div class="tiny faint">${quando(c.ultima)}</div>` : '<span class="tiny faint">sem compras</span>'}</div></a>`).join('')}</div>`
        : '<p class="muted" style="padding:18px 4px">Ninguém por aqui.</p>';
    }
    $('#filtros-cli').addEventListener('click', (e) => {
      const b = e.target.closest('[data-f]');
      if (!b) return;
      filtro = b.dataset.f;
      $$('#filtros-cli [data-f]').forEach((x) => x.classList.toggle('ativo', x === b));
      desenhar();
    });
    busca.addEventListener('input', desenhar);
    desenhar();
  };

  TELAS.cliente = async function (v, id, token) {
    v.innerHTML = carregandoHTML();
    const clientes = await carregarClientes(true);
    if (!vivo(token)) return;
    const c = clientes.find((x) => x.id === id);
    if (!c) { v.innerHTML = vazioHTML(ic.users, 'Cliente não encontrado', 'Pode ter sido apagado.', '#/clientes', 'Ver clientes'); return; }
    const vendas = await run(sb.from('vendas').select('id, numero, data, canal, total, pecas, status, forma_pagamento, desconto, subtotal, parcelas, vendedor_nome, vendedor_cad_id, comissao, observacao, cliente_id')
      .eq('cliente_id', c.id).order('data', { ascending: false }).limit(50));
    if (!vivo(token)) return;
    const msg = `Oi, ${primeiroNome(c.nome)}! Aqui é da ${S.loja.nome}. Chegou novidade com a sua cara, quer que eu te mande umas fotos?`;
    const zap = waLink(c.telefone, msg);
    v.innerHTML = `<a class="link-btn row" href="#/clientes" style="gap:4px;margin-top:4px">${ic.chevLeft.replace('<svg', '<svg style="width:18px;height:18px"')}Clientes</a>
      <div class="page-head"><div class="row" style="gap:14px"><div class="avatar" style="width:56px;height:56px;font-size:20px;border-radius:18px">${esc(iniciais(c.nome))}</div>
        <div><h1>${esc(c.nome)}</h1><p class="sub">${esc(fmtTel(c.telefone) || 'sem telefone')}${c.instagram ? ' · @' + esc(c.instagram.replace(/^@/, '')) : ''}</p></div></div></div>
      <div class="grid k4">
        <div class="card kpi"><div class="rotulo">Já gastou</div><div class="valor">${money(c.total)}</div></div>
        <div class="card kpi"><div class="rotulo">Compras</div><div class="valor">${c.compras}</div></div>
        <div class="card kpi"><div class="rotulo">Ticket médio</div><div class="valor">${money(c.compras ? c.total / c.compras : 0)}</div></div>
        <div class="card kpi"><div class="rotulo">Última compra</div><div class="valor" style="font-size:20px">${c.ultima ? cap(quando(c.ultima)) : '–'}</div></div>
      </div>
      <div class="row wrap" style="margin:14px 0">
        ${zap ? `<a class="btn prim" href="${zap}" target="_blank" rel="noopener">${ic.chat}Chamar no WhatsApp</a>` : ''}
        <button class="btn" type="button" id="editar-cli">${ic.edit}Editar</button>
      </div>
      <div class="card" style="margin-bottom:12px"><div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
        <div><div class="tiny faint">COMO CONHECEU</div><div>${esc(c.origem || '–')}</div></div>
        <div><div class="tiny faint">ANIVERSÁRIO</div><div>${c.aniversario ? fmtDataCurta(dataLocal(c.aniversario)) : '–'}</div></div>
        <div><div class="tiny faint">CLIENTE DESDE</div><div>${fmtData(c.created_at)}</div></div>
        ${c.observacao ? `<div style="grid-column:1/-1"><div class="tiny faint">OBSERVAÇÕES</div><div>${esc(c.observacao)}</div></div>` : ''}
      </div></div>
      <div class="card" style="padding:4px 14px"><div class="dia-cab"><span>Compras</span></div>
        ${vendas.length ? `<div class="lista">${vendas.map((x) => `<button class="item" type="button" data-venda="${x.id}"><div class="grow"><div class="tit">Venda nº ${x.numero}</div><div class="sub">${fmtData(x.data)} · ${esc(x.canal || 'Loja física')} · ${esc(x.forma_pagamento)} · ${plural(x.pecas, 'peça', 'peças')}</div></div>
          ${x.status === 'cancelada' ? '<span class="badge danger">Cancelada</span>' : `<b class="num">${money(x.total)}</b>`}</button>`).join('')}</div>` : '<p class="muted small" style="padding:4px 4px 16px">Nenhuma compra registrada.</p>'}
      </div>`;
    $('#editar-cli').addEventListener('click', () => formCliente(c, () => rotear()));
    v.querySelectorAll('[data-venda]').forEach((b) => b.addEventListener('click', () => {
      const x = vendas.find((y) => y.id === b.dataset.venda);
      detalheVenda(Object.assign({}, x, { clientes: { nome: c.nome, telefone: c.telefone } }));
    }));
  };

  function formCliente(c, aoSalvar) {
    abrirFolha(`${cabFolha(c ? 'Editar cliente' : 'Novo cliente')}
      <form class="form" id="f-cli" novalidate>
        <label class="campo"><span>Nome</span><input class="input" name="nome" required value="${esc(c ? c.nome : '')}" autocomplete="off" autofocus></label>
        <label class="campo"><span>WhatsApp</span><input class="input" name="telefone" type="tel" inputmode="tel" value="${esc(c ? fmtTel(c.telefone) : '')}" placeholder="(33) 99999-9999"></label>
        <div class="duo"><label class="campo"><span>Instagram</span><input class="input" name="instagram" value="${esc(c ? c.instagram || '' : '')}" placeholder="@usuario" autocapitalize="off"></label>
          <label class="campo"><span>Aniversário</span><input class="input" name="aniversario" type="date" value="${esc(c && c.aniversario ? String(c.aniversario).slice(0, 10) : '')}"></label></div>
        <label class="campo"><span>Como conheceu a loja?</span><select class="input" name="origem"><option value="">Escolha…</option>${ORIGENS.map((o) => `<option ${c && c.origem === o ? 'selected' : ''}>${o}</option>`).join('')}</select></label>
        <label class="campo"><span>Observações</span><textarea class="input" name="observacao" maxlength="300" placeholder="Ex.: veste M, gosta de camisa social">${esc(c ? c.observacao || '' : '')}</textarea></label>
        <p class="erro-msg hidden" id="cli-erro"></p>
        <button class="btn prim bloco grande" type="submit">${c ? 'Salvar' : 'Cadastrar cliente'}</button>
        ${c ? `<button class="btn perigo bloco" type="button" id="apagar-cli">${ic.trash}Apagar cliente</button>` : ''}
      </form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-cli', f);
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const erro = $('#cli-erro', f);
          const nome = form.nome.value.trim();
          if (!nome) { erro.textContent = 'Digite o nome.'; erro.classList.remove('hidden'); return; }
          const tel = soDigitos(form.telefone.value);
          if (tel && (tel.length < 10 || tel.length > 13)) { erro.textContent = 'Telefone com DDD, ex.: (33) 99999-9999.'; erro.classList.remove('hidden'); return; }
          const dados = {
            nome, telefone: tel || null, instagram: form.instagram.value.trim().replace(/^@/, '') || null,
            aniversario: form.aniversario.value || null, origem: form.origem.value || null, observacao: form.observacao.value.trim() || null
          };
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              let salvo;
              if (c) salvo = await run(sb.from('clientes').update(dados).eq('id', c.id).select().single());
              else salvo = await run(sb.from('clientes').insert(Object.assign({ loja_id: S.loja.id }, dados)).select().single());
              S.clientes = null; S.resumoClientes = null;
              fechar();
              toast(c ? 'Cliente salvo.' : 'Cliente cadastrado!');
              if (aoSalvar) aoSalvar(salvo);
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
        const apagar = $('#apagar-cli', f);
        if (apagar) apagar.addEventListener('click', async () => {
          const ok = await confirmar(`Apagar ${esc(c.nome)}?`, { detalhe: 'As compras dessa pessoa continuam nas vendas, só sem o nome.', ok: 'Apagar', perigo: true });
          if (!ok) return;
          try {
            await run(sb.from('clientes').delete().eq('id', c.id));
            S.clientes = null; S.resumoClientes = null;
            fechar();
            toast('Cliente apagado.');
            location.hash = '#/clientes';
          } catch (err) { toast(msgErro(err), 'erro'); }
        });
      }
    });
  }

  // ------------------------------------------------------------------
  // DESPESAS (dono)
  // ------------------------------------------------------------------
  TELAS.despesas = async function (v, arg, token) {
    const ref = /^\d{4}-\d{2}$/.test(arg) ? new Date(+arg.slice(0, 4), +arg.slice(5) - 1, 1) : inicioMes();
    const de = inicioMes(ref), ate = inicioMes(ref, 1);
    const chaveMes = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    v.innerHTML = `<div class="page-head"><div><h1>Despesas</h1><p class="sub">Contas da loja que não são mercadoria</p></div><button class="btn prim" type="button" id="nova-desp">${ic.plus}Lançar</button></div>
      <div class="row" style="margin-bottom:14px"><a class="icon-btn" href="#/despesas/${chaveMes(inicioMes(ref, -1))}" aria-label="Mês anterior">${ic.chevLeft}</a>
        <b class="grow" style="text-align:center;font-size:16px">${cap(nomeMes(ref))}</b>
        <a class="icon-btn" href="#/despesas/${chaveMes(inicioMes(ref, 1))}" aria-label="Próximo mês">${ic.chevRight}</a></div>
      <div id="desp-conteudo">${carregandoHTML()}</div>`;
    $('#nova-desp').addEventListener('click', () => formDespesa(null, ref));
    try { await run(sb.rpc('gerar_despesas_fixas', { p_loja: S.loja.id, p_mes: isoData(de) })); } catch (e) { /* segue mesmo assim */ }
    if (!vivo(token)) return;
    const [lista, vendasMes] = await Promise.all([
      run(sb.from('despesas').select('*').eq('loja_id', S.loja.id).gte('data', isoData(de)).lt('data', isoData(ate)).order('data', { ascending: false })),
      run(sb.from('vendas').select('vendedor_nome, vendedor_cad_id, total, comissao').eq('loja_id', S.loja.id).eq('status', 'concluida').gte('data', de.toISOString()).lt('data', ate.toISOString()))
    ]);
    if (!vivo(token)) return;
    const total = lista.reduce((s, x) => s + Number(x.valor), 0);
    const fixas = lista.filter((x) => x.tipo === 'fixa').reduce((s, x) => s + Number(x.valor), 0);
    const porVend = {};
    vendasMes.filter((x) => x.vendedor_cad_id).forEach((x) => {
      const k = x.vendedor_nome || '—';
      porVend[k] = porVend[k] || { vendas: 0, total: 0, comissao: 0 };
      porVend[k].vendas += 1; porVend[k].total += Number(x.total); porVend[k].comissao += Number(x.comissao);
    });
    const vends = Object.entries(porVend).sort((a, b) => b[1].comissao - a[1].comissao);
    const totalCom = vends.reduce((s, [, x]) => s + x.comissao, 0);
    const porCat = {};
    lista.forEach((x) => { porCat[x.categoria] = (porCat[x.categoria] || 0) + Number(x.valor); });
    const cats = Object.entries(porCat).sort((a, b) => b[1] - a[1]);
    let html = `<div class="grid k4" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">
        <div class="card kpi destaque"><div class="rotulo">Total do mês</div><div class="valor">${money(total + totalCom)}</div><div class="det">despesas${totalCom ? ' + comissões' : ''}</div></div>
        <div class="card kpi"><div class="rotulo">Fixas</div><div class="valor">${money(fixas)}</div><div class="det">repetem todo mês</div></div>
        <div class="card kpi"><div class="rotulo">Variáveis</div><div class="valor">${money(total - fixas)}</div></div>
        <div class="card kpi"><div class="rotulo">Comissões</div><div class="valor">${money(totalCom)}</div><div class="det">dos vendedores</div></div></div>`;
    html += `<div class="card" style="margin-top:12px"><h2>${ic.users.replace('<svg', '<svg style="width:20px;height:20px"')} Comissão dos vendedores <a class="acao" href="#/ajustes">Vendedores</a></h2>
      ${vends.length ? `<div class="lista">${vends.map(([nome, x]) => `<div class="item" style="cursor:default"><div class="avatar cinza">${esc(iniciais(nome))}</div>
        <div class="grow"><div class="tit">${esc(nome)}</div><div class="sub">${plural(x.vendas, 'venda', 'vendas')} · vendeu ${money(x.total)}</div></div>
        <div class="right"><b class="num">${money(x.comissao)}</b><div class="tiny faint">a pagar</div></div></div>`).join('')}</div>`
        : '<p class="small muted">Nenhuma venda com vendedor neste mês. Cadastre os vendedores e a % de comissão em <a href="#/ajustes">Loja e equipe</a> e escolha o vendedor na hora da venda.</p>'}</div>`;
    if (cats.length) {
      html += `<div class="card" style="margin-top:12px"><h2>Para onde vai o dinheiro</h2><div class="stack">${cats.map(([cat, val]) => `
        <div><div class="row between small"><b>${esc(cat)}</b><span class="num">${money(val)} · ${pct(val / total)}</span></div><div class="barra danger" style="height:6px;margin-top:6px"><i style="width:${(val / total * 100).toFixed(1)}%"></i></div></div>`).join('')}</div></div>`;
    }
    html += `<p class="small muted" style="margin:14px 2px">Despesa marcada para repetir aparece sozinha nos meses seguintes. Compra de mercadoria não entra aqui: o custo da peça já desconta do lucro quando ela é vendida.</p>`;
    html += lista.length ? `<div class="card" style="padding:4px 14px"><div class="lista">${lista.map((x) => `<button class="item" type="button" data-desp="${x.id}">
        <div class="avatar cinza">${ic.wallet.replace('<svg', '<svg style="width:18px;height:18px"')}</div>
        <div class="grow" style="min-width:0"><div class="tit ellipsis">${esc(x.descricao)}</div><div class="sub">${esc(x.categoria)} · ${fmtDataCurta(dataLocal(x.data))}${x.modelo_id ? ' · <span class="badge info">repete todo mês</span>' : x.tipo === 'fixa' ? ' · fixa' : ''}</div></div>
        <b class="num">${money(x.valor)}</b></button>`).join('')}</div></div>`
      : vazioHTML(ic.wallet, 'Nenhuma despesa neste mês', 'Lance aluguel, luz, internet, salários e outras contas para ver o lucro real.', null, '');
    $('#desp-conteudo').innerHTML = html;
    $$('[data-desp]').forEach((b) => b.addEventListener('click', () => formDespesa(lista.find((x) => x.id === b.dataset.desp), ref)));
  };

  function formDespesa(d, ref) {
    const hoje = new Date();
    const dataPadrao = d ? String(d.data).slice(0, 10) : (ref && (ref.getMonth() !== hoje.getMonth() || ref.getFullYear() !== hoje.getFullYear()) ? isoData(ref) : isoData(hoje));
    const fixasPorPadrao = ['Aluguel', 'Funcionários e comissões', 'Pró-labore', 'Internet e telefone', 'Energia e água'];
    const recorrente = d && d.modelo_id;
    const caixa = (id, texto, ajuda, marcado) => `<label class="check-row"><input type="checkbox" id="${id}" ${marcado ? 'checked' : ''}><span><b>${texto}</b>${ajuda ? `<small>${ajuda}</small>` : ''}</span></label>`;
    abrirFolha(`${cabFolha(d ? 'Editar despesa' : 'Lançar despesa')}
      <form class="form" id="f-desp" novalidate>
        <label class="campo"><span>Valor</span><div class="prefix"><b>R$</b><input class="input grande" name="valor" inputmode="decimal" value="${d ? moneyInput(d.valor) : ''}" placeholder="0,00" autofocus></div></label>
        <label class="campo"><span>Descrição</span><input class="input" name="descricao" value="${esc(d ? d.descricao : '')}" placeholder="Ex.: Aluguel da loja"></label>
        <label class="campo"><span>Categoria</span><select class="input" name="categoria">${CATEGORIAS_DESPESA.map((c) => `<option ${d && d.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label class="campo"><span>Data</span><input class="input" name="data" type="date" value="${dataPadrao}" ${recorrente ? 'disabled' : ''}></label>
        ${!d ? caixa('repetir', 'Repetir todo mês (despesa fixa)', 'Lança sozinha nos meses seguintes, no mesmo dia. Dá para mudar o valor ou parar quando quiser.', true)
          : recorrente ? `<p class="badge info" style="justify-self:start">Repete todo mês</p>${caixa('proximos', 'Aplicar a mudança também nos próximos meses', '', true)}`
          : caixa('repetir', 'Repetir todo mês a partir deste', 'Vira despesa fixa e aparece sozinha nos meses seguintes.', false)}
        <p class="erro-msg hidden" id="desp-erro"></p>
        <button class="btn prim bloco grande" type="submit">${d ? 'Salvar' : 'Lançar despesa'}</button>
        ${recorrente ? `<button class="btn bloco" type="button" id="parar-desp">Parar de repetir depois deste mês</button>` : ''}
        ${d ? `<button class="btn perigo bloco" type="button" id="apagar-desp">${ic.trash}Apagar${recorrente ? ' só deste mês' : ''}</button>` : ''}
      </form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-desp', f);
        const rep = $('#repetir', f);
        if (!d && rep) {
          const ajustar = () => { rep.checked = fixasPorPadrao.includes(form.categoria.value); };
          ajustar();
          form.categoria.addEventListener('change', ajustar);
        }
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const erro = $('#desp-erro', f);
          const valor = parseMoney(form.valor.value);
          if (!valor) { erro.textContent = 'Digite o valor.'; erro.classList.remove('hidden'); return; }
          if (!recorrente && !form.data.value) { erro.textContent = 'Escolha a data.'; erro.classList.remove('hidden'); return; }
          const descricao = form.descricao.value.trim() || form.categoria.value;
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              if (!d && rep && rep.checked) {
                await run(sb.rpc('criar_despesa_fixa', { p_loja: S.loja.id, p_descricao: descricao, p_categoria: form.categoria.value, p_valor: valor, p_data: form.data.value }));
                toast('Despesa fixa lançada. Ela aparece sozinha nos próximos meses.');
              } else if (!d) {
                await run(sb.from('despesas').insert({ loja_id: S.loja.id, valor, descricao, categoria: form.categoria.value, data: form.data.value, tipo: 'variavel' }));
                toast('Despesa lançada.');
              } else {
                const dados = { valor, descricao, categoria: form.categoria.value };
                if (!recorrente) dados.data = form.data.value;
                await run(sb.from('despesas').update(dados).eq('id', d.id));
                if (recorrente && $('#proximos', f).checked) await run(sb.rpc('atualizar_despesa_fixa', { p_despesa: d.id }));
                if (!recorrente && rep && rep.checked) await run(sb.rpc('tornar_despesa_fixa', { p_despesa: d.id }));
                toast(rep && rep.checked ? 'Agora ela se repete todo mês.' : 'Despesa salva.');
              }
              fechar();
              rotear();
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
        const parar = $('#parar-desp', f);
        if (parar) parar.addEventListener('click', async () => {
          if (!(await confirmar('Parar de repetir?', { detalhe: `Este mês continua lançado. A partir do mês que vem, "${esc(d.descricao)}" não aparece mais.`, ok: 'Parar de repetir', perigo: true }))) return;
          try { await run(sb.rpc('parar_despesa_fixa', { p_despesa: d.id })); fechar(); toast('Não vai mais repetir.'); rotear(); } catch (err) { toast(msgErro(err), 'erro'); }
        });
        const apagar = $('#apagar-desp', f);
        if (apagar) apagar.addEventListener('click', async () => {
          if (!(await confirmar(recorrente ? 'Apagar só deste mês?' : 'Apagar esta despesa?', { detalhe: recorrente ? 'Os outros meses continuam. Para parar de vez, use "Parar de repetir".' : '', ok: 'Apagar', perigo: true }))) return;
          try { await run(sb.from('despesas').delete().eq('id', d.id)); fechar(); toast('Despesa apagada.'); rotear(); } catch (err) { toast(msgErro(err), 'erro'); }
        });
      }
    });
  }

  // ------------------------------------------------------------------
  // LOJA E EQUIPE
  // ------------------------------------------------------------------
  TELAS.ajustes = async function (v, _, token) {
    const L = S.loja;
    if (soVendedor()) {
      v.innerHTML = `<div class="page-head"><div><h1>Minha conta</h1><p class="sub">${esc(L.nome)} · ${NOME_PAPEL[S.papel]}</p></div></div>
        <div class="grid c2">
          <div class="card"><h2>${ic.key.replace('<svg', '<svg style="width:20px;height:20px"')} Sua conta</h2>
            <p class="small muted">${esc(S.m.nome)} · <b style="color:var(--ink)">${esc(S.user.email)}</b></p>
            <p class="small muted" style="margin-top:8px">Seu acesso é de vendas: registrar vendas e ver as suas vendas. Para mais acesso, fale com o dono da loja.</p>
            <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:12px"><button class="btn" type="button" id="aj-trocar">Trocar de loja</button><button class="btn perigo" type="button" id="aj-sair">${ic.logout}Sair</button></div></div>
          <div class="card"><h2>${ic.phone.replace('<svg', '<svg style="width:20px;height:20px"')} Instalar no celular</h2>
            <p class="small muted"><b style="color:var(--ink)">iPhone:</b> abra no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".</p>
            <p class="small muted" style="margin-top:8px"><b style="color:var(--ink)">Android:</b> no Chrome, toque nos 3 pontinhos e em "Instalar app".</p></div>
        </div><p class="tiny faint" style="text-align:center;margin-top:18px">Foresee ${esc(CFG.versao || '')}</p>`;
      $('#aj-trocar').addEventListener('click', trocarLoja);
      $('#aj-sair').addEventListener('click', sair);
      return;
    }
    const url = location.origin + location.pathname;
    v.innerHTML = `<div class="page-head"><div><h1>Loja e equipe</h1><p class="sub">${esc(L.nome)}${L.cidade ? ' · ' + esc(L.cidade) : ''}</p></div></div>
      <div class="grid c2">
        <form class="card form" id="f-ajuste-loja" novalidate>
          <h2>${ic.store.replace('<svg', '<svg style="width:20px;height:20px"')} Dados da loja</h2>
          <label class="campo"><span>Nome da loja</span><input class="input" name="nome" value="${esc(L.nome)}" ${dono() ? '' : 'disabled'}></label>
          <div class="duo"><label class="campo"><span>Cidade</span><input class="input" name="cidade" value="${esc(L.cidade || '')}" ${dono() ? '' : 'disabled'}></label>
            <label class="campo"><span>WhatsApp da loja</span><input class="input" name="telefone" type="tel" value="${esc(fmtTel(L.telefone) || '')}" ${dono() ? '' : 'disabled'}></label></div>
          <label class="campo"><span>Instagram</span><input class="input" name="instagram" value="${esc(L.instagram || '')}" placeholder="@sua_loja" ${dono() ? '' : 'disabled'}></label>
          <label class="campo"><span>Meta de vendas do mês</span><div class="prefix"><b>R$</b><input class="input" name="meta" inputmode="decimal" value="${moneyInput(L.meta_mensal)}" placeholder="Ex.: 30.000,00" ${dono() ? '' : 'disabled'}></div>
            <span class="ajuda">O Início mostra quanto precisa vender por dia para chegar lá.</span></label>
          <p class="erro-msg hidden" id="loja-aj-erro"></p>
          ${dono() ? '<button class="btn prim" type="submit">Salvar dados da loja</button>' : '<p class="small muted">Só o dono pode alterar.</p>'}
        </form>
        <div class="card"><h2>${ic.users.replace('<svg', '<svg style="width:20px;height:20px"')} Equipe</h2><div id="equipe">${carregandoHTML()}</div>
          ${dono() ? `<div class="section-title" style="margin-top:16px">Código de convite</div>
            <p class="small muted" style="margin-bottom:10px">Quem trabalha na loja cria a conta no Foresee e digita este código. Entra como <b>vendedor</b> (só vendas). Você pode mudar para gerente na lista acima.</p>
            <div class="codigo-convite" id="codigo">${esc(L.codigo_convite)}</div>
            <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:10px">
              <a class="btn" id="zap-convite" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(`Oi! Vamos usar o Foresee na ${L.nome}. Abra ${url}, crie sua conta e escolha "Entrar com código de convite". O código é: ${L.codigo_convite}`)}">${ic.chat}Enviar</a>
              <button class="btn" type="button" id="novo-codigo">Trocar código</button></div>` : ''}
        </div>
        ${dono() ? `<div class="card"><h2>${ic.tag.replace('<svg', '<svg style="width:20px;height:20px"')} Vendedores e comissão <button class="link-btn acao" type="button" id="novo-vend">+ Adicionar</button></h2>
          <p class="small muted" style="margin-bottom:8px">Escolha o vendedor na hora da venda e a comissão é calculada sozinha. Não precisa ter conta no app.</p>
          <div id="lista-vend">${carregandoHTML()}</div></div>` : ''}
        <div class="card"><h2>${ic.store.replace('<svg', '<svg style="width:20px;height:20px"')} Suas lojas</h2>
          <div class="lista">${S.membros.map((m) => `<div class="item" style="cursor:default"><div class="avatar ${m.loja_id === L.id ? '' : 'cinza'}">${esc(iniciais(m.lojas.nome))}</div>
            <div class="grow"><div class="tit">${esc(m.lojas.nome)}</div><div class="sub">${NOME_PAPEL[m.papel] || 'Equipe'}</div></div>${m.loja_id === L.id ? '<span class="badge ok">Atual</span>' : ''}</div>`).join('')}</div>
          <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:10px"><button class="btn" type="button" id="aj-trocar">Trocar de loja</button><button class="btn" type="button" id="aj-nova">${ic.plus}Nova loja</button></div></div>
        <div class="card"><h2>${ic.alert.replace('<svg', '<svg style="width:20px;height:20px"')} Notificação de venda</h2>
          <p class="small muted">Toda venda lançada avisa no celular: <b style="color:var(--ink)">"Venda aprovada! Valor: R$ 39,99 – Cartão de crédito"</b>. Chega para o dono e os gerentes que ativarem neste aparelho.</p>
          <p class="small" id="push-estado" style="margin:10px 0">Verificando…</p>
          <div class="row wrap" id="push-botoes"></div></div>
        <div class="card"><h2>${ic.phone.replace('<svg', '<svg style="width:20px;height:20px"')} Instalar no celular</h2>
          <p class="small muted"><b style="color:var(--ink)">iPhone:</b> abra no Safari, toque em Compartilhar e depois em "Adicionar à Tela de Início".</p>
          <p class="small muted" style="margin-top:8px"><b style="color:var(--ink)">Android:</b> no Chrome, toque nos 3 pontinhos e em "Instalar app".</p>
          <button class="btn ${promptInstalar ? '' : 'hidden'}" type="button" id="instalar" style="margin-top:12px">Instalar agora</button></div>
        <div class="card"><h2>${ic.key.replace('<svg', '<svg style="width:20px;height:20px"')} Sua conta</h2>
          <p class="small muted">Entrou como <b style="color:var(--ink)">${esc(S.user.email)}</b></p>
          <button class="btn perigo" type="button" id="aj-sair" style="margin-top:12px">${ic.logout}Sair da conta</button>
          <p class="tiny faint" style="margin-top:14px">Foresee ${esc(CFG.versao || '')}</p></div>
      </div>`;

    const f = $('#f-ajuste-loja');
    if (dono()) f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const erro = $('#loja-aj-erro');
      const nome = f.nome.value.trim();
      if (nome.length < 2) { erro.textContent = 'Digite o nome da loja.'; erro.classList.remove('hidden'); return; }
      const dados = { nome, cidade: f.cidade.value.trim() || null, telefone: soDigitos(f.telefone.value) || null, instagram: f.instagram.value.trim().replace(/^@/, '') || null, meta_mensal: parseMoney(f.meta.value) };
      await ocupado(f.querySelector('button[type=submit]'), async () => {
        try {
          await run(sb.from('lojas').update(dados).eq('id', L.id));
          Object.assign(L, dados);
          const sw = $('#btn-loja .ellipsis');
          if (sw) sw.textContent = L.nome;
          toast('Dados da loja salvos.');
        } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
      });
    });
    $('#aj-trocar').addEventListener('click', trocarLoja);
    $('#aj-nova').addEventListener('click', formCriarLoja);
    $('#aj-sair').addEventListener('click', sair);
    const desenharPush = async () => {
      const est = $('#push-estado'), bt = $('#push-botoes');
      if (!est) return;
      let e = 'sem-suporte';
      try { e = await estadoPush(); } catch (err) { e = 'desligado'; }
      const txt = {
        ligado: '<span class="badge ok">Ativada neste aparelho</span>',
        desligado: '<span class="badge">Desativada neste aparelho</span>',
        bloqueado: '<span class="badge danger">Bloqueada</span> Libere as notificações do Foresee nos ajustes do celular.',
        'sem-suporte': ehIOS() && !instalado() ? '<span class="badge warn">Instale primeiro</span> No iPhone, a notificação só funciona com o Foresee na Tela de Início (veja abaixo). Depois abra por lá e ative aqui.' : '<span class="badge warn">Indisponível</span> Este navegador não recebe notificações.'
      };
      est.innerHTML = txt[e];
      bt.innerHTML = e === 'ligado' ? '<button class="btn" type="button" id="push-teste">Testar</button><button class="btn perigo" type="button" id="push-off">Desativar</button>'
        : e === 'desligado' ? '<button class="btn prim" type="button" id="push-on">Ativar notificações</button>' : '';
      const on = $('#push-on'), off = $('#push-off'), teste = $('#push-teste');
      if (on) on.addEventListener('click', () => ocupado(on, async () => { try { await ativarPush(); toast('Notificações ativadas!'); } catch (err) { toast(msgErro(err), 'erro'); } desenharPush(); }));
      if (off) off.addEventListener('click', () => ocupado(off, async () => { try { await desativarPush(); toast('Notificações desativadas.'); } catch (err) { toast(msgErro(err), 'erro'); } desenharPush(); }));
      if (teste) teste.addEventListener('click', () => ocupado(teste, async () => { try { const r = await chamarPush('POST', { teste: true }); toast(r.enviados ? 'Teste enviado. Deve chegar em segundos.' : 'Nenhum aparelho recebeu. Desative e ative de novo.', r.enviados ? '' : 'erro'); } catch (err) { toast(msgErro(err), 'erro'); } }));
    };
    desenharPush();
    const inst = $('#instalar');
    if (inst) inst.addEventListener('click', async () => { if (!promptInstalar) return; promptInstalar.prompt(); promptInstalar = null; inst.classList.add('hidden'); });
    const novoCod = $('#novo-codigo');
    if (novoCod) novoCod.addEventListener('click', async () => {
      const ok = await confirmar('Trocar o código de convite?', { detalhe: 'O código antigo para de funcionar. Quem já entrou continua na equipe.', ok: 'Trocar' });
      if (!ok) return;
      try {
        const cod = await run(sb.rpc('novo_codigo_convite', { p_loja: L.id }));
        L.codigo_convite = cod;
        rotear();
        toast('Código novo gerado.');
      } catch (err) { toast(msgErro(err), 'erro'); }
    });

    if (dono()) {
      const desenharVend = async (forcar) => {
        const vs = await carregarVendedores(forcar);
        const box = $('#lista-vend');
        if (!box) return;
        box.innerHTML = vs.length ? `<div class="lista">${vs.map((x) => `<button class="item" type="button" data-ev="${x.id}">
            <div class="avatar ${x.ativo ? '' : 'cinza'}">${esc(iniciais(x.nome))}</div>
            <div class="grow"><div class="tit">${esc(x.nome)} ${x.ativo ? '' : '<span class="badge">inativo</span>'}</div><div class="sub">Comissão de ${n1(x.comissao_pct)}% sobre a venda${x.user_id ? " · ligado à conta" : " · <span class=\"down\">sem conta no app</span>"}</div></div>
            ${ic.edit.replace('<svg', '<svg style="width:18px;height:18px;color:var(--ink-3)"')}</button>`).join('')}</div>`
          : '<p class="small faint">Nenhum vendedor cadastrado.</p>';
        $$('[data-ev]', box).forEach((b) => b.addEventListener('click', () => formVendedor(vs.find((x) => x.id === b.dataset.ev), () => desenharVend(true))));
      };
      $('#novo-vend').addEventListener('click', () => formVendedor(null, () => desenharVend(true)));
      desenharVend(true).catch((e) => { const b = $('#lista-vend'); if (b) b.innerHTML = `<p class="small muted">${esc(msgErro(e))}</p>`; });
    }
    const equipe = await run(sb.from('membros').select('user_id, nome, papel, created_at').eq('loja_id', L.id).order('created_at'));
    if (!vivo(token)) return;
    $('#equipe').innerHTML = `<div class="lista">${equipe.map((m) => `<div class="item" style="cursor:default"><div class="avatar ${m.papel === 'dono' ? '' : 'cinza'}">${esc(iniciais(m.nome))}</div>
        <div class="grow"><div class="tit">${esc(m.nome)}${m.user_id === S.user.id ? ' <span class="faint small">(você)</span>' : ''}</div><div class="sub">${dono() && m.papel !== 'dono' ? '' : `${NOME_PAPEL[m.papel] || 'Equipe'} · `}desde ${fmtData(m.created_at)}</div>
          ${dono() && m.papel !== 'dono' ? `<select class="input" data-papel="${m.user_id}" style="min-height:36px;padding:6px 10px;font-size:14px;margin-top:6px;max-width:220px">
            <option value="vendedor" ${m.papel === 'vendedor' ? 'selected' : ''}>Vendedor: só vendas</option>
            <option value="gerente" ${m.papel === 'gerente' ? 'selected' : ''}>Gerente: mais acesso</option></select>` : ''}</div>
        ${dono() && m.user_id !== S.user.id ? `<button class="btn peq perigo" type="button" data-remover="${m.user_id}" data-nome="${esc(m.nome)}">Remover</button>` : ''}</div>`).join('')}</div>
      ${dono() ? `<p class="tiny faint" style="margin-top:8px"><b>Vendedor:</b> só registra vendas e vê as próprias vendas. <b>Gerente:</b> vê o Início, vendas, produtos, estoque e clientes, mas não vê custo, lucro, despesas nem comissões.</p>` : ''}`;
    $$('[data-papel]').forEach((sel) => sel.addEventListener('change', async () => {
      try {
        await run(sb.rpc('definir_papel', { p_loja: L.id, p_user: sel.dataset.papel, p_papel: sel.value }));
        toast(sel.value === 'gerente' ? 'Agora é gerente.' : 'Agora é vendedor (só vendas).');
      } catch (err) { toast(msgErro(err), 'erro'); rotear(); }
    }));
    $$('[data-remover]').forEach((b) => b.addEventListener('click', async () => {
      const ok = await confirmar(`Remover ${b.dataset.nome} da equipe?`, { detalhe: 'A pessoa perde o acesso à loja na hora. As vendas que ela fez continuam registradas.', ok: 'Remover', perigo: true });
      if (!ok) return;
      try {
        await run(sb.from('membros').delete().eq('loja_id', L.id).eq('user_id', b.dataset.remover));
        toast('Pessoa removida da equipe.');
        rotear();
      } catch (err) { toast(msgErro(err), 'erro'); }
    }));
  };

  function formVendedor(x, aoSalvar) {
    abrirFolha(`${cabFolha(x ? 'Editar vendedor' : 'Novo vendedor')}
      <form class="form" id="f-vend" novalidate>
        <label class="campo"><span>Nome</span><input class="input" name="nome" value="${esc(x ? x.nome : '')}" placeholder="Ex.: Betinho" autofocus></label>
        <label class="campo"><span>Comissão</span><div class="row"><input class="input" name="pct" inputmode="decimal" value="${x ? String(x.comissao_pct).replace('.', ',') : ''}" placeholder="Ex.: 3" style="max-width:120px"><b>% sobre cada venda</b></div>
          <span class="ajuda">Calculada sobre o valor final da venda (depois do desconto).</span></label>
        <label class="campo"><span>Conta no app</span><select class="input" name="conta"><option value="">Carregando…</option></select>
          <span class="ajuda">Ligue à conta da pessoa: ela passa a ver todas as vendas no nome dela (inclusive as que você lançar) e a comissão.</span></label>
        ${x ? `<label class="check-row"><input type="checkbox" id="vend-ativo" ${x.ativo ? 'checked' : ''}><span><b>Ativo</b><small>Desmarque se a pessoa saiu. As vendas antigas continuam no nome dela.</small></span></label>` : ''}
        <p class="erro-msg hidden" id="vend-erro"></p>
        <button class="btn prim bloco grande" type="submit">${x ? 'Salvar' : 'Adicionar vendedor'}</button>
      </form>`, {
      aoAbrir: (f, fechar) => {
        const form = $('#f-vend', f);
        sb.from('membros').select('user_id, nome, papel').eq('loja_id', S.loja.id).order('nome').then(({ data }) => {
          const usados = (S.vendedores || []).filter((v) => v.user_id && (!x || v.id !== x.id)).map((v) => v.user_id);
          form.conta.innerHTML = '<option value="">Sem conta (só cadastro)</option>' + (data || []).filter((m) => !usados.includes(m.user_id))
            .map((m) => `<option value="${m.user_id}" ${x && x.user_id === m.user_id ? 'selected' : ''}>${esc(m.nome)} · ${NOME_PAPEL[m.papel] || ''}</option>`).join('');
        });
        form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const erro = $('#vend-erro', f);
          const nome = form.nome.value.trim();
          const pctV = parseMoney(form.pct.value);
          if (!nome) { erro.textContent = 'Digite o nome.'; erro.classList.remove('hidden'); return; }
          if (pctV < 0 || pctV > 100) { erro.textContent = 'A comissão vai de 0 a 100%.'; erro.classList.remove('hidden'); return; }
          const dados = { nome, comissao_pct: pctV };
          if (x) dados.ativo = $('#vend-ativo', f).checked;
          if (form.conta.options.length > 1 || form.conta.value) dados.user_id = form.conta.value || null;
          await ocupado(form.querySelector('button[type=submit]'), async () => {
            try {
              if (x) await run(sb.from('vendedores').update(dados).eq('id', x.id));
              else await run(sb.from('vendedores').insert(Object.assign({ loja_id: S.loja.id }, dados)));
              fechar();
              toast(x ? 'Vendedor salvo.' : 'Vendedor adicionado.');
              if (aoSalvar) aoSalvar();
            } catch (err) { erro.textContent = msgErro(err); erro.classList.remove('hidden'); }
          });
        });
      }
    });
  }

  // MAIS (menu do celular)
  TELAS.mais = function (v) {
    const itens = [
      ['#/clientes', ic.users, 'Clientes', 'Cadastro, sumidos, aniversariantes'],
      ['#/vendas', ic.receipt, 'Vendas', 'Histórico, detalhes e cancelamentos'],
      ...(dono() ? [['#/despesas', ic.wallet, 'Despesas e lucro', 'Aluguel, contas e quanto sobra']] : []),
      ['#/ajustes', ic.sliders, 'Loja e equipe', 'Dados da loja, meta, convite da equipe']
    ];
    v.innerHTML = `<div class="page-head"><div><h1>Mais</h1><p class="sub">${esc(S.loja.nome)}</p></div></div>
      <div class="card" style="padding:4px 14px"><div class="lista">${itens.map(([h, i, t, s]) => `<a class="item" href="${h}"><div class="avatar cinza">${i.replace('<svg', '<svg style="width:20px;height:20px"')}</div><div class="grow"><div class="tit">${t}</div><div class="sub">${s}</div></div>${ic.chevRight.replace('<svg', '<svg style="width:18px;height:18px;color:var(--ink-3)"')}</a>`).join('')}
        <button class="item" type="button" id="mais-sair"><div class="avatar cinza">${ic.logout.replace('<svg', '<svg style="width:20px;height:20px"')}</div><div class="grow"><div class="tit">Sair da conta</div><div class="sub">${esc(S.user.email)}</div></div></button>
      </div></div>
      <p class="tiny faint" style="text-align:center;margin-top:18px">Foresee ${esc(CFG.versao || '')}</p>`;
    $('#mais-sair').addEventListener('click', sair);
  };

  // ------------------------------------------------------------------
  // Início do app
  // ------------------------------------------------------------------
  window.addEventListener('hashchange', rotear);
  window.addEventListener('scroll', () => {
    const t = $('#topbar');
    if (t) t.classList.toggle('scrolled', window.scrollY > 4);
  }, { passive: true });
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; });

  sb.auth.onAuthStateChange((evento, sessao) => {
    if (evento === 'PASSWORD_RECOVERY') {
      recuperando = true;
      S.user = sessao ? sessao.user : null;
      setTimeout(telaNovaSenha, 0);
    } else if (evento === 'SIGNED_OUT') {
      if (S.loja) { limparEstado(); setTimeout(() => telaLogin(), 0); }
    } else if (sessao && sessao.user) {
      S.user = sessao.user;
    }
  });

  async function iniciar() {
    S.ocultar = LS.get('ocultar', false);
    document.body.classList.toggle('ocultar', S.ocultar);
    let sessao = null;
    try { sessao = (await sb.auth.getSession()).data.session; } catch (e) { sessao = null; }
    if (recuperando) return;
    if (!sessao) { telaLogin(); return; }
    S.user = sessao.user;
    await entrarNoApp();
  }

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
  iniciar();
})();
