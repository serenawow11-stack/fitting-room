import { HAIRS, item, type ItemId } from './catalog';
export interface Person { hair: number; height: number; weight: number }
export interface Appearance { hair: number; body: number }
export interface Look { items: ItemId[]; person: Person; cell: number; expires: number }
export interface SharedLook { items: ItemId[]; appearance: Appearance; cell: number; expires: number }
export const DEFAULT_PERSON: Person = { hair: 0, height: 165, weight: 55 };
export const LINK_TTL = 24 * 60 * 60 * 1000;
export const IDLE_MS = 90_000;
export const IDLE_WARNING_MS = 15_000;
export const bodyIndex = (person: Person) => {
  const relative = person.weight / (person.height / 165) ** 2;
  return relative < 50 ? 0 : relative < 70 ? 1 : 2;
};
export const appearance = (person: Person): Appearance => ({ hair: person.hair, body: bodyIndex(person) });
export function validParameter(key: keyof Person, value: number): boolean {
  const [min, max] = key === 'height' ? [140, 200] : key === 'weight' ? [35, 150] : [0, HAIRS.length - 1];
  return Number.isInteger(value) && value >= min && value <= max;
}
export function selectProduct(ids: readonly ItemId[], id: string): ItemId[] {
  const product = item(id);
  if (!product) return [...ids];
  const next = ids.filter(value => {
    const slot = item(value)!.slot;
    return slot !== product.slot && !(product.slot === 'dress' && ['top', 'bottom'].includes(slot)) && !(['top', 'bottom'].includes(product.slot) && slot === 'dress');
  });
  next.push(product.id);
  // This pre-rendered demo has no skirt-only tile. Keep the list aligned with its preview.
  if (product.id === 'skirt' && !next.some(value => item(value)!.slot === 'top')) next.push('hoodie');
  return next;
}
export function removeProduct(ids: readonly ItemId[], id: ItemId): ItemId[] {
  let next = ids.filter(value => value !== id);
  if (item(id)!.slot === 'top') next = next.filter(value => value !== 'skirt');
  return next;
}
export function cellFor(ids: readonly ItemId[]): number {
  if (ids.includes('dress')) return 8;
  const h = ids.includes('hoodie'), c = ids.includes('cardigan'), sk = ids.includes('skirt'), j = ids.includes('jeans');
  if (h && sk) return 3;
  if (c && sk) return 4;
  if (h && j) return 5;
  if (c && j) return 6;
  if (j) return 7;
  return h ? 1 : c ? 2 : 0;
}
/** A shareable demo snapshot, not an authorization token. Never put private data here. */
export function resultUrl(look: Look, currentHref: string): string {
  const url = new URL(currentHref);
  url.search = ''; url.hash = '';
  url.searchParams.set('look', look.items.join(','));
  url.searchParams.set('until', String(look.expires));
  const a = appearance(look.person);
  url.searchParams.set('avatar', `${a.hair}.${a.body}`);
  return url.toString();
}
export function readShared(search: string, now = Date.now()): SharedLook | null {
  const query = new URLSearchParams(search);
  const rawIds = (query.get('look') || '').split(',');
  const rawTime = query.get('until') || '';
  const expires = Number(rawTime);
  if (!/^\d{13}$/.test(rawTime) || !Number.isSafeInteger(expires) || expires <= now || expires > now + LINK_TTL + 60_000 || rawIds.length > 4 || new Set(rawIds).size !== rawIds.length || rawIds.some(id => !item(id))) return null;
  const ids = rawIds as ItemId[];
  const slots = ids.map(id => item(id)!.slot);
  if (new Set(slots).size !== slots.length || (slots.includes('dress') && (slots.includes('top') || slots.includes('bottom')))) return null;
  const av = query.get('avatar') || '0.1';
  if (!/^[0-5]\.[0-2]$/.test(av)) return null;
  const [hair, body] = av.split('.').map(Number);
  return { items: ids, expires, cell: cellFor(ids), appearance: { hair, body } };
}
