import { describe, expect, it } from 'vitest';
import { DEFAULT_PERSON, LINK_TTL, appearance, cellFor, readShared, removeProduct, resultUrl, selectProduct, validParameter, type Look } from '../src/lib/wardrobe';
import { initialState, reducer } from '../src/hooks/use-wardrobe';
describe('衣架规则', () => {
  it('替换同类，不重复计价', () => { expect(selectProduct(['hoodie', 'jeans'], 'cardigan')).toEqual(['jeans', 'cardigan']); expect(selectProduct(['hoodie'], 'hoodie')).toEqual(['hoodie']); });
  it('连衣裙与上下装互斥，保留鞋', () => { expect(selectProduct(['hoodie', 'jeans', 'sneakers'], 'dress')).toEqual(['sneakers', 'dress']); expect(selectProduct(['dress', 'sneakers'], 'jeans')).toEqual(['sneakers', 'jeans']); });
  it('丢弃非目录拖拽输入', () => expect(selectProduct(['hoodie'], '<script>')).toEqual(['hoodie']));
  it('九种图集映射保持稳定', () => { expect([[], ['hoodie'], ['cardigan'], ['hoodie', 'skirt'], ['cardigan', 'skirt'], ['hoodie', 'jeans'], ['cardigan', 'jeans'], ['jeans'], ['dress']].map(ids => cellFor(ids as Look['items']))).toEqual([0,1,2,3,4,5,6,7,8]); });
});
describe('参数与请求生命周期', () => {
  it('六个人物可选，拒绝越界和非整数', () => { expect(validParameter('hair', 5)).toBe(true); expect(validParameter('hair', 6)).toBe(false); expect(validParameter('height', 139)).toBe(false); expect(validParameter('weight', 55.5)).toBe(false); expect(validParameter('height', NaN)).toBe(false); });
  it('保留体型差异', () => { expect([45, 55, 85].map(weight => appearance({ ...DEFAULT_PERSON, weight }).body)).toEqual([0,1,2]); });
  it('修改人物保留衣架，删除旧结果；取消后的结果无效', () => {
    const selected = reducer(initialState(), { type: 'select', id: 'hoodie' });
    const updated = reducer(selected, { type: 'person', key: 'hair', value: 5 });
    expect(updated.selected).toEqual(['hoodie']); expect(updated.person.hair).toBe(5);
    const started = reducer(updated, { type: 'start' });
    expect(reducer(started, { type: 'person', key: 'hair', value: 0 })).toBe(started);
    const cancelled = reducer(started, { type: 'cancel' });
    expect(reducer(cancelled, { type: 'complete', result: { items: ['hoodie'], person: updated.person, cell: 1, expires: Date.now() + LINK_TTL } })).toBe(cancelled);
  });
  it('失败可重试，换一套保留人物，结束完全重置', () => {
    let state = reducer(initialState(), { type: 'set', id: 'city' });
    state = reducer(state, { type: 'person', key: 'hair', value: 4 });
    state = reducer(reducer(state, { type: 'start' }), { type: 'error', value: 'failure' });
    expect(state.selected).toEqual(['cardigan', 'jeans', 'sneakers']);
    expect(reducer(state, { type: 'start' }).view).toBe('generating');
    const changed = reducer(state, { type: 'change' }); expect(changed.person.hair).toBe(4); expect(changed.selected).toEqual([]);
    expect(reducer(changed, { type: 'reset' })).toEqual(initialState());
  });
});
describe('跨端与不可信 URL', () => {
  const now = 1_791_000_000_000;
  const look: Look = { items: ['cardigan', 'jeans'], person: { hair: 5, height: 170, weight: 60 }, cell: 6, expires: now + LINK_TTL };
  it('保持域名与 GitHub 子路径，不含原始身高体重', () => {
    const url = new URL(resultUrl(look, 'https://example.org/fitting-room/?old=1#old'));
    expect(url.pathname).toBe('/fitting-room/'); expect(url.hash).toBe(''); expect(url.searchParams.has('old')).toBe(false);
    expect([...url.searchParams.keys()]).toEqual(['look', 'until', 'avatar']);
    expect(readShared(url.search, now)).toMatchObject({ items: look.items, cell: 6, appearance: appearance(look.person) });
  });
  it('到期/无限期/错误人物/重复及冲突商品均拒绝', () => {
    const search = new URL(resultUrl(look, 'https://example.org/demo/')).search;
    expect(readShared(search, look.expires)).toBeNull();
    for (const [key, value] of [['until','Infinity'],['until',String(now + 2*LINK_TTL)],['avatar','6.1'],['avatar','1.9'],['look','hoodie,hoodie'],['look','dress,jeans'],['look',''],['look','<img src=x onerror=alert(1)>']]) { const q = new URLSearchParams(search); q.set(key,value); expect(readShared(q.toString(),now)).toBeNull(); }
  });
  it('结束大屏不修改已经生成的手机快照', () => { const url = resultUrl(look, 'https://example.org/demo/'); reducer(initialState(), { type: 'reset' }); expect(readShared(new URL(url).search, now)?.items).toEqual(look.items); });
});

