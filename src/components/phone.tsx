import { useEffect, useState } from 'react';
import { LookPreview } from './look-preview';
import { ProductRows } from './products';
import { Button } from './ui/button';
import { chosen, sum } from '@/lib/catalog';
import { readShared, type SharedLook } from '@/lib/wardrobe';
export function TryOnList({ look }: { look: SharedLook }) { return <>{chosen(look.items).map(product => <div className="selected-row" key={product.id}><div>{product.name}<small>{product.code} · {product.location}</small></div><span>{product.color}</span></div>)}<p>向店员出示清单或按位置寻找。位置为示例，此操作不会通知店员或预约试衣间。</p></>; }
export function Phone({ showTryOn, showPurchase }: { showTryOn: (look: SharedLook) => void; showPurchase: () => void }) {
  const [now, setNow] = useState(Date.now()); const [size, setSize] = useState('');
  useEffect(() => { const refresh = () => setNow(Date.now()); const timer = setInterval(refresh, 1000); document.addEventListener('visibilitychange', refresh); return () => { clearInterval(timer); document.removeEventListener('visibilitychange', refresh); }; }, []);
  const look = readShared(location.search, now), shop = new URLSearchParams(location.search).get('shop') === '1';
  if (!look) return <section className="shop-empty"><p className="eyebrow">THIS LOOK HAS EXPIRED</p><h1>穿搭链接已到期或无效</h1><p>回到衣柜，重新发现喜欢的搭配。</p><Button asChild><a href={location.pathname}>返回衣柜</a></Button></section>;
  const shopUrl = new URL(location.href); shopUrl.searchParams.set('shop', '1'); const back = new URL(location.href); back.searchParams.delete('shop');
  if (shop) return <section className="phone-page"><a className="plain" href={back.toString()}>返回我的穿搭</a><p className="eyebrow mt-6">YIJIAN / ONLINE STORE</p><h1>把喜欢的穿搭带回家</h1><div className="store-banner">线上商城演示 · 不产生订单或支付</div><div className="phone-section"><ProductRows ids={look.items} mobile /><div className="field mt-5"><label htmlFor="size">选择参考尺码</label><select id="size" value={size} onChange={event => setSize(event.target.value)}><option value="">请选择尺码</option>{['S', 'M', 'L', 'XL'].map(value => <option key={value}>{value}</option>)}</select></div><p>演示统一尺码选择，不代表真实商品尺码或库存。</p><div className="total"><span>示例合计</span><strong>¥{sum(look.items)}</strong></div><Button className="w-full" disabled={!size} onClick={showPurchase}>体验购买流程</Button></div></section>;
  return <section className="phone-page"><p className="eyebrow">YOUR SAVED WARDROBE</p><h1>这一套，刚好喜欢</h1><p className="result-sub">你的穿搭与单品清单，都在这里。</p><div className="phone-visual"><LookPreview cell={look.cell} person={look.appearance} items={look.items} /><span className="avatar-badge">修长比例 · 配套效果示例</span></div><div className="phone-section"><h2>这套穿搭里有什么</h2><ProductRows ids={look.items} mobile /><div className="total"><span>参考合计</span><strong>¥{sum(look.items)}</strong></div></div><div className="phone-section"><h2>在门店试穿</h2><p>把清单出示给店员，或根据陈列位置自行寻找。</p><Button variant="outline" className="w-full" onClick={() => showTryOn(look)}>查看试穿清单与位置</Button></div><Button asChild className="w-full"><a href={shopUrl.toString()}>进入线上商城</a></Button><p className="result-note">商品、价格与位置为演示数据，不会产生订单。<br />有效至 {new Date(look.expires).toLocaleString('zh-CN')}。</p></section>;
}
