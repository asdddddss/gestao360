# 📱 Guia de Instalação PWA - Gestão 360

Esta documentação explica como instalar e usar a aplicação Gestão 360 como um aplicativo nativo em seus dispositivos Android e iOS.

## O que é PWA?

Uma Progressive Web App (PWA) é uma aplicação web que funciona como um aplicativo nativo. Oferece:
- ✅ Funcionalidade offline
- ✅ Acesso rápido desde a tela inicial
- ✅ Notificações push
- ✅ Sincronização em background
- ✅ Experiência similar a apps nativos

## Instalação em Android

### Opção 1: Chrome (Recomendado)

1. **Abra o Chrome** e acesse a URL da sua aplicação Gestão 360
2. **Toque no menu** (⋮) no canto superior direito
3. **Selecione "Instalar app"** ou "Adicionar à tela inicial"
4. **Confirme a instalação** tocando em "Instalar"
5. **Pronto!** O app aparecerá na sua tela inicial como um ícone normal

### Opção 2: Firefox

1. **Abra o Firefox** e acesse a URL do Gestão 360
2. **Toque no menu** (⋮) no canto inferior direito
3. **Selecione "Instalar"**
4. **Confirme tocando em "Adicionar"**

### Opção 3: Microsoft Edge

1. **Abra o Edge** e acesse a aplicação
2. **Toque no menu** (⋮) no canto superior direito
3. **Selecione "Apps"** → **"Instalar este site como um app"**
4. **Confirme a instalação**

### Características no Android

- 📌 **Atalhos rápidos**: Acesse diretamente Dashboard, Agendamentos e Finanças
- 🔄 **Sincronização automática**: Dados sincronizam em background
- 📴 **Funciona offline**: Acesse dados em cache quando offline
- 🔔 **Notificações**: Receba notificações de agendamentos e finanças

---

## Instalação em iOS

### Requisitos
- iOS 11.3 ou superior
- Safari (recomendado) ou outro navegador que suporte PWA

### Passos para Instalar

1. **Abra o Safari** e acesse a URL do Gestão 360
2. **Toque no ícone "Compartilhar"** (quadrado com seta) na barra inferior
3. **Role para baixo** e toque em **"Adicionar à Tela Inicial"**
4. **Dê um nome** para o app (padrão: "Gestão 360")
5. **Toque em "Adicionar"** no canto superior direito
6. **Pronto!** O app aparecerá em sua tela inicial

### Limitações no iOS

⚠️ **Importante**: iOS tem algumas limitações em relação ao Android:
- Notificações push não são suportadas no iOS como PWA
- Sincronização em background é limitada
- Alguns recursos de cache avançados podem não funcionar

### Recomendação para iOS

Para melhor experiência no iOS, considere:
1. Usar a PWA para acesso rápido e funcionalidades offline
2. Instalar via TestFlight se disponível
3. Usar o navegador Safari para melhor suporte

---

## Primeiro Uso

### Permissões Necessárias

Na primeira vez que abrir o app, pode ser solicitada permissão para:
- 📍 **Localização**: Para agendamentos baseados em local
- 📢 **Notificações**: Para alertas de agendamentos e finanças
- 💾 **Armazenamento**: Para cache offline

**Recomendamos permitir** todas as permissões para melhor funcionalidade.

### Conectando à Sua Conta

1. Abra o app Gestão 360
2. Faça login com suas credenciais
3. Os dados serão sincronizados automaticamente
4. O app cacheará os dados para acesso offline

---

## Funcionalidades Offline

### O que funciona offline?

✅ **Disponível offline:**
- Visualizar agendamentos em cache
- Visualizar clientes e profissionais
- Visualizar histórico de transações
- Acessar relatórios anteriormente carregados

❌ **Requer internet:**
- Criar novo agendamento
- Editar dados
- Fazer transações
- Sincronizar novos dados

### Sincronização Automática

Quando você conectar à internet novamente:
1. Dados offline serão sincronizados automaticamente
2. Novos dados serão baixados
3. Uma notificação confirmará a sincronização

---

## Gerenciamento do App

### Atualizar o App