describe('新增鞋履', () => {
  const shoes = ['ivory-heels', 'bow-heels', 'brown-boots', 'mary-janes', 'slingbacks'] as const;
  it('五款新鞋替换已有鞋款，衣服保留且只计一双', () => {
    for (const id of shoes) expect(selectProduct(['hoodie', 'jeans', 'sneakers'], id)).toEqual(['hoodie', 'jeans', id]);
  });
  it('反复切鞋不重复，移除鞋不删除衣服', () => {
    const ids = selectProduct(selectProduct(['dress'], 'brown-boots'), 'mary-janes');
    expect(ids).toEqual(['dress', 'mary-janes']);
    expect(removeProduct(ids, 'mary-janes')).toEqual(['dress']);
  });
  it('所有新鞋可跨端还原，并拒绝一个链接中两双鞋', () => {
    const now = Date.now();
    for (const id of shoes) {
      const look: Look = { items: ['dress', id], person: { ...DEFAULT_PERSON }, cell: 8, expires: now + LINK_TTL };
      const url = new URL(resultUrl(look, 'https://example.org/demo/'));
      expect(readShared(url.search, now)?.items).toEqual(['dress', id]);
      url.searchParams.set('look', `dress,${id},sneakers`);
      expect(readShared(url.search, now)).toBeNull();
    }
  });
  it('换鞋不改变服装图集单元', () => { for (const id of shoes) expect(cellFor(['cardigan', 'jeans', id])).toBe(6); });
});

import { ITEMS } from '../src/lib/catalog';
describe('精简服装目录', () => {
 it('只保留两上装两下装两连衣裙，鞋履不变',()=>{expect(['tops','bottoms','dresses','shoes'].map(category=>ITEMS.filter(p=>p.category===category).length)).toEqual([2,2,2,6]);});
 it('删除款不能拖入或通过分享链接恢复',()=>{expect(selectProduct(['hoodie'],'white-shirt')).toEqual(['hoodie']);const now=Date.now();expect(readShared(`look=white-shirt&until=${now+LINK_TTL}&avatar=0.1`,now)).toBeNull();});
});

import { completeTryOn } from '../src/lib/tryon';
describe('完整试穿图匹配',()=>{
 it('黄卫衣牛仔裙六种发型均使用整图，选择顺序及鞋不影响服装匹配',()=>{for(let hair=0;hair<6;hair++)expect(completeTryOn(['hoodie','sneakers','denim-midi'],hair)).toBe(`coherent-hoodie-denim-${hair}.png`);expect(completeTryOn(['denim-midi','hoodie'],0)).toBe(completeTryOn(['hoodie','denim-midi'],0));});
 it('换款和移除后不能误用上一套整图',()=>{expect(completeTryOn(['cardigan','denim-midi'],0)).toBeNull();expect(completeTryOn(['hoodie'],0)).toBeNull();expect(completeTryOn(['hoodie','denim-midi'],6)).toBeNull();});
});
