import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { asset, HAIRS } from '@/lib/catalog';
import { type Person, validParameter } from '@/lib/wardrobe';
function NumberField({ name, value, disabled, onChange }: { name: 'height' | 'weight'; value: number; disabled: boolean; onChange: (value: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState(false);
  useEffect(() => { setDraft(String(value)); }, [value]);
  const [min, max, label] = name === 'height' ? [140, 200, '身高 / cm'] : [35, 150, '体重 / kg'];
  return <div className="field"><label htmlFor={name}>{label}</label><Input id={name} type="number" min={min} max={max} step={1} inputMode="numeric" value={draft} disabled={disabled} aria-invalid={error} aria-describedby={error ? `${name}-error` : undefined} onChange={event => { const text = event.target.value; setDraft(text); const valid = text !== '' && validParameter(name, Number(text)); setError(!valid); if (valid) onChange(Number(text)); }} onBlur={() => { if (!validParameter(name, Number(draft)) || draft === '') setDraft(String(value)); setError(false); }} />{error && <p className="error" id={`${name}-error`} role="alert">请输入 {min}–{max} 的整数</p>}</div>;
}
export function Parameters({ person, disabled, onChange }: { person: Person; disabled: boolean; onChange: (key: keyof Person, value: number) => void }) {
  return <div className="parameters"><div className="parameter-heading">人物与发型 <span>修改后立即预览 · 衣架保留</span></div><div className="face-picker" aria-label="选择人物与发型">{HAIRS.map((name, index) => <button key={name} className={`face-choice ${index === person.hair ? 'selected' : ''}`} aria-pressed={index === person.hair} disabled={disabled} onClick={() => onChange('hair', index)}><img src={asset(`face-reference-${index}.png`)} alt="" loading="lazy" /><span>{name}</span></button>)}</div><div className="parameter-grid grid grid-cols-2 gap-3"><NumberField name="height" value={person.height} disabled={disabled} onChange={value => onChange('height', value)} /><NumberField name="weight" value={person.weight} disabled={disabled} onChange={value => onChange('weight', value)} /></div><p className="parameter-note">修长比例示意 · 人物按镜面高度展示，身高体重共同匹配三档参考身形。同档外观相同，不预测真实体型或尺码。</p></div>;
}
