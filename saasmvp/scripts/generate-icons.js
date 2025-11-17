#!/usr/bin/env node

/**
 * Script para gerar ícones PWA
 * Requer: Node.js 18+
 * 
 * Uso:
 *   npm run generate-icons
 *   
 * Ou diretamente:
 *   node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Cores do branding
const BRAND_DARK = '#1C1C1E';
const BRAND_GOLD = '#D4AF37';

// Mensagens de ajuda
const help = `
📱 Gerador de Ícones PWA - Gestão 360

REQUERIMENTOS:
  - sharp (npm install sharp)
  - canvas/node-canvas (opcional)

INSTRUÇÃO ALTERNATIVA (Recomendado):
  
  1. Use uma ferramenta online:
     https://www.favicon-generator.org/
     https://realfavicongenerator.net/
  
  2. Ou use PWA Asset Generator:
     npm install -g pwa-asset-generator
     pwa-asset-generator ./logo.png ./public/icons -b "${BRAND_DARK}" -p 0%

MANUAL:

  1. Crie um arquivo logo.png (512x512 pixels mínimo)
  
  2. Instale sharp:
     npm install --save-dev sharp
  
  3. Execute:
     node scripts/generate-icons.js ./logo.png
  
ARQUIVOS GERADOS:

  ✓ public/icons/icon-192x192.png
  ✓ public/icons/icon-192x192-maskable.png  
  ✓ public/icons/icon-512x512.png
  ✓ public/icons/icon-512x512-maskable.png
  ✓ public/icons/shortcut-dashboard.png
  ✓ public/icons/shortcut-appointments.png
  ✓ public/icons/shortcut-finance.png
  ✓ public/icons/mstile-150x150.png
`;

async function generateIcons(sourcePath) {
  try {
    const sharp = require('sharp');

    if (!fs.existsSync(sourcePath)) {
      console.error(`❌ Arquivo não encontrado: ${sourcePath}`);
      console.log(help);
      process.exit(1);
    }

    const iconsDir = path.join(__dirname, '../public/icons');
    const screenshotsDir = path.join(__dirname, '../public/screenshots');

    // Crie os diretórios se não existirem
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    console.log('🎨 Gerando ícones PWA...\n');

    // 192x192 normal
    await sharp(sourcePath)
      .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconsDir, 'icon-192x192.png'));
    console.log('✅ icon-192x192.png');

    // 192x192 maskable
    await sharp(sourcePath)
      .resize(108, 108, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 42,
        bottom: 42,
        left: 42,
        right: 42,
        background: { r: 212, g: 175, b: 55, alpha: 1 }, // brand-gold
      })
      .png()
      .toFile(path.join(iconsDir, 'icon-192x192-maskable.png'));
    console.log('✅ icon-192x192-maskable.png');

    // 512x512 normal
    await sharp(sourcePath)
      .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(iconsDir, 'icon-512x512.png'));
    console.log('✅ icon-512x512.png');

    // 512x512 maskable
    await sharp(sourcePath)
      .resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 116,
        bottom: 116,
        left: 116,
        right: 116,
        background: { r: 212, g: 175, b: 55, alpha: 1 },
      })
      .png()
      .toFile(path.join(iconsDir, 'icon-512x512-maskable.png'));
    console.log('✅ icon-512x512-maskable.png');

    // Shortcuts
    const shortcuts = [
      'shortcut-dashboard.png',
      'shortcut-appointments.png',
      'shortcut-finance.png',
    ];

    for (const shortcut of shortcuts) {
      await sharp(sourcePath)
        .resize(96, 96, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toFile(path.join(iconsDir, shortcut));
      console.log(`✅ ${shortcut}`);
    }

    // Tile para Windows
    await sharp(sourcePath)
      .resize(150, 150, { fit: 'contain', background: { r: 28, g: 28, b: 30, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, 'mstile-150x150.png'));
    console.log('✅ mstile-150x150.png');

    console.log('\n✨ Ícones gerados com sucesso!');
    console.log(`📁 Salvos em: ${iconsDir}`);

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('❌ Erro: sharp não está instalado\n');
      console.log('Instale com:');
      console.log('  npm install --save-dev sharp\n');
    }
    console.error('Erro:', error.message);
    process.exit(1);
  }
}

// Main
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(help);
  process.exit(0);
}

if (args.length === 0) {
  console.log(help);
  process.exit(1);
}

generateIcons(args[0]).catch(error => {
  console.error(error);
  process.exit(1);
});
