import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';

function resolveHtmlIncludes(html, fromFile, seen = new Set()) {
  const includeRe = /@@include\(\s*['"]([^'"]+)['"]\s*\)/g;
  const fromDir = path.dirname(fromFile);

  return html.replace(includeRe, (_match, raw) => {
    const spec = String(raw).trim();

    let includeFile;
    if (spec.startsWith('@/')) includeFile = path.resolve(process.cwd(), 'src', spec.slice(2));
    else if (spec.startsWith('/')) includeFile = path.resolve(process.cwd(), spec.slice(1));
    else includeFile = path.resolve(fromDir, spec);

    const normalized = path.normalize(includeFile);
    if (seen.has(normalized)) {
      throw new Error(`Circular @@include detected: ${normalized}`);
    }
    if (!fs.existsSync(normalized)) {
      throw new Error(`@@include not found: ${normalized} (from ${fromFile})`);
    }

    seen.add(normalized);
    const chunk = fs.readFileSync(normalized, 'utf8');
    const result = resolveHtmlIncludes(chunk, normalized, seen);
    seen.delete(normalized);
    return result;
  });
}

function htmlIncludesPlugin() {
  const root = process.cwd();
  const partialsDir = path.resolve(root, 'src', 'partials');

  return {
    name: 'html-includes',
    enforce: 'pre',
    configureServer(server) {
      if (fs.existsSync(partialsDir)) server.watcher.add(partialsDir);
    },
    handleHotUpdate({ file, server }) {
      const isPartial =
        file.endsWith('.html') &&
        path.normalize(file).startsWith(path.normalize(partialsDir + path.sep));
      if (isPartial) server.ws.send({ type: 'full-reload' });
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const filename =
          ctx?.filename ??
          (ctx?.path
            ? path.resolve(root, ctx.path.replace(/^\//, ''))
            : path.resolve(root, 'index.html'));

        return resolveHtmlIncludes(html, filename);
      },
    },
  };
}

function collectHtmlEntries() {
  const root = process.cwd();
  const entries = [path.resolve(root, 'index.html')];

  const pagesDir = path.resolve(root, 'pages');
  if (!fs.existsSync(pagesDir)) return entries;

  const stack = [pagesDir];
  while (stack.length) {
    const dir = stack.pop();
    const items = fs.readdirSync(dir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) stack.push(fullPath);
      else if (item.isFile() && item.name.endsWith('.html') && !item.name.startsWith('_')) {
        entries.push(fullPath);
      }
    }
  }

  return entries.sort((a, b) => a.localeCompare(b));
}

export default defineConfig({
  base: '/bonsai/',
  plugins: [htmlIncludesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: collectHtmlEntries(),
    },
  },
});
