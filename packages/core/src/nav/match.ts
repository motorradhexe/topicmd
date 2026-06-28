/**
 * Profile resolution primitive: does a topic's dimensions satisfy a partial
 * filter set?
 *
 * Filters are partial (design decision 5): a dimension not named in the filters
 * is unconstrained. A dimension the topic does not declare is treated as
 * agnostic — it matches any filter value, so general topics surface in every
 * profile.
 */
export function matchesFilters(
  dimensions: Record<string, string | string[]> | undefined,
  filters: Record<string, string | string[]>,
): boolean {
  const dims = dimensions ?? {};
  for (const [dimId, filterVal] of Object.entries(filters)) {
    const topicVal = dims[dimId];
    if (topicVal === undefined) continue; // agnostic
    const allowed = new Set(Array.isArray(filterVal) ? filterVal : [filterVal]);
    const values = Array.isArray(topicVal) ? topicVal : [topicVal];
    if (!values.some((v) => allowed.has(v))) return false;
  }
  return true;
}
