import { defineConfig } from 'tsup';

const shared = {
  format: ['esm', 'cjs'] as const,
  dts: true,
  sourcemap: true,
  splitting: false,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
};

export default defineConfig([
  {
    ...shared,
    entry: {
      'react/index': 'src/react/index.ts',
    },
    clean: true,
  },
  {
    ...shared,
    entry: { 'react/client/index': 'src/react/client/index.ts' },
    clean: false,
    // Next.js App Router: everything in this entry is a Client Component.
    banner: { js: "'use client';" },
  },
  {
    ...shared,
    entry: { 'tailwind-preset': 'src/tailwind-preset.ts' },
    clean: false,
    // This entry's only export is `default`. Without cjsInterop, tsup's CJS
    // output only sets `module.exports.default`, which attw flags under the
    // node16 (CJS) resolution mode (types say `export default`, but a CJS
    // `require()` needs `export =`) — see MissingExportEquals in attw's docs.
    cjsInterop: true,
  },
]);
