# 🚀 Gestão 360 - PWA (Progressive Web App)

Transformamos o Gestão 360 em uma Progressive Web App completa que funciona como aplicativo nativo em Android, iOS e desktop!

## ✨ Características

### 🎯 Funcionalidades PWA

- ✅ **Instalação um clique**: Instale como app nativo diretamente do navegador
- 📴 **Modo Offline**: Funciona sem internet com dados em cache
- 🔄 **Sincronização Automática**: Sincroniza em background quando conectar à internet
- 🔔 **Notificações**: Receba alertas de agendamentos (Android)
- ⚡ **Performance**: Carregamento ultrarrápido com cache inteligente
- 📱 **Responsivo**: Perfeito em mobile, tablet e desktop
- 🔒 **Seguro**: HTTPS obrigatório, dados criptografados

### 🎨 Design Responsivo

- Otimizado para todos os tamanhos de tela
- Interface touch-friendly
- Suporte para tema escuro/claro
- Ícones e atalhos personalizados

## 📲 Instalação Rápida

### Android

1. Abra em **Chrome**, **Firefox** ou **Edge**
2. Toque no menu (⋮) → **Instalar app**
3. Pronto! O app aparecerá na sua tela inicial

### iOS

1. Abra em **Safari**
2. Toque no ícone **Compartilhar** → **Adicionar à Tela Inicial**
3. Pronto! O app está na sua tela inicial

### Desktop (Windows/Mac/Linux)

1. Abra em **Chrome** ou **Edge**
2. Clique no ícone de instalação na barra de endereço (ou menu)
3. Clique em **Instalar**
4. O app abre em janela própria

## 🛠️ Desenvolvimento

### Requisitos

- Node.js 18+
- npm ou yarn
- Git

### Setup

```bash
# Clone o repositório
git clone <seu-repositorio>
cd saasmvp

# Instale dependências
npm install

# Execute em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`

### Build para Produção

```bash
npm run build
```

Gera arquivos otimizados em `dist/`:
- `sw.js` - Service Worker
- `manifest.json` - Configurações PWA
- Arquivos comprimidos e otimizados

### Preview da Build

```bash
npm run preview
```

## 📂 Estrutura de Arquivos PWA

```
saasmvp/
├── public/
│   ├── manifest.json           # Configurações PWA
│   ├── browserconfig.xml       # Config Windows
│   ├── robots.txt              # SEO
│   ├── icons/                  # Ícones (192, 512, maskable, etc)
│   └── screenshots/            # Screenshots da PWA
├── src/
│   ├── service-worker.ts       # Service Worker
│   ├── hooks/
│   │   └── useServiceWorker.ts # Hook para gerenciar SW
│   ├── components/
│   │   └── PWAUpdatePrompt.tsx # Notificação de atualização
│   └── ... (resto da aplicação)
├── vite.config.ts             # Config com plugin PWA
├── index.html                 # Meta tags PWA
├── PWA_SETUP_GUIDE.md         # Guia de configuração
└── PWA_INSTALLATION_GUIDE.md  # Guia do usuário
```

## 🔧 Configuração

### Ícones

Você precisa adicionar ícones em `public/icons/`:

```
icons/
├── icon-192x192.png              # 192x192 px
├── icon-192x192-maskable.png     # 192x192 com margem
├── icon-512x512.png              # 512x512 px
├── icon-512x512-maskable.png     # 512x512 com margem
├── shortcut-dashboard.png        # 96x96 px
├── shortcut-appointments.png     # 96x96 px
├── shortcut-finance.png          # 96x96 px
└── mstile-150x150.png           # 150x150 px (Windows)
```

**Gerar ícones automaticamente:**

```bash
npm install -g pwa-asset-generator

# Gere a partir de um logo (512x512 PNG)
pwa-asset-generator ./logo.png ./public/icons -b "#1C1C1E" -p 0%
```

### Service Worker

Configurado em `src/service-worker.ts` com estratégias:

- **Network First**: API Supabase (tenta internet, fallback cache)
- **Cache First**: Imagens e assets
- **Stale While Revalidate**: JS, CSS (serve cache, atualiza em background)

### Manifest

Configuração automática via `vite-plugin-pwa`. Customizável em `vite.config.ts`:

```typescript
manifest: {
  name: 'Gestão 360',
  short_name: 'Gestão 360',
  description: 'Sistema de gestão',
  theme_color: '#D4AF37',
  background_color: '#1C1C1E',
  display: 'standalone',
  // ...
}
```

## 🚀 Deploy

### Vercel (Recomendado - Gratuito)

```bash
npm i -g vercel
vercel
```

Vantagens:
- HTTPS automático
- Deploy em cada push
- CDN global
- Grátis

### Netlify

```bash
npm i -g netlify-cli
netlify deploy --prod
```

### Servidor Próprio (Nginx)

```nginx
# Habilite compressão e cache correto
gzip on;
gzip_types text/plain text/css application/json application/javascript;

location /sw.js {
  add_header Cache-Control "public, max-age=0, must-revalidate";
  add_header Service-Worker-Allowed "/";
}

location /manifest.json {
  add_header Cache-Control "public, max-age=3600";
}

location ~ \.(js|css)$ {
  add_header Cache-Control "public, max-age=31536000, immutable";
}
```

## ✅ Verificação

### Checklist PWA

- [ ] HTTPS ativado
- [ ] `manifest.json` válido
- [ ] Service Worker registrado
- [ ] Ícones presentes (192x192, 512x512)
- [ ] Meta tags no HTML
- [ ] Responsivo
- [ ] Funciona offline

### Ferramentas de Teste

1. **Chrome Lighthouse**: DevTools → Lighthouse → Analyze (deve ter 90+)
2. **PWA Builder**: https://www.pwabuilder.com
3. **Web.dev**: https://web.dev/measure

## 📚 Documentação

- **Guia de Instalação**: `PWA_INSTALLATION_GUIDE.md` (para usuários finais)
- **Guia de Setup**: `PWA_SETUP_GUIDE.md` (para desenvolvedores)
- **PWA.rocks**: https://pwa.rocks (exemplos e inspiração)

## 🐛 Solução de Problemas

### Service Worker não registra

```javascript
// Verifique no console
navigator.serviceWorker.getRegistrations().then(regs => console.log(regs));
```

### Cache problemático

```javascript
// Limpe cache manualmente
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});
```

### Não instala

- Verifique HTTPS (obrigatório)
- Confirme `manifest.json` válido
- Teste em Chrome antes de outros navegadores

## 🤝 Contribuir

Para melhorias da PWA:

1. Crie uma branch: `git checkout -b feature/melhoria`
2. Commit: `git commit -m "Add: melhoria"`
3. Push: `git push origin feature/melhoria`
4. Abra PR

## 📄 Licença

MIT - Use livremente!

## 🎯 Roadmap

- [ ] Notificações push melhoradas
- [ ] Compartilhamento de dados via PWA
- [ ] Modo offline mais robusto
- [ ] Sync background avançado
- [ ] Web Share API integrada
- [ ] Installable banner customizado

## 📞 Suporte

- **Documentação**: Veja `PWA_INSTALLATION_GUIDE.md`
- **Issues**: Reporte bugs via GitHub
- **Email**: suporte@gestao360.com

---

**Versão:** 0.0.0  
**Última atualização:** Novembro 2025  
**Status:** ✅ Production Ready

Desenvolvido com ❤️ para funcionar em qualquer dispositivo!
