/** `topicmd i18n status` — report locale coverage and stale translations. */
import { buildI18nReport } from '@topicmd/core';
import { parseTopics, resolveConfig, type CommonOptions } from '../discover.js';

export interface I18nStatusResult {
  exitCode: number;
  lines: string[];
}

/**
 * Pure runner: returns the report lines and an exit code (1 when there are
 * stale translations, so CI catches translation drift — design decision 9).
 */
export function runI18nStatus(options: CommonOptions): I18nStatusResult {
  const config = resolveConfig(options);
  const topics = parseTopics(config);
  const report = buildI18nReport(topics, config.schema, { rootDir: config.rootDir });

  const lines: string[] = [`i18n coverage (source language: ${config.schema.i18n.default})`];
  for (const locale of config.schema.i18n.locales) {
    lines.push(`  ${locale}: ${report.i18n_coverage[locale] ?? '0%'}`);
  }

  if (report.stale_translations.length === 0) {
    lines.push('Stale translations: none');
  } else {
    lines.push(`Stale translations: ${report.stale_translations.length}`);
    for (const stale of report.stale_translations) {
      lines.push(`  ${stale.topic} [${stale.locale}]: ${stale.reason}`);
    }
  }

  return { exitCode: report.stale_translations.length > 0 ? 1 : 0, lines };
}

/** CLI action: print and set the process exit code. */
export function i18nStatusAction(options: CommonOptions): void {
  const { exitCode, lines } = runI18nStatus(options);
  const sink = exitCode === 0 ? console.log : console.error;
  for (const line of lines) sink(line);
  process.exitCode = exitCode;
}
