import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { SETS, type Drawer, type ItemId } from '@/lib/catalog';
import { DEFAULT_PERSON, IDLE_MS, IDLE_WARNING_MS, LINK_TTL, cellFor, removeProduct, selectProduct, validParameter, type Look, type Person } from '@/lib/wardrobe';
export type Mode = 'success' | 'failure' | 'timeout';
export type View = 'wardrobe' | 'generating' | 'result' | 'failure' | 'timeout';
export interface State { drawer: Drawer; selected: ItemId[]; person: Person; view: View; mode: Mode; result: Look | null }
export const initialState = (): State => ({ drawer: 'tops', selected: [], person: { ...DEFAULT_PERSON }, view: 'wardrobe', mode: 'success', result: null });
export type Action = { type: 'select'; id: string } | { type: 'remove'; id: ItemId } | { type: 'set'; id: string } | { type: 'person'; key: keyof Person; value: number } | { type: 'drawer'; value: Drawer } | { type: 'mode'; value: Mode } | { type: 'start' } | { type: 'complete'; result: Look } | { type: 'error'; value: 'failure' | 'timeout' } | { type: 'cancel' } | { type: 'change' } | { type: 'reset' };
export function reducer(state: State, action: Action): State {
  if (state.view === 'generating' && ['select', 'remove', 'set', 'person', 'drawer'].includes(action.type)) return state;
  switch (action.type) {
    case 'select': return { ...state, selected: selectProduct(state.selected, action.id), result: null };
    case 'remove': return { ...state, selected: removeProduct(state.selected, action.id), result: null };
    case 'set': { const set = SETS.find(outfit => outfit.id === action.id); return set ? { ...state, selected: [...set.items], result: null } : state; }
    case 'person': return validParameter(action.key, action.value) ? { ...state, person: { ...state.person, [action.key]: action.value }, result: null } : state;
    case 'drawer': return { ...state, drawer: action.value };
    case 'mode': return { ...state, mode: action.value };
    case 'start': return state.selected.length ? { ...state, view: 'generating' } : state;
    case 'complete': return state.view === 'generating' ? { ...state, view: 'result', result: action.result } : state;
    case 'error': return state.view === 'generating' ? { ...state, view: action.value } : state;
    case 'cancel': return { ...state, view: 'wardrobe' };
    case 'change': return { ...state, view: 'wardrobe', selected: [], result: null };
    case 'reset': return { ...initialState(), mode: state.mode };
  }
}
export function useWardrobe(enabled: boolean) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const [idleRemaining, setIdleRemaining] = useState<number | null>(null);
  const lastInput = useRef(Date.now());
  const generation = useRef(0);
  const running = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const cancelTask = useCallback(() => { generation.current++; running.current = false; clearTimeout(timer.current); }, []);
  const resume = useCallback(() => { lastInput.current = Date.now(); setIdleRemaining(null); }, []);
  const reset = useCallback(() => { cancelTask(); dispatch({ type: 'reset' }); resume(); }, [cancelTask, resume]);
  const generate = useCallback((retry = false) => {
    if (running.current || !state.selected.length) return;
    running.current = true;
    const request = ++generation.current;
    const mode = retry ? 'success' : state.mode;
    const snapshot: Look = { items: [...state.selected], person: { ...state.person }, cell: cellFor(state.selected), expires: Date.now() + LINK_TTL };
    dispatch({ type: 'start' });
    timer.current = setTimeout(() => {
      if (request !== generation.current) return;
      running.current = false; resume();
      if (mode !== 'success') dispatch({ type: 'error', value: mode });
      else dispatch({ type: 'complete', result: snapshot });
    }, mode === 'timeout' ? 8000 : 1800);
  }, [state.selected, state.person, state.mode, resume]);
  useEffect(() => () => cancelTask(), [cancelTask]);
  useEffect(() => {
    if (!enabled) return;
    const activity = () => { lastInput.current = Date.now(); };
    document.addEventListener('pointerdown', activity); document.addEventListener('keydown', activity);
    const interval = setInterval(() => {
      const changed = state.selected.length > 0 || Object.keys(DEFAULT_PERSON).some(key => state.person[key as keyof Person] !== DEFAULT_PERSON[key as keyof Person]);
      if (!changed || state.view === 'generating') return;
      const elapsed = Date.now() - lastInput.current;
      if (elapsed >= IDLE_MS + IDLE_WARNING_MS) reset();
      else setIdleRemaining(elapsed >= IDLE_MS ? Math.ceil((IDLE_MS + IDLE_WARNING_MS - elapsed) / 1000) : null);
    }, 1000);
    return () => { clearInterval(interval); document.removeEventListener('pointerdown', activity); document.removeEventListener('keydown', activity); };
  }, [enabled, state.selected, state.person, state.view, reset]);
  return { state, dispatch, generate, reset, idleRemaining, resume, cancel: () => { cancelTask(); dispatch({ type: 'cancel' }); resume(); }, change: () => { cancelTask(); dispatch({ type: 'change' }); resume(); } };
}
