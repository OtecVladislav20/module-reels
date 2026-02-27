import fs from 'node:fs';
import path from 'node:path';
import { optimize } from 'svgo';
const ROOT = path.resolve('.');

const BUFFER_FILE = path.join(ROOT, 'public/images/icons/icons.inbox.svg');
const ICONS_DIR = path.join(ROOT, 'public/images/icons/mono');
const GENERATED_SCSS = path.join(ROOT, 'src/styles/_icons.generated.scss');
const ICONS_SCSS_PATH = '/images/icons/mono';

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readInbox() {
  if (!fs.existsSync(BUFFER_FILE)) {
    console.error('❌ Нет файла буфера:', BUFFER_FILE);
    process.exit(1);
  }
  const raw = fs.readFileSync(BUFFER_FILE, 'utf8').trim();
  if (!raw) {
    console.log('⚠️ Буфер пуст, обрабатывать нечего');
    process.exit(0);
  }
  return raw;
}

function parseBlocks(raw) {
  const chunks = raw
    .split(/^\s*\/\/\s*/m)
    .map((c) => c.trim())
    .filter(Boolean);

  const blocks = [];

  for (const chunk of chunks) {
    const idx = chunk.indexOf('\n');
    if (idx === -1) continue;

    const name = chunk.slice(0, idx).trim();
    const svg = chunk.slice(idx + 1).trim();

    if (!name || !svg.includes('<svg')) continue;

    if (!/^[a-z0-9-]+$/.test(name)) {
      console.error(`❌ Плохое имя "${name}". Разрешены [a-z0-9-].`);
      process.exit(1);
    }

    blocks.push({ name, svg });
  }

  if (!blocks.length) {
    console.error('❌ Не найдено ни одной пары "// name" + <svg>');
    process.exit(1);
  }

  return blocks;
}

function optimizeSvg(name, svg) {
  const result = optimize(svg, {
    multipass: true,
    plugins: [
      'removeDoctype',
      'removeXMLProcInst',
      'removeComments',
      'removeMetadata',
      'removeEditorsNSData',
      'cleanupAttrs',
      'mergePaths',
      'collapseGroups',
      'convertShapeToPath',
      'removeDimensions',
      {
        name: 'removeAttrs',
        params: { attrs: ['data-name', 'style', 'class', 'id'] },
      },
    ],
  });

  if ('error' in result && result.error) {
    console.error(`❌ SVGO ошибка у "${name}":`, result.error);
    process.exit(1);
  }

  let clean = String(result.data).trim();

  clean = clean.replace(/<svg([^>]*)>/, (match, attrs) => {
    if (/viewBox="/.test(attrs)) return `<svg${attrs}>`;
    return `<svg${attrs} viewBox="0 0 24 24">`;
  });

  return clean + '\n';
}

function writeIcons(blocks) {
  ensureDir(ICONS_DIR);
  for (const { name, svg } of blocks) {
    const optimized = optimizeSvg(name, svg);
    const file = path.join(ICONS_DIR, `${name}.svg`);
    if (fs.existsSync(file)) {
      console.warn(`⚠️ Перезаписываю ${name}.svg`);
    }
    fs.writeFileSync(file, optimized, 'utf8');
    console.log(`✅ ${name}.svg`);
  }
}

function generateScss() {
  const files = fs
    .readdirSync(ICONS_DIR)
    .filter((f) => f.endsWith('.svg'))
    .sort();

  const names = files.map((f) => path.basename(f, '.svg'));

  const lines = [];
  lines.push(`$icons-path: '${ICONS_SCSS_PATH}';`);
  lines.push('');
  lines.push('$icons: (');
  names.forEach((n) => lines.push(`  '${n}',`));
  lines.push(');');
  lines.push('');
  lines.push('@each $icon in $icons {');
  lines.push('  .icon--#{$icon}::before,');
  lines.push('  .icon--#{$icon}::after {');
  lines.push(`    -webkit-mask-image: url('#{$icons-path}/#{$icon}.svg');`);
  lines.push(`    mask-image: url('#{$icons-path}/#{$icon}.svg');`);
  lines.push('  }');
  lines.push('}');

  fs.writeFileSync(GENERATED_SCSS, lines.join('\n') + '\n', 'utf8');
  console.log(`✨ SCSS: ${GENERATED_SCSS}`);

  return names;
}

function clearInbox() {
  fs.writeFileSync(BUFFER_FILE, '', 'utf8');
  console.log(`🧹 Очищен буфер: ${BUFFER_FILE}`);
}

const raw = readInbox();
const blocks = parseBlocks(raw);
writeIcons(blocks);
generateScss();
clearInbox();
