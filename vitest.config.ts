import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: [
      { find: '@/env', replacement: path.resolve(__dirname, 'env.ts') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
});
