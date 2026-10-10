import { useEffect, useState, type ReactNode } from 'react';
import { Wardrobe } from './components/wardrobe';
import { Result } from './components/result';
import { Phone, TryOnList } from './components/phone';
import { Share } from './components/share';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from './components/ui/dialog';
import { asset, HAIRS } from './lib/catalog';
import { readShared, resultUrl } from './lib/wardrobe';
import { useWardrobe, type Mode } from './hooks/use-wardrobe';
interface Modal { title: string; description: string; body: ReactNode }
export default function App() {
  const phone = new URLSearchParams(location.search).has('look');
  const { state, dispatch, generate, reset, cancel, change, idleRemaining, resume } = useWardrobe(!phone);
  const [modal, setModal] = useState<Modal | null>(null);
  const close = () => { setModal(null); resume(); };
  useEffect(() => { if (!state.selected.length && state.person.hair === 0 && state.person.height === 165 && state.person.weight === 55) setModal(null); }, [state.selected, state.person]);
  // Do not leave a stale product modal visible after a phone link expires.
  useEffect(() => { if (!phone) return; const timer = setInterval(() => { if (!readShared(location.search)) setModal(null); }, 1000); return () => clearInterval(timer); }, [phone]);
  const end = () => phone ? location.assign(location.pathname) : setModal({ title: '结束这次体验？', description: '清空衣架和人物设置，已带走的手机链接在有效期内仍可访问。', body: <div className="actions"><Button variant="outline" onClick={close}>继续搭配</Button><Button onClick={() => { reset(); setModal(null); }}>结束并清空</Button></div> });
  const demo = () => setModal({ title: '演示说明与异常设置', description: '这是一款使用预置素材的穿搭交互原型。', body: <><p>六组人脸与发型、三档身形、九组衣着；人物下半身展示比例略作拉长，头脸比例保持不变。身高与体重为参考参数，不是身体测量或尺码预测。</p><p>无真实模型、库存、店员通知或交易。重新生成使用同组图片。五款新鞋以商品图独立展示，选择后隐藏人物图中不匹配的红鞋；尚未合成上脚效果。仅清单中的商品计价。</p><div className="grid gap-2 my-4">{(['success', 'failure', 'timeout'] as Mode[]).map((mode, index) => <Button key={mode} variant={state.mode === mode ? 'default' : 'outline'} onClick={() => { dispatch({ type: 'mode', value: mode }); close(); }}>{['正常生成', '模拟失败', '模拟超时'][index]}</Button>)}</div><p>模拟等待约 1.8 秒，超时演示约 8 秒；无操作 90 秒后提示，15 秒后清空。这些都是原型参数。</p><p>分享 URL 可被修改或转发，仅用于公开参考素材；到期检查不是访问控制，也不代表服务端删除。</p></> });
  const error = state.view === 'failure' || state.view === 'timeout';
  const idle = idleRemaining !== null;
  return <><header><a className="brand" href={location.pathname}>衣间<span>THE PERSONAL WARDROBE</span></a><div className="header-center"><span className="small-dot" />我的灵感衣柜</div><Button variant="ghost" onClick={end}>{phone ? '返回衣柜' : '结束体验'}</Button></header><main>
    {phone ? <Phone showTryOn={look => setModal({ title: '我想试穿这一套', description: '向店员出示以下清单。', body: <TryOnList look={look} /> })} showPurchase={() => setModal({ title: '购买路径已走通', description: '本次仅为演示，没有提交订单、预留库存或扣款。', body: <Button className="w-full mt-4" onClick={close}>返回商品</Button> })} /> : state.view === 'result' && state.result ? <Result look={state.result} change={change} regenerate={() => generate()} share={() => setModal({ title: '把这套穿搭带到手机', description: '扫码查看单品、门店位置和线上商城入口。', body: <Share url={resultUrl(state.result!, location.href)} /> })} /> : <Wardrobe state={state} dispatch={dispatch} generate={() => generate()} cancel={cancel} portrait={() => setModal({ title: HAIRS[state.person.hair], description: '参考人像原图；全身效果为据此制作的示例，细节可能存在差异。', body: <img className="portrait-full mt-4" src={asset(`face-reference-${state.person.hair}.png`)} alt={`${HAIRS[state.person.hair]}参考原图`} /> })} />}
  </main><footer><span>不拍照，也能发现新的穿搭灵感</span><Button variant="ghost" size="sm" onClick={demo} disabled={state.view === 'generating'}>演示说明与异常设置</Button></footer>
    <Dialog open={idle || error || modal !== null} onOpenChange={open => { if (!open) { if (error) cancel(); close(); } }}><DialogContent><DialogTitle className="text-2xl font-medium pr-6 mb-3">{idle ? '还在搭配吗？' : error ? state.view === 'timeout' ? '这次等待有点久' : '这次没有生成成功' : modal?.title}</DialogTitle><DialogDescription className="text-sm text-muted-foreground mb-4">{idle ? `为下一位顾客准备，${idleRemaining} 秒后将清空衣柜。` : error ? '衣架和人物设置已保留，可以重试或继续搭配。' : modal?.description}</DialogDescription>{idle ? <Button className="w-full" onClick={close}>继续体验</Button> : error ? <div className="actions"><Button variant="outline" onClick={cancel}>继续搭配</Button><Button onClick={() => generate(true)}>重试</Button></div> : modal?.body}</DialogContent></Dialog>
  </>;
}
