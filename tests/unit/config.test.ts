import { describe, expect, it } from 'vitest';
import vitestConfig, { coverageMin } from '../../vitest.config.js';
import playwrightConfig from '../../playwright.config.js';
import eslintConfig from '../../eslint.config.js';

describe('vitest.config', () => {
  it('measures v8 line coverage of src with at least 80 percent', () => {
    const coverage = vitestConfig.test?.coverage as {
      provider: string;
      include: string[];
      reporter: string[];
      thresholds: { lines: number };
    };
    expect(coverage.provider).toBe('v8');
    expect(coverage.include).toContain('src/**/*.ts');
    expect(coverage.reporter).toContain('json-summary');
    expect(coverage.thresholds.lines).toBe(coverageMin(process.env));
  });

  it('takes the line threshold from COVERAGE_MIN (set by the pipeline), default 80', () => {
    expect(coverageMin({})).toBe(80);
    expect(coverageMin({ COVERAGE_MIN: '' })).toBe(80);
    expect(coverageMin({ COVERAGE_MIN: '85' })).toBe(85);
    expect(coverageMin({ COVERAGE_MIN: '92.5' })).toBe(92.5);
  });

  it('rejects an invalid COVERAGE_MIN', () => {
    expect(() => coverageMin({ COVERAGE_MIN: 'abc' })).toThrow('COVERAGE_MIN');
    expect(() => coverageMin({ COVERAGE_MIN: '101' })).toThrow('COVERAGE_MIN');
  });
});

describe('playwright.config', () => {
  it('runs the e2e tests from tests/e2e', () => {
    expect(playwrightConfig.testDir).toBe('tests/e2e');
    expect(playwrightConfig.use?.baseURL).toBeTruthy();
  });
});

describe('eslint.config', () => {
  it('ignores build output', () => {
    const ignores = (eslintConfig as { ignores?: string[] }[]).flatMap((c) => c.ignores ?? []);
    expect(ignores).toContain('dist/');
    expect(ignores).toContain('coverage/');
  });
});
