import { LookPreview } from './look-preview';
import { ProductRows } from './products';
import { Button } from './ui/button';
import { HAIRS, sum } from '@/lib/catalog';
import type { Look } from '@/lib/wardrobe';
export function Result({ look, share, change, regenerate }: { look: Look; share: () => void; change: () => void; regenerate: () => void }) {
  return <div className="result-surface"><section className="result-visual"><LookPreview cell={look.cell} person={look.person} items={look.items} /><span className="avatar-badge">修长比例 · 穿搭效果示例</span></section><section className="result-panel"><span className="tag">✓ 你的穿搭已准备好</span><p className="eyebrow mt-6">YOUR PERSONAL EDIT</p><h1>喜欢的这一套，带走吧</h1><p className="result-sub">去试试实物，或把灵感留在手机里。</p><ProductRows ids={look.items} /><div className="total"><span>所选单品合计</span><strong>¥{sum(look.items)}</strong></div><Button className="w-full" onClick={share}>扫码带走</Button><div className="actions"><Button variant="outline" onClick={change}>换一套</Button><Button variant="outline" onClick={regenerate}>重新生成</Button></div><p className="result-note">参考设置：{HAIRS[look.person.hair]} · {look.person.height} cm / {look.person.weight} kg<br />图片为预制素材分层拼接示例，选衣即时更新，重新生成使用同组素材。新鞋采用独立商品图参考，未合成人物上脚效果；仅清单中的单品计价。比例经过展示调整，不用于判断尺码、版型或合身程度。</p></section></div>;
}
