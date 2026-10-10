import { chosen, type ItemId } from './catalog';
export interface TryOnLayer { id: ItemId; start: number; end: number; sourceStart: number; sourceEnd: number }
// Pre-rendered garment bands. They illustrate styling, never fit or sizing.
export function tryOnLayers(ids: readonly ItemId[]): TryOnLayer[] {
  const products = chosen(ids);
  const dress = products.find(p => p.slot === 'dress' && p.sheet !== undefined);
  if (dress) return [{ id: dress.id, start: .18, end: 1, sourceStart: .18, sourceEnd: 1 }];
  const layers: TryOnLayer[] = [];
  const top = products.find(p => p.slot === 'top' && p.sheet !== undefined);
  const bottom = products.find(p => p.slot === 'bottom' && p.sheet !== undefined);
  if (bottom) layers.push({ id: bottom.id, start: .46, end: bottom.id === 'khaki-shorts' ? .63 : 1, sourceStart: bottom.id === 'khaki-shorts' ? .38 : .36, sourceEnd: bottom.id === 'khaki-shorts' ? .57 : 1 });
  if (top) layers.push({ id: top.id, start: .18, end: .46, sourceStart: .18, sourceEnd: top.id === 'oat-blazer' ? .49 : .46 });
  return layers;
}

/** Exact clothing match only: never show a polished image of a different selection. */
export function completeTryOn(ids: readonly ItemId[], hair: number): string | null {
 const clothes = chosen(ids).filter(p => p.slot !== 'shoes').map(p => p.id).sort();
 return clothes.join(',') === 'denim-midi,hoodie' && Number.isInteger(hair) && hair >= 0 && hair < 6 ? `coherent-hoodie-denim-${hair}.png` : null;
}
