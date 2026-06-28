// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// Project Pages live under /topicmd/, so set `site` + `base` accordingly. The
// build output (docs-site/dist) is uploaded by .github/workflows/pages.yml.
export default defineConfig({
  site: 'https://motorradhexe.github.io',
  base: '/topicmd/',
  integrations: [
    starlight({
      title: 'topicmd',
      description:
        'A docs-as-code toolchain for semantic structure, reusable content, navigation profiles, i18n coverage, and AI-assisted topic management on Markdown projects.',
      social: {
        github: 'https://github.com/motorradhexe/topicmd',
      },
      sidebar: [
        {
          label: 'Guide',
          items: [
            { label: 'Introduction', slug: 'guide/introduction' },
            { label: 'Installation', slug: 'guide/installation' },
            { label: 'Quickstart', slug: 'guide/quickstart' },
            { label: 'Core concepts', slug: 'guide/concepts' },
          ],
        },
        {
          label: 'CLI reference',
          items: [
            { label: 'Overview', slug: 'cli' },
            { label: 'validate', slug: 'cli/validate' },
            { label: 'index', slug: 'cli/index-command' },
            { label: 'scaffold', slug: 'cli/scaffold' },
            { label: 'nav build', slug: 'cli/nav-build' },
            { label: 'i18n status', slug: 'cli/i18n-status' },
            { label: 'Diagnostics', slug: 'cli/diagnostics' },
          ],
        },
        {
          label: 'Schema reference',
          items: [
            { label: 'docs.schema.yaml', slug: 'schema' },
            { label: 'Topic frontmatter', slug: 'schema/frontmatter' },
            { label: 'Variables, nav & index', slug: 'schema/artifacts' },
          ],
        },
        {
          label: 'VS Code extension',
          items: [{ label: 'Extension reference', slug: 'vscode' }],
        },
      ],
    }),
  ],
});
