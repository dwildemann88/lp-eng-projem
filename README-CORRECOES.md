# LP Projem — ajustes finais

Versão ajustada conforme revisão:

- Removido apenas o texto da seção de diagnóstico: "análise técnica / Quando a elétrica precisa entrar no planejamento".
- Mantidos os cards de diagnóstico.
- Recolocada a seção "Como o trabalho avança".
- Títulos das seções "controle de execução" e "Como o trabalho avança" centralizados.
- FAQ refinado com leitura mais leve, contraste otimizado e animação premium de abertura/fechamento.
- Botão "Usar localização" mantido em preto no formulário.
- Adicionado botão flutuante verde de contato, fixo no canto inferior direito, com brilho externo, pulso leve e balão fechável "Fale com um especialista".
- Cabeçalho atualizado com link para Processo.
- Build testado com `npm run build`.

## Produção

Configure no Netlify:

```env
MAKE_WEBHOOK_URL=https://hook.us2.make.com/SEU_WEBHOOK_NOVO
```

Não coloque webhook em variáveis `VITE_`.

## Atualização de contato e mensuração

- Todos os atalhos e mensagens de WhatsApp usam o número fixo `555584710193`.
- O telefone exibido no rodapé foi atualizado para `+55 55 8471-0193`.
- Meta Pixel `1056392687339546` instalado diretamente no `<head>` com evento `PageView` e fallback `<noscript>`.
- Eventos de geração de lead e clique no WhatsApp continuam enviados como `Lead` e `Contact` pelo módulo de tracking.
- O código `TEST99830` não integra o JavaScript do Pixel; ele é reservado para testes temporários de eventos enviados pela Conversions API.
