/**
 * Topics panel webview (browser side). Renders a faceted, searchable, flat list
 * of topics — no folder tree — and relays management actions back to the
 * extension host. Self-contained: it shares no imports with the host bundle.
 */

interface TopicCard {
  id: string;
  title: string;
  path: string;
  type: string;
  locale: string;
  isVariant: boolean;
  dimensions: Record<string, string[]>;
  tags: string[];
  related: string[];
  profiles: string[];
  orphan: boolean;
  missingFields: boolean;
  stale: boolean;
  missingLocales: string[];
}

interface Model {
  topics: TopicCard[];
  facets: {
    types: string[];
    dimensions: { id: string; label: string; values: string[] }[];
    profiles: { id: string; label: string }[];
    locales: string[];
    tags: string[];
  };
  i18n: { coverage: Record<string, string>; staleCount: number };
  health: {
    orphans: number;
    missingFields: number;
    stale: number;
    gaps: { profile: string; missing: string }[];
  };
}

type HostMessage = { type: 'model'; model: Model } | { type: 'error'; message: string };

interface VsCodeApi {
  postMessage(msg: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}
declare function acquireVsCodeApi(): VsCodeApi;

const vscode = acquireVsCodeApi();
const STATUS_VALUES = ['orphan', 'missingFields', 'stale', 'missingTranslation'] as const;
const STATUS_LABELS: Record<string, string> = {
  orphan: 'orphan',
  missingFields: 'missing fields',
  stale: 'stale translation',
  missingTranslation: 'missing translation',
};

interface UiState {
  search: string;
  selected: Record<string, string[]>;
}

let model: Model | null = null;
let errorMessage: string | null = null;
const saved = (vscode.getState() as UiState | undefined) ?? { search: '', selected: {} };
let search = saved.search;
const selected = new Map<string, Set<string>>(
  Object.entries(saved.selected).map(([k, v]) => [k, new Set(v)]),
);

function persist(): void {
  const obj: Record<string, string[]> = {};
  for (const [k, v] of selected) if (v.size) obj[k] = [...v];
  vscode.setState({ search, selected: obj } satisfies UiState);
}

function toggle(group: string, value: string): void {
  const set = selected.get(group) ?? new Set<string>();
  if (set.has(value)) set.delete(value);
  else set.add(value);
  if (set.size) selected.set(group, set);
  else selected.delete(group);
  persist();
  render();
}

function isActive(group: string, value: string): boolean {
  return selected.get(group)?.has(value) ?? false;
}

/** Small DOM builder — avoids innerHTML so user content can't inject markup. */
function el(
  tag: string,
  props: Record<string, unknown> = {},
  children: (Node | string)[] = [],
): HTMLElement {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') node.className = String(v);
    else if (k === 'onclick') node.addEventListener('click', v as EventListener);
    else if (k === 'title') node.title = String(v);
    else node.setAttribute(k, String(v));
  }
  for (const c of children) node.append(typeof c === 'string' ? document.createTextNode(c) : c);
  return node;
}

function matches(t: TopicCard): boolean {
  if (search) {
    const q = search.toLowerCase();
    if (![t.title, t.path, t.id].some((s) => s.toLowerCase().includes(q))) return false;
  }
  for (const [group, values] of selected) {
    if (!values.size) continue;
    const has = (arr: string[]) => arr.some((v) => values.has(v));
    if (group === 'type' && !values.has(t.type)) return false;
    else if (group === 'profile' && !has(t.profiles)) return false;
    else if (group === 'locale' && !values.has(t.locale)) return false;
    else if (group === 'tag' && !has(t.tags)) return false;
    else if (group.startsWith('dim:') && !has(t.dimensions[group.slice(4)] ?? [])) return false;
    else if (group === 'status') {
      const flags: Record<string, boolean> = {
        orphan: t.orphan,
        missingFields: t.missingFields,
        stale: t.stale,
        missingTranslation: t.missingLocales.length > 0,
      };
      if (![...values].some((v) => flags[v])) return false;
    }
  }
  return true;
}

function chip(group: string, value: string, label: string): HTMLElement {
  return el(
    'button',
    {
      class: `chip${isActive(group, value) ? ' active' : ''}`,
      onclick: () => toggle(group, value),
    },
    [label],
  );
}

function facetGroup(label: string, group: string, values: { value: string; label: string }[]): HTMLElement {
  if (!values.length) return el('span');
  return el('div', { class: 'facet-group' }, [
    el('span', { class: 'facet-label' }, [label]),
    ...values.map((v) => chip(group, v.value, v.label)),
  ]);
}