O app se atualiza automaticamente. Se uma atualização estiver disponível:
1. Você verá uma notificação **"Atualização Disponível"**
2. Toque em **"Atualizar Agora"** para instalar
3. O app será atualizado sem perder dados

### Desinstalar

**Android:**
1. Pressione e segure o ícone do app
2. Selecione "Remover" ou "Desinstalar"

**iOS:**
1. Pressione e segure o ícone do app
2. Selecione "Remover App"
3. Confirme a remoção

### Limpar Cache

Se tiver problemas:
1. Abra a aplicação
2. Vá para **Configurações → Sobre → Limpar Cache**
3. Ou desinstale e reinstale o app

---

## Solução de Problemas

### O app não aparece na opção de instalar

- ✅ Tente usar o Chrome ou Firefox (melhor suporte)
- ✅ Certifique-se de usar HTTPS (conexão segura)
- ✅ Recarregue a página (F5 ou puxe para atualizar)

### Dados não sincronizam

- ✅ Verifique sua conexão com a internet
- ✅ Tente reabrir o app
- ✅ Limpe o cache da aplicação
- ✅ Atualize para a versão mais recente

### App não abre

- ✅ Force fechamento: Configurações → Aplicativos → Gestão 360 → Forçar Parada
- ✅ Limpe dados do app: Configurações → Aplicativos → Gestão 360 → Armazenamento → Limpar Dados
- ✅ Reinstale o app

### Funcionalidades não funcionam

- ✅ Verifique permissões: Configurações → Aplicativos → Gestão 360 → Permissões
- ✅ Certifique-se de estar conectado à internet
- ✅ Tente fazer logout e login novamente

---

## Performance e Armazenamento

### Tamanho do App

- Tamanho inicial: ~5-10 MB
- Aumenta conforme dados são cacheados (até 50 MB máximo)

### Otimizando Performance

1. **Limpe cache regularmente** de dados antigos
2. **Desabilite notificações** se não precisar
3. **Use WiFi** para sincronizar grandes volumes de dados
4. **Atualize regularmente** para melhorias de performance

---

## Comparação: PWA vs App Nativo

| Recurso | PWA | App Nativo (iOS/Android) |
|---------|-----|-------------------------|
| Instalação | Rápida (direto do navegador) | Loja de apps |
| Tamanho | Menor (~10MB) | Maior (~50-200MB) |
| Atualização | Automática | Manual pela loja |
| Offline | Suportado | Suportado |
| Custo | Gratuito | Pode ter taxas |
| Notificações | Android ✅ iOS ⚠️ | ✅ Completo |
| Performance | Muito bom | Otimizado |

---

## Dicas e Truques

### Atalhos Rápidos (Android)

Pressione e segure o ícone do app para acessar atalhos diretos:
- 📊 Dashboard
- 📅 Agendamentos
- 💰 Finanças

### Sincronização Inteligente

O app sincroniza automaticamente:
- **A cada hora**: Verifica atualizações
- **Ao abrir**: Sincroniza dados críticos
- **Ao conectar WiFi**: Sincroniza grandes volumes

### Modo Escuro

O app respeita as preferências de tema do seu dispositivo:
- Android: Configurações → Display → Tema escuro
- iOS: Configurações → Display e Brilho → Modo Escuro

---

## Privacidade e Segurança

### Dados em Cache

- Dados são cacheados localmente no seu dispositivo
- Ninguém tem acesso exceto você
- Para limpar, desinstale o app ou use "Limpar Cache"

### Conexão Segura

- Todas as conexões usam HTTPS (🔒)
- Dados transmitidos são criptografados
- Sua senha nunca é salva localmente

---

## Suporte

Se encontrar problemas:

1. **Verifique este guia** - Pode estar em "Solução de Problemas"
2. **Limpe cache e reabra** - Resolve 80% dos problemas
3. **Contate suporte**: suporte@gestao360.com
4. **Descreva o problema**: Dispositivo, navegador, versão do iOS/Android

---

## Atualizações e Melhorias

Esperamos adicionar em breve:
- 📧 Notificações por email
- 📲 Sincronização em background mais robusta
- 🗣️ Suporte para compartilhamento de dados
- 🌍 Sincronização em nuvem

---

**Última atualização:** Novembro 2025
**Versão do App:** 0.0.0
