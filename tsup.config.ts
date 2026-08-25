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
]);
