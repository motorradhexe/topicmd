/** `topicmd nav build` — generate base + per-profile nav manifests + profiles.json. */
import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, extname, isAbsolute, join, resolve } from 'node:path';
import {
  filterNav,
  indexProject,
  loadNavManifest,
  loadVariables,
  serializeNavManifest,
  serializeProfiles,
} from '@topicmd/core';
import { resolveConfig, type CommonOptions } from '../discover.js';

export interface NavBuildOptions extends CommonOptions {
  /** Directory holding nav/*.yaml sources (defaults to <root>/nav). */
  navDir?: string;
  /** Output directory (defaults to <root>/build/nav). */
  out?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
}

export interface NavBuildResult {
  outDir: string;
  files: GeneratedFile[];
}

function listNavSources(navDir: string): string[] {
  if (!existsSync(navDir)) return [];
  return readdirSync(navDir)
    .filter((f) => /\.ya?ml$/i.test(f))
    .sort()
    .map((f) => join(navDir, f));
}

/** Pure runner: compute every output file (base, per-profile, profiles.json). */
export function runNavBuild(options: NavBuildOptions): NavBuildResult {
  const config = resolveConfig(options);
  const variables = config.varsPath ? loadVariables(config.varsPath) : {};
  const index = indexProject({
    rootDir: config.rootDir,
    schema: config.schema,
    contentDir: config.contentDir,
    variables,
  });

  const navDir = options.navDir
    ? isAbsolute(options.navDir)
      ? options.navDir
      : resolve(process.cwd(), options.navDir)
    : join(config.rootDir, 'nav');
  const outDir = options.out
    ? isAbsolute(options.out)
      ? options.out
      : resolve(process.cwd(), options.out)
    : join(config.rootDir, 'build', 'nav');

  const files: GeneratedFile[] = [
    { path: join(outDir, 'profiles.json'), content: serializeProfiles(config.schema) },
  ];

  for (const source of listNavSources(navDir)) {
    const name = basename(source, extname(source));
    const manifest = loadNavManifest(source);
    files.push({ path: join(outDir, `${name}.yaml`), content: serializeNavManifest(manifest) });
    for (const profile of config.schema.profiles) {
      const filtered = filterNav(manifest, index, profile.filters);
      files.push({
        path: join(outDir, `${name}.${profile.id}.yaml`),
        content: serializeNavManifest(filtered),
      });
    }
  }

  return { outDir, files };
}

/** CLI action: write the generated files. */
export function navBuildAction(options: NavBuildOptions): void {
  const { outDir, files } = runNavBuild(options);
  mkdirSync(outDir, { recursive: true });
  for (const file of files) writeFileSync(file.path, file.content);
  console.log(`Wrote ${files.length} files to ${outDir}`);
}
