import { Avatar } from './avatar';
import { ProductArt } from './products';
import { selectedShoe, type ItemId } from '@/lib/catalog';
import type { Person, Appearance } from '@/lib/wardrobe';
/** Shoe product references are separate from the pre-rendered clothing atlas. */
export function LookPreview({ cell, person, items }: { cell: number; person: Person | Appearance; items: ItemId[] }) {
  const shoe = selectedShoe(items);
  const separate = shoe && shoe.id !== 'sneakers';
  return <div className={`look-preview ${separate ? 'has-shoe-reference' : ''}`}>
    <Avatar cell={cell} person={person} items={items} />
    {separate && <aside className="shoe-reference" aria-label="所选鞋履参考">
      <ProductArt product={shoe} />
      <div><span className="shoe-reference-label">鞋履单独参考</span><strong>{shoe.name}</strong><small>商品图 · 未合成上脚效果</small></div>
    </aside>}
  </div>;
}
