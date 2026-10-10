export type Category = 'tops' | 'bottoms' | 'dresses' | 'shoes';
export type Drawer = Category | 'sets';
export type ItemId = 'hoodie' | 'cardigan' | 'skirt' | 'jeans' | 'sneakers' | 'dress' | 'ivory-heels' | 'bow-heels' | 'brown-boots' | 'mary-janes' | 'slingbacks' | 'white-shirt' | 'striped-knit' | 'black-tank' | 'oat-blazer' | 'tailored-trousers' | 'denim-midi' | 'pleated-maxi' | 'khaki-shorts' | 'shirt-dress' | 'floral-dress';
export interface Product { id: ItemId; name: string; category: Category; slot: 'top' | 'bottom' | 'dress' | 'shoes'; price: number; code: string; color: string; location: string; sheet?: number; art?: number; image?: string }
export interface Outfit { id: string; name: string; desc: string; items: ItemId[]; cell: number }
export const ITEMS: Product[] = [
  { id: 'denim-midi', name: '蓝色牛仔半裙', category: 'bottoms', slot: 'bottom', price: 299, code: 'YJ-B204', color: '牛仔蓝', location: '新品陈列区 B-06', sheet: 5 },
  { id: 'shirt-dress', name: '米白腰带衬衫裙', category: 'dresses', slot: 'dress', price: 459, code: 'YJ-D402', color: '米白', location: '新品陈列区 D-09', sheet: 8 },
  { id: 'hoodie', name: '奶油黄连帽卫衣', category: 'tops', slot: 'top', price: 299, code: 'YJ-T101', color: '奶油黄', location: '上装区 A-02', art: 0 },
  { id: 'cardigan', name: '雾灰拉链开衫', category: 'tops', slot: 'top', price: 359, code: 'YJ-T102', color: '雾灰', location: '上装区 A-03', art: 1 },
  { id: 'jeans', name: '浅蓝直筒牛仔裤', category: 'bottoms', slot: 'bottom', price: 329, code: 'YJ-B202', color: '浅蓝', location: '下装区 B-02', art: 3 },
  { id: 'sneakers', name: '复古红休闲鞋', category: 'shoes', slot: 'shoes', price: 399, code: 'YJ-S301', color: '复古红', location: '鞋履区 C-01', art: 4 },
  { id: 'dress', name: '简约黑色连衣裙', category: 'dresses', slot: 'dress', price: 599, code: 'YJ-D401', color: '经典黑', location: '连衣裙区 D-01', art: 5 },
  { id: 'ivory-heels', name: '奶白一字带高跟鞋', category: 'shoes', slot: 'shoes', price: 469, code: 'YJ-S302', color: '奶白', location: '鞋履区 C-02', image: 'shoe-ivory-heels.png' },
  { id: 'bow-heels', name: '黑边蝴蝶结高跟鞋', category: 'shoes', slot: 'shoes', price: 599, code: 'YJ-S303', color: '白色 / 黑边', location: '鞋履区 C-03', image: 'shoe-bow-heels.png' },
  { id: 'brown-boots', name: '深棕尖头短靴', category: 'shoes', slot: 'shoes', price: 699, code: 'YJ-S304', color: '深棕', location: '鞋履区 C-04', image: 'shoe-brown-boots.png' },
  { id: 'mary-janes', name: '复古棕玛丽珍鞋', category: 'shoes', slot: 'shoes', price: 399, code: 'YJ-S305', color: '焦糖棕', location: '鞋履区 C-05', image: 'shoe-mary-janes.png' },
  { id: 'slingbacks', name: '深棕后绊带高跟鞋', category: 'shoes', slot: 'shoes', price: 549, code: 'YJ-S306', color: '漆面深棕', location: '鞋履区 C-06', image: 'shoe-slingbacks.png' },
];
export const SETS: Outfit[] = [
  { id: 'sunshine', name: '阳光周末', desc: '黄卫衣 / 牛仔半裙 / 红鞋', items: ['hoodie', 'denim-midi', 'sneakers'], cell: 3 },
  { id: 'city', name: '松弛通勤', desc: '灰开衫 / 牛仔裤 / 红鞋', items: ['cardigan', 'jeans', 'sneakers'], cell: 6 },
  { id: 'evening', name: '轻简晚间', desc: '黑色连衣裙 / 红鞋', items: ['dress', 'sneakers'], cell: 8 },
];
export const DRAWERS: { id: Drawer; name: string; count: string }[] = [
  { id: 'tops', name: '上装', count: '02' }, { id: 'bottoms', name: '下装', count: '02' },
  { id: 'dresses', name: '连衣裙', count: '02' }, { id: 'shoes', name: '鞋履', count: '06' }, { id: 'sets', name: '套装分区', count: '03' },
];
export const HAIRS = ['自然波波头', '利落短发', '松弛丸子头', '层次长卷发', '侧编发', '自然长直发'];
export const BUILDS = ['A', 'B', 'C'];
export const item = (id: string) => ITEMS.find(product => product.id === id);
export const chosen = (ids: readonly ItemId[]) => ids.map(id => item(id)!);
export const sum = (ids: readonly ItemId[]) => chosen(ids).reduce((total, product) => total + product.price, 0);
export const asset = (name: string) => `${import.meta.env.BASE_URL}assets/${name}`;

export const selectedShoe = (ids: readonly ItemId[]) => chosen(ids).find(product => product.slot === 'shoes');
