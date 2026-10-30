# Foresee

Gestão para lojas de moda: vendas (caixa), produtos com grade de tamanho e cor, estoque, clientes, despesas e lucro.
Feito para várias lojas: cada loja cria a própria conta e só enxerga os próprios dados.

- **App:** arquivos desta pasta (HTML + JS, sem build). Publicado pelo GitHub Pages.
- **Banco e login:** Supabase. A estrutura completa está em `schema.sql` (pode rodar de novo no SQL Editor do Supabase sem perder dados).
- **Segurança:** a chave em `config.js` é a chave pública do Supabase. Quem protege os dados são as regras do banco (Row Level Security): cada pessoa só vê a loja em que é dono ou equipe.

## Papéis

- **Dono:** tudo, inclusive custo, lucro, despesas, cancelar venda e convidar a equipe.
- **Equipe:** vende, cadastra produtos e clientes. Não vê custo, lucro nem despesas.

## Atualizar o app

Troque o número da versão em `index.html`, `config.js` e `sw.js` (ex.: 1.0.0 → 1.0.1) para o celular baixar a versão nova.
