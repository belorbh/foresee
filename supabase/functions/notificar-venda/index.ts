// Foresee · notificação de venda (Edge Function do Supabase)
// GET  → devolve a chave pública do push (cria as chaves na primeira vez)
// POST { venda_id } → avisa dono e gerentes da loja: "Venda aprovada! Valor: R$ X – Forma"
// POST { teste: true } → manda uma notificação de teste só para os aparelhos de quem pediu
import { createClient } from "npm:@supabase/supabase-js@2.117.3";
import webpush from "npm:web-push@3.6.7";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false },
});

async function chaves() {
  const { data } = await admin.from("push_config").select("public_key, private_key").eq("id", 1).maybeSingle();
  if (data) return data;
  const k = webpush.generateVAPIDKeys();
  await admin.from("push_config").insert({ id: 1, public_key: k.publicKey, private_key: k.privateKey });
  const { data: d2, error } = await admin.from("push_config").select("public_key, private_key").eq("id", 1).single();
  if (error) throw error;
  return d2;
}

const brl = (v: unknown) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v) || 0).replace(/ /g, " ");
const FORMA: Record<string, string> = { "Crédito": "Cartão de crédito", "Débito": "Cartão de débito" };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const k = await chaves();
    if (req.method === "GET") return json({ publicKey: k.public_key });

    const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: u } = await admin.auth.getUser(token);
    if (!u?.user) return json({ erro: "Faça login novamente." }, 401);
    const body = await req.json().catch(() => ({}));

    let payload: Record<string, unknown>;
    let alvo: Array<{ endpoint: string; p256dh: string; auth: string }> = [];
    if (body.teste) {
      payload = { title: "Venda aprovada!", body: "Valor: R$ 39,99 – Cartão de crédito (teste)", tag: "teste", url: "./#/vendas" };
      const { data } = await admin.from("push_inscricoes").select("endpoint, p256dh, auth").eq("user_id", u.user.id);
      alvo = data || [];
    } else {
      const { data: v } = await admin.from("vendas")
        .select("id, loja_id, total, forma_pagamento, parcelas, status").eq("id", body.venda_id).maybeSingle();
      if (!v) return json({ erro: "Venda não encontrada." }, 404);
      const { data: m } = await admin.from("membros").select("papel").eq("loja_id", v.loja_id).eq("user_id", u.user.id).maybeSingle();
      if (!m) return json({ erro: "Sem acesso." }, 403);
      const forma = (FORMA[v.forma_pagamento] || v.forma_pagamento) +
        (v.forma_pagamento === "Crédito" && v.parcelas > 1 ? ` ${v.parcelas}x` : "");
      payload = { title: "Venda aprovada!", body: `Valor: ${brl(v.total)} – ${forma}`, tag: "venda-" + v.id, url: "./#/vendas" };
      const { data: equipe } = await admin.from("membros").select("user_id").eq("loja_id", v.loja_id).in("papel", ["dono", "gerente"]);
      const ids = (equipe || []).map((x) => x.user_id);
      if (ids.length) {
        const { data } = await admin.from("push_inscricoes").select("endpoint, p256dh, auth").eq("loja_id", v.loja_id).in("user_id", ids);
        alvo = data || [];
      }
    }

    webpush.setVapidDetails("https://belorbh.github.io/foresee/", k.public_key, k.private_key);
    const vistos = new Set<string>();
    let enviados = 0;
    await Promise.all(alvo.filter((s) => !vistos.has(s.endpoint) && vistos.add(s.endpoint)).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload), { TTL: 3600, urgency: "high" });
        enviados++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) await admin.from("push_inscricoes").delete().eq("endpoint", s.endpoint);
      }
    }));
    return json({ enviados, aparelhos: vistos.size });
  } catch (e) {
    return json({ erro: String((e as Error)?.message || e) }, 500);
  }
});
