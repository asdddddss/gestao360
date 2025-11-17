# 🚀 Configuração e Deploy da PWA Gestão 360

## Requisitos

- Node.js 18+ 
- npm ou yarn
- Git

## Instalação Local

### 1. Instale as Dependências

```bash
cd saasmvp
npm install
```

### 2. Execute em Desenvolvimento

```bash
npm run dev
```

A aplicação será disponível em `http://localhost:3000`

## Build para Produção

### Compilar a Aplicação

```bash
npm run build
```

Isso gerará:
- Arquivos otimizados em `dist/`
- Service Worker em `dist/sw.js`
- Manifest em `dist/manifest.json`

### Preview da Build

```bash
npm run preview
```

Isso abre um servidor local com a versão otimizada.

## Preparação dos Ícones

Para funcionar corretamente como PWA, você precisa dos seguintes ícones:

### Estrutura de Pastas

```
public/
├── icons/
│   ├── icon-192x192.png (192x192 pixels)
│   ├── icon-192x192-maskable.png (192x192 pixels, com margem)
│   ├── icon-512x512.png (512x512 pixels)
│   ├── icon-512x512-maskable.png (512x512 pixels, com margem)
│   ├── shortcut-dashboard.png (96x96 pixels)
│   ├── shortcut-appointments.png (96x96 pixels)
│   ├── shortcut-finance.png (96x96 pixels)
│   └── mstile-150x150.png (150x150 pixels - para Windows)
├── screenshots/
│   ├── screenshot-540x720.png (para dispositivos narrow)
│   └── screenshot-1280x720.png (para dispositivos wide)
└── manifest.json
```

### Como Criar os Ícones

**Opção 1: Online (Recomendado para começar)**

Use ferramentas online gratuitas:
- [Favicon Generator](https://www.favicon-generator.org/)
- [PWA Asset Generator](https://github.com/GoogleChromeLabs/pwa-asset-generator)

**Opção 2: Usando PWA Asset Generator (CLI)**

```bash
# Instale globalmente
npm install -g pwa-asset-generator

# Gere os ícones a partir de uma imagem
pwa-asset-generator ./logo.png ./public/icons -b "#1C1C1E" -p 0% --padding "0%"
```

**Opção 3: Design Profissional**

Contrate um designer para criar:
- Logo com 512x512 pixels
- Versões maskable (com margem segura)
- Screenshots de app

### Especificações dos Ícones

#### Ícones Básicos (192x192 e 512x512)
- **Cor fundo**: Transparente (PNG)
- **Formato**: PNG
- **Conteúdo**: Logo centralizado

#### Ícones Maskable
- **Cor fundo**: Transparente (PNG)
- **Margem segura**: 45% do tamanho (espaço em branco)
- **Logo**: Centralizado em 55% da área
- **Uso**: Android personalizará o formato do ícone

#### Screenshots
- **Tamanho narrow**: 540x720 pixels (mobile)
- **Tamanho wide**: 1280x720 pixels (tablet)
- **Formato**: PNG ou WEBP
- **Conteúdo**: Captures do app em uso

#### Favicon
- **Tamanho**: 16x16, 32x32, 64x64 pixels
- **Formato**: ICO ou PNG
- **Arquivo**: `public/favicon.ico`

## Deploy

### Hospedagem Recomendada para PWA

#### 1. **Vercel** (Recomendado - Gratuito)

```bash
# Instale o Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Vantagens:
- Deploy automático em cada push para Git
- HTTPS automático (obrigatório para PWA)
- CDN global rápido
- Grátis para projetos públicos

#### 2. **Netlify**

```bash
# Instale o Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### 3. **Azure Static Web Apps**

```bash
# Siga a documentação oficial:
# https://docs.microsoft.com/en-us/azure/static-web-apps/
```

#### 4. **AWS Amplify**

```bash
# Instale a CLI
npm i -g @aws-amplify/cli

# Configure e deploy
amplify init
amplify publish
```

### Configuração de Servidor (Nginx/Apache)

**Nginx:**

```nginx
server {
    listen 443 ssl http2;
    server_name gestao360.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Cache busting para service worker
    location /sw.js {
        add_header Cache-Control "public, max-age=0, must-revalidate";
        add_header Service-Worker-Allowed "/";
    }

    # Cache de manifesto
    location /manifest.json {
        add_header Cache-Control "public, max-age=3600";
        add_header Content-Type "application/manifest+json";
    }

    # Cache de ícones
    location /icons/ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Assets com hash
    location ~ \.(js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Serve index.html para SPA
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=0, must-revalidate";
    }
}
```

**Apache:**

```apache
# Habilite mod_rewrite
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Service Worker
    <FilesMatch "^sw\.js$">
        Header set Cache-Control "public, max-age=0, must-revalidate"
        Header set Service-Worker-Allowed "/"
    </FilesMatch>

    # Manifest
    <FilesMatch "^manifest\.json$">
        Header set Cache-Control "public, max-age=3600"
    </FilesMatch>

    # Ícones
    <Directory "icons">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </Directory>

    # Assets com hash
    <FilesMatch "\.(js|css)$">
        Header set Cache-Control "public, max-age=31536000, immutable"
    </FilesMatch>

    # SPA routing
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [QSA,L]
</IfModule>
```

## Verificação da PWA

### Checklist de Validação

- [ ] HTTPS funcionando (essencial)
- [ ] `manifest.json` válido
- [ ] `service-worker.js` registrado
- [ ] Ícones presentes em todas as resoluções
- [ ] Meta tags no HTML corretas
- [ ] Aplicação responsiva
- [ ] Funciona offline
- [ ] Notificações funcionam (Android)

### Ferramentas de Teste

#### 1. Chrome DevTools

1. Abra DevTools (F12)
2. Vá para a aba **Lighthouse**
3. Clique em **Analyze page load**
4. Verificar resultado PWA (deve ter 90+ pontos)

#### 2. PWA Builder

Acesse: https://www.pwabuilder.com/
- Upload da URL
- Gera relatório completo
- Sugere melhorias

#### 3. Web.dev Measure

Acesse: https://web.dev/measure/
- Analisa performance
- Verifica PWA
- Dá recomendações

## Monitoramento

### Analytics

Adicione Google Analytics ao `index.html`:

```html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Tracking

Use Sentry para monitorar erros:

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

## Troubleshooting

### Service Worker não registra

- Verifique HTTPS (necessário)
- Abra DevTools → Application → Service Workers
- Verifique console para erros

### Ícones não aparecem

- Verifique caminho em `public/icons/`
- Regenere os ícones
- Limpe cache do navegador

### Aplicação não funciona offline

- Verifique `service-worker.ts`
- Confirme caching configurado
- Teste offline: DevTools → Network → Offline

### Build falha

```bash
# Limpe node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

**Documentação completa em:** https://web.dev/progressive-web-apps/
