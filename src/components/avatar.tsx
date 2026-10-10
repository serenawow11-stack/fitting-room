import { completeTryOn, tryOnLayers } from '@/lib/tryon';
import { useState, type CSSProperties } from 'react';
import { HAIRS, BUILDS, asset, type ItemId } from '@/lib/catalog';
import { appearance, type Appearance, type Person } from '@/lib/wardrobe';
const ROWS: Record<string, number[]> = { '4-1': [0, 392, 784, 1182], '5-2': [0, 415, 830, 1254] };
// Lengthen the lower silhouette 12%, while keeping the face and upper-body pixels proportional.
// This is an editorial reference proportion, not an anatomical or sizing model.
const SPLIT = 0.52;
const LEG_SCALE = 1.12;
function AvatarTile({ cell, a, height, items }: { cell: number; a: Appearance; height?: number; items: ItemId[] }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const row = Math.floor(cell / 3), col = cell % 3;
  const ys = ROWS[`${a.hair}-${a.body}`] || [0, 418, 836, 1254];
  const ch = ys[row + 1] - ys[row];
  const ratio = 1 + (1 - SPLIT) * (LEG_SCALE - 1);
  const image = asset(`hd-face-${a.hair}-${a.body}.png`);
  const sliceStyle = (start: number, fraction: number): CSSProperties => ({
    width: '300%', height: `${1254 / (ch * fraction) * 100}%`, left: `${col * -100}%`, top: `${-(ys[row] + ch * start) / (ch * fraction) * 100}%`,
  });
  const label = `${HAIRS[a.hair]}、参考身形 ${BUILDS[a.body]}、${items.length === 0 ? '基础内搭' : '已选穿搭'}`;
  return <div className="person-frame" style={{ '--person-scale': height ? height / 200 : 1 } as CSSProperties}>
    <div className="tailored-person" style={{ aspectRatio: `418 / ${ch * ratio}` }} role="img" aria-label={label}>
      <div className="avatar-slice" style={{ height: `${SPLIT / ratio * 100}%` }}><img key={`upper-${attempt}`} src={image} style={sliceStyle(0, SPLIT)} alt="" onLoad={() => setLoaded(true)} onError={() => setFailed(true)} /></div>
      <div className="avatar-lower" style={{ height: `${(1 - SPLIT) * LEG_SCALE / ratio * 100}%` }}>
        {(['left', 'right'] as const).map(side => <div key={side} className={`leg-half leg-${side}`}><div className="leg-tile"><img key={`lower-${side}-${attempt}`} src={image} style={sliceStyle(SPLIT, 1 - SPLIT)} alt="" onError={() => setFailed(true)} /></div></div>)}
      </div>
      {tryOnLayers(items).map(layer => <div key={layer.id} className="tryon-band" style={{ top: `${layer.start * 100}%`, height: `${(layer.end-layer.start)*100}%` }}><img src={asset(`tryon-${layer.id}.png`)} alt="" style={{width:'100%', height: `${100/(layer.sourceEnd-layer.sourceStart)}%`, top:`${-layer.sourceStart/(layer.sourceEnd-layer.sourceStart)*100}%`, transform:`scaleX(${a.body === 0 ? 1.03 : a.body === 2 ? 1.32 : 1.16})`}} onError={() => setFailed(true)} /></div>)}
      {(!loaded || failed) && <div className="asset-status" role="status">{failed ? <button onClick={() => { setFailed(false); setLoaded(false); setAttempt(v => v + 1); }}>图片载入失败，点击重试</button> : '正在载入人物…'}</div>}
    </div>
  </div>;
}
function CompleteAvatar({ src, a }: { src: string; a: Appearance }) {
 const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
 const [attempt, setAttempt] = useState(0);
 return <div className="person-frame"><div className="tailored-person coherent-person" role="img" aria-label={`${HAIRS[a.hair]}、完整试穿参考、黄卫衣与牛仔半裙`} style={{ aspectRatio: '2 / 3' }}>
 <img key={attempt} className="coherent-image" src={asset(src)} alt="" style={{transform: `scaleX(${a.body === 0 ? .94 : a.body === 2 ? 1.09 : 1})`}} onLoad={()=>setStatus('ready')} onError={()=>setStatus('error')} />
 {status !== 'ready' && <div className="asset-status" role="status">{status === 'loading' ? '正在载入完整试穿图…' : <button onClick={()=>{setStatus('loading');setAttempt(v=>v+1);}}>图片载入失败，点击重试</button>}</div>}
 </div></div>;
}
export function Avatar({ cell, person, items = [] }: { cell: number; person: Person | Appearance; items?: ItemId[] }) {
  const a = 'body' in person ? person : appearance(person);
  const complete = completeTryOn(items, a.hair);
  if (complete) return <CompleteAvatar key={complete} src={complete} a={a} />;
  return <AvatarTile key={`${a.hair}-${a.body}-${cell}`} cell={cell} a={a} items={items} height={'height' in person ? person.height : undefined} />;
}
