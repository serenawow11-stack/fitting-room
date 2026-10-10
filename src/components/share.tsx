import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './ui/button';
export function Share({ url }: { url: string }) {
  const [code, setCode] = useState(''); const [error, setError] = useState(''); const [copied, setCopied] = useState(false);
  useEffect(() => { let active = true; QRCode.toDataURL(url, { width: 240, margin: 2, errorCorrectionLevel: 'M' }).then(value => { if (active) setCode(value); }).catch(() => { if (active) setError('二维码生成失败，请复制下方链接。'); }); return () => { active = false; }; }, [url]);
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(url).hostname);
  return <><div className="qr">{code ? <img src={code} alt="穿搭结果二维码" width={240} height={240} /> : <p role="status">{error || '正在准备二维码…'}</p>}</div><a className="small-link" href={url} target="_blank" rel="noopener noreferrer">先预览手机结果页</a><Button className="w-full" onClick={async () => { try { await navigator.clipboard.writeText(url); setCopied(true); } catch { setError('复制不可用，请手动复制链接。'); } }}>{copied ? '链接已复制' : '复制结果链接'}</Button>{error && <p role="alert">{error}</p>}<input className="share-url" value={url} readOnly aria-label="结果链接" onFocus={event => event.target.select()} /><p>链接 24 小时内有效。大屏结束后仍可访问。</p><p>{local ? '当前为本机预览，手机无法直接访问 localhost；发布后再扫码。' : '手机需要有当前站点的访问权限。'}链接仅携带商品及参考素材编号，不含身高体重数值；前端到期检查不代表服务端删除。</p></>;
}
