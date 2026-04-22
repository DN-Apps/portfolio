export function pickCmsData<T>(
  cmsData: readonly T[] | undefined,
  fallbackData: readonly T[],
): T[];
export function pickCmsData<TCms, TView>(
  cmsData: readonly TCms[] | undefined,
  fallbackData: readonly TView[],
  mapCmsItem: (item: TCms, index: number) => TView,
): TView[];

export function pickCmsData<TCms, TView>(
  cmsData: readonly TCms[] | undefined,
  fallbackData: readonly TView[],
  mapCmsItem?: (item: TCms, index: number) => TView,
): TView[] {
  // Liefert Fallback-Daten, wenn CMS leer ist; sonst optional gemappte CMS-Einträge.
  if (!cmsData || cmsData.length === 0) {
    return [...fallbackData];
  }

  if (!mapCmsItem) {
    return [...(cmsData as unknown as readonly TView[])];
  }

  return cmsData.map(mapCmsItem);
}