function healthBar(): HTMLElement {
  const h = model!.health;
  const stat = (label: string, value: number, statusValue: string): HTMLElement =>
    el(
      'button',
      {
        class: `chip${isActive('status', statusValue) ? ' active' : ''}`,
        title: `Filter by ${label}`,
        onclick: () => toggle('status', statusValue),
      },
      [`${label}: ${value}`],
    );

  const children: HTMLElement[] = [
    el('span', { class: 'facet-label' }, ['Health']),
    stat('orphans', h.orphans, 'orphan'),
    stat('missing fields', h.missingFields, 'missingFields'),
    stat('stale', h.stale, 'stale'),
  ];

  const bar = el('div', { class: 'facet-group' }, children);
  if (h.gaps.length === 0) return bar;

  const details = el('details', { class: 'gaps' }, [
    el('summary', {}, [`Coverage gaps (${h.gaps.length})`]),
    ...h.gaps.map((g) => el('div', { class: 'gap' }, [`${g.profile}: ${g.missing}`])),
  ]);
  return el('div', {}, [bar, details]);
}

function topicRow(t: TopicCard): HTMLElement {
  const meta: HTMLElement[] = [el('span', { class: 'badge' }, [t.type])];
  meta.push(el('span', { class: 'dim' }, [t.isVariant ? `🌐 ${t.locale} variant` : t.locale]));
  for (const [id, values] of Object.entries(t.dimensions)) {
    meta.push(el('span', { class: 'dim' }, [`${id}: ${values.join(', ')}`]));
  }
  if (t.orphan) meta.push(el('span', { class: 'badge warn' }, ['orphan']));
  if (t.missingFields) meta.push(el('span', { class: 'badge err' }, ['missing fields']));
  if (t.stale) meta.push(el('span', { class: 'badge warn' }, ['stale']));

  const actions: HTMLElement[] = [
    el('button', { class: 'action', onclick: () => vscode.postMessage({ type: 'editMeta', path: t.path }) }, [
      'Edit metadata',
    ]),
  ];
  for (const loc of t.missingLocales) {
    actions.push(
      el(
        'button',
        { class: 'action', onclick: () => vscode.postMessage({ type: 'createVariant', path: t.path, locale: loc }) },
        [`+ ${loc} translation`],
      ),
    );
  }
  for (const rel of t.related) {
    const target = model?.topics.find((x) => x.id === rel && !x.isVariant);
    if (target) {
      actions.push(
        el('button', { class: 'action', onclick: () => vscode.postMessage({ type: 'open', path: target.path }) }, [
          `→ ${rel.split('/').pop()}`,
        ]),
      );
    }
  }

  return el('div', { class: 'topic' }, [
    el('div', { class: 'topic-title', title: t.path, onclick: () => vscode.postMessage({ type: 'open', path: t.path }) }, [
      t.title,
    ]),
    el('div', { class: 'meta' }, meta),
    el('div', { class: 'path' }, [t.path]),
    el('div', { class: 'actions' }, actions),
  ]);
}

function render(): void {
  const app = document.getElementById('app');
  if (!app) return;
  app.replaceChildren();

  const searchInput = el('input', { id: 'search', type: 'text', placeholder: 'Search topics…' }) as HTMLInputElement;
  searchInput.value = search;
  searchInput.addEventListener('input', () => {
    search = searchInput.value;
    persist();
    renderList();
  });
  app.append(
    el('div', { class: 'toolbar' }, [
      searchInput,
      el('button', { onclick: () => vscode.postMessage({ type: 'create' }) }, ['New topic']),
      el('button', { class: 'secondary', onclick: () => vscode.postMessage({ type: 'refresh' }) }, ['↻']),
    ]),
  );

  if (errorMessage) {
    app.append(el('div', { class: 'error' }, [errorMessage]));
    return;
  }
  if (!model) {
    app.append(el('div', { class: 'empty' }, ['Loading…']));
    return;
  }

  const f = model.facets;
  app.append(
    el('div', { class: 'facets' }, [
      facetGroup('Type', 'type', f.types.map((v) => ({ value: v, label: v }))),
      ...f.dimensions.map((d) =>
        facetGroup(d.label, `dim:${d.id}`, d.values.map((v) => ({ value: v, label: v }))),
      ),
      facetGroup('Profile', 'profile', f.profiles.map((p) => ({ value: p.id, label: p.label }))),
      facetGroup('Language', 'locale', f.locales.map((v) => ({ value: v, label: v }))),
      facetGroup('Tag', 'tag', f.tags.map((v) => ({ value: v, label: v }))),
      facetGroup('Status', 'status', STATUS_VALUES.map((v) => ({ value: v, label: STATUS_LABELS[v] ?? v }))),
    ]),
  );

  app.append(healthBar());
  app.append(el('div', { id: 'list' }));
  renderList();
}

function renderList(): void {
  const list = document.getElementById('list');
  if (!list || !model) return;
  list.replaceChildren();
  const shown = model.topics.filter(matches);
  list.append(
    el('div', { class: 'count' }, [`${shown.length} of ${model.topics.length} topics`]),
  );
  if (!shown.length) {
    list.append(el('div', { class: 'empty' }, ['No topics match the current filters.']));
    return;
  }
  for (const t of shown) list.append(topicRow(t));
}

window.addEventListener('message', (event: MessageEvent<HostMessage>) => {
  const data = event.data;
  if (data.type === 'model') {
    model = data.model;
    errorMessage = null;
  } else if (data.type === 'error') {
    errorMessage = data.message;
    model = null;
  }
  render();
});

render();
vscode.postMessage({ type: 'ready' });
