# LP Projem — versão com formulário em etapas separadas

Esta versão mantém a seção inicial escura, os ícones flutuantes, a janela de projetos e o loop de clientes.

A correção principal foi no formulário: as etapas foram separadas por função, sem misturar escolhas por clique com preenchimento de dados.

## Formulário

1. Demanda — apenas escolha por clique.
2. Ambiente — apenas escolha por clique.
3. Prioridade — apenas escolha por clique.
4. Contato — apenas campos de preenchimento.
5. Confirmação — revisão e envio.

A frase repetida que poluía todas as etapas foi removida. Cada etapa agora tem título e instrução própria.

## Página

- Mantida a seção inicial original.
- Mantido o loop de clientes sem alteração estrutural.
- Mantida a seção branca de diagnóstico.
- Adicionada uma nova seção branca antes do rodapé.
- Mantida a página `/privacidade`.
- Mantido endpoint seguro `/api/lead` via Netlify Function.
- Mantido modo simulado local no `npm run dev` quando `MAKE_WEBHOOK_URL` não estiver configurado.

## Rodar localmente

```bash
npm install
npm run dev
```

## Produção no Netlify

Configure a variável server-side:

```env
MAKE_WEBHOOK_URL=https://hook.us2.make.com/SEU_WEBHOOK_NOVO
```

Não use `VITE_MAKE_WEBHOOK_URL`.

## Ajuste adicional

- A seção "Como o trabalho avança" foi convertida para fundo branco, mantendo os cards de processo com contraste leve.
- A última seção branca antes do rodapé foi transformada em uma seção de perguntas frequentes com `<details>` e `<summary>`, sem JavaScript adicional.
