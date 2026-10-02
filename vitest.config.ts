import { defineConfig } from 'vitest/config';

// Minimum line coverage. The pipeline sets COVERAGE_MIN from pipeline.coverage_min of the
// rule profile (and checks the coverage summary itself); 80 is the local default.
export function coverageMin(env: Record<string, string | undefined>): number {
  const raw = env.COVERAGE_MIN;
  if (raw === undefined || raw === '') return 80;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0 || value > 100) {
    throw new Error(`COVERAGE_MIN must be a number between 0 and 100, got "${raw}"`);
  }
  return value;
}

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'json-summary'],
      reportsDirectory: './coverage',
      thresholds: { lines: coverageMin(process.env) },
    },
  },
});
