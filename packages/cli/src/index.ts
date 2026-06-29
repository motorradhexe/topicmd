#!/usr/bin/env node
/**
 * @topicmd/cli — command-line interface over @topicmd/core.
 *
 * MVP commands: validate, index, scaffold. nav build / i18n status follow (#17).
 */
import { argv } from 'node:process';
import { pathToFileURL } from 'node:url';
import { Command } from 'commander';
import { VERSION } from '@topicmd/core';
import { validateAction } from './commands/validate.js';
import { indexAction } from './commands/index-cmd.js';
import { scaffoldAction } from './commands/scaffold.js';
import { navBuildAction } from './commands/nav.js';
import { i18nStatusAction } from './commands/i18n.js';

/** Extract an error's message (no stack trace). May span multiple lines, e.g.
 * a SchemaError that lists several issues. */
function formatError(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * Wrap a command action so any failure (schema-load errors, I/O errors, unknown
 * scaffold types, …) prints `topicmd: <message>` to stderr and sets exit code 1,
 * instead of crashing with a raw stack trace. The message is the error's own
 * text (which may be multi-line, e.g. a SchemaError listing several issues), not
 * a stack trace. This gives every command consistent, CI-friendly error behaviour.
 */
function runAction<A extends unknown[]>(
  fn: (...args: A) => void | Promise<void>,
): (...args: A) => Promise<void> {
  return async (...args: A): Promise<void> => {
    try {
      await fn(...args);
    } catch (err) {
      console.error(`topicmd: ${formatError(err)}`);
      process.exitCode = 1;
    }
  };
}

export function buildProgram(): Command {
  const program = new Command();
  program
    .name('topicmd')
    .description('Semantic structure and AI-assisted topic management for Markdown docs')
    .version(VERSION);

  const withCommon = (cmd: Command): Command =>
    cmd
      .option('-s, --schema <path>', 'path to docs.schema.yaml', 'docs.schema.yaml')
      .option('-r, --root <dir>', 'project root (defaults to the schema directory)')
      .option('-c, --content <dir>', 'directory scanned for topics (defaults to root)');

  withCommon(program.command('validate'))
    .description('validate all topics against the schema (exit 1 on errors)')
    .action(runAction(validateAction));

  withCommon(program.command('index'))
    .description('generate docs.index.json')
    .option('-o, --out <path>', 'output path (defaults to <root>/docs.index.json)')
    .action(runAction(indexAction));

  withCommon(program.command('scaffold'))
    .argument('<type>', 'topic type to scaffold (e.g. concept, task, reference)')
    .description('create a new topic with valid frontmatter for the given type')
    .option('-t, --title <title>', 'topic title')
    .option('-o, --out <path>', 'write to a file instead of stdout')
    .action(runAction(scaffoldAction));

  const nav = program.command('nav').description('navigation manifests');
  withCommon(nav.command('build'))
    .description('generate base + per-profile nav manifests and profiles.json')
    .option('--nav-dir <dir>', 'directory of nav/*.yaml sources (defaults to <root>/nav)')
    .option('-o, --out <dir>', 'output directory (defaults to <root>/build/nav)')
    .action(runAction(navBuildAction));

  const i18n = program.command('i18n').description('internationalization');
  withCommon(i18n.command('status'))
    .description('report locale coverage and stale translations (exit 1 if stale)')
    .action(runAction(i18nStatusAction));

  return program;
}

// Only parse argv when run as the executable, not when imported by tests.
if (argv[1] && import.meta.url === pathToFileURL(argv[1]).href) {
  buildProgram().parse();
}
