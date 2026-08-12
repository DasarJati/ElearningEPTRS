import { useEffect, useMemo, useState } from 'react';
import { evaluate } from 'mathjs';

const scientificButtons = [
  { label: 'sin', value: 'sin(', tone: 'function' },
  { label: 'cos', value: 'cos(', tone: 'function' },
  { label: 'tan', value: 'tan(', tone: 'function' },
  { label: 'log', value: 'log10(', tone: 'function' },
  { label: 'ln', value: 'log(', tone: 'function' },
  { label: 'sin⁻¹', value: 'asin(', tone: 'function' },
  { label: 'cos⁻¹', value: 'acos(', tone: 'function' },
  { label: 'tan⁻¹', value: 'atan(', tone: 'function' },
  { label: '√', value: 'sqrt(', tone: 'function' },
  { label: 'x²', action: 'square', tone: 'function' },
  { label: 'π', value: 'pi', tone: 'function' },
  { label: 'e', value: 'e', tone: 'function' },
  { label: 'xʸ', value: '^', tone: 'function' },
  { label: '1/x', action: 'reciprocal', tone: 'function' },
  { label: 'n!', value: '!', tone: 'function' },
];

const keypadButtons = [
  { label: 'MC', action: 'memory-clear', tone: 'utility' },
  { label: 'MR', action: 'memory-recall', tone: 'utility' },
  { label: 'M+', action: 'memory-add', tone: 'utility' },
  { label: 'DEL', action: 'delete', tone: 'danger' },
  { label: 'AC', action: 'clear', tone: 'danger' },
  { label: '(', value: '(', tone: 'utility' },
  { label: ')', value: ')', tone: 'utility' },
  { label: '%', action: 'percent', tone: 'utility' },
  { label: '÷', value: '/', tone: 'operator' },
  { label: '×', value: '*', tone: 'operator' },
  { label: '7', value: '7' },
  { label: '8', value: '8' },
  { label: '9', value: '9' },
  { label: '−', value: '-', tone: 'operator' },
  { label: 'ANS', action: 'answer', tone: 'utility' },
  { label: '4', value: '4' },
  { label: '5', value: '5' },
  { label: '6', value: '6' },
  { label: '+', value: '+', tone: 'operator' },
  { label: '±', action: 'negate', tone: 'utility' },
  { label: '1', value: '1' },
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '=', action: 'calculate', tone: 'equals', rowSpan: true },
  { label: '0', value: '0', colSpan: true },
  { label: '.', value: '.' },
];

const toneClasses = {
  number: 'border-slate-700 bg-slate-800 text-white hover:bg-slate-700',
  function: 'border-indigo-800/80 bg-indigo-950/70 text-indigo-200 hover:bg-indigo-900',
  utility: 'border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600',
  operator: 'border-cyan-600/40 bg-cyan-500/15 text-cyan-200 hover:bg-cyan-500/25',
  danger: 'border-rose-500/30 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25',
  equals: 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500',
};

const formatExpression = (value) => value
  .replaceAll('*', '×')
  .replaceAll('/', '÷')
  .replaceAll('sqrt', '√')
  .replaceAll('log10', 'log');

const formatResult = (value) => {
  if (!Number.isFinite(value)) return 'Math error';
  if (Math.abs(value) > 1e12 || (Math.abs(value) > 0 && Math.abs(value) < 1e-9)) {
    return value.toExponential(8).replace(/\.?0+e/, 'e');
  }
  return Number(value.toPrecision(12)).toString();
};

export default function ScientificCalculator() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('0');
  const [angleMode, setAngleMode] = useState('DEG');
  const [memory, setMemory] = useState(0);
  const [answer, setAnswer] = useState(0);
  const [history, setHistory] = useState([]);
  const [justEvaluated, setJustEvaluated] = useState(false);

  const scope = useMemo(() => {
    const toRadians = (value) => angleMode === 'DEG' ? value * Math.PI / 180 : value;
    const fromRadians = (value) => angleMode === 'DEG' ? value * 180 / Math.PI : value;

    return {
      sin: (value) => Math.sin(toRadians(value)),
      cos: (value) => Math.cos(toRadians(value)),
      tan: (value) => Math.tan(toRadians(value)),
      asin: (value) => fromRadians(Math.asin(value)),
      acos: (value) => fromRadians(Math.acos(value)),
      atan: (value) => fromRadians(Math.atan(value)),
    };
  }, [angleMode]);

  const calculate = () => {
    if (!expression.trim()) return;

    try {
      const calculated = evaluate(expression, scope);
      if (typeof calculated !== 'number') throw new Error('Result is not numeric');

      const formatted = formatResult(calculated);
      setResult(formatted);
      setAnswer(calculated);
      setHistory((items) => [{ expression, result: formatted }, ...items].slice(0, 8));
      setJustEvaluated(true);
    } catch {
      setResult('Syntax error');
      setJustEvaluated(true);
    }
  };

  const appendValue = (value) => {
    const startsNewExpression = justEvaluated && /^[\d.(]|pi$|e$/.test(value);
    setExpression((current) => startsNewExpression ? value : current + value);
    setResult('0');
    setJustEvaluated(false);
  };

  const numericResult = () => {
    const value = Number(result);
    return Number.isFinite(value) ? value : answer;
  };

  const handleAction = (action) => {
    switch (action) {
      case 'clear':
        setExpression('');
        setResult('0');
        setJustEvaluated(false);
        break;
      case 'delete':
        setExpression((current) => current.slice(0, -1));
        setJustEvaluated(false);
        break;
      case 'calculate':
        calculate();
        break;
      case 'square':
        appendValue('^2');
        break;
      case 'reciprocal':
        setExpression((current) => current ? `1/(${current})` : '1/(');
        setJustEvaluated(false);
        break;
      case 'percent':
        setExpression((current) => current ? `(${current})/100` : '');
        setJustEvaluated(false);
        break;
      case 'negate':
        setExpression((current) => current ? `-(${current})` : '-');
        setJustEvaluated(false);
        break;
      case 'answer':
        appendValue(`(${answer})`);
        break;
      case 'memory-clear':
        setMemory(0);
        break;
      case 'memory-recall':
        appendValue(`(${memory})`);
        break;
      case 'memory-add':
        setMemory((current) => current + numericResult());
        break;
      default:
        break;
    }
  };

  const pressButton = ({ value, action }) => {
    if (action) handleAction(action);
    else appendValue(value);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (/^[0-9.]$/.test(event.key)) appendValue(event.key);
      else if (['+', '-', '*', '/', '(', ')', '^'].includes(event.key)) appendValue(event.key);
      else if (event.key === 'Enter' || event.key === '=') {
        event.preventDefault();
        calculate();
      } else if (event.key === 'Backspace') handleAction('delete');
      else if (event.key === 'Escape') handleAction('clear');
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div className="w-full select-none rounded-lg bg-slate-950 p-1.5 text-white shadow-2xl">
      <div className="mb-1.5 flex items-center justify-between px-0.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-300">PTRS Scientific</p>
          <p className="text-[9px] text-slate-500">Natural display</p>
        </div>
        <div className="flex items-center gap-2">
          {memory !== 0 && <span className="rounded-md bg-emerald-500/15 px-2 py-1 text-[10px] font-bold text-emerald-300">M</span>}
          <button type="button" onClick={() => setAngleMode((mode) => mode === 'DEG' ? 'RAD' : 'DEG')} className="rounded-md border border-indigo-500/30 bg-indigo-500/15 px-2 py-1 text-[10px] font-bold text-indigo-200 transition hover:bg-indigo-500/25">{angleMode}</button>
        </div>
      </div>

      <div className="mb-1.5 overflow-hidden rounded-md border border-slate-700 bg-gradient-to-b from-slate-800 to-slate-900 p-1.5 shadow-inner">
        <div className="h-4 overflow-x-auto whitespace-nowrap text-right font-mono text-[10px] text-slate-400">{expression ? formatExpression(expression) : 'Ready'}</div>
        <div data-calculator-result className={`overflow-x-auto whitespace-nowrap text-right font-mono text-xl font-semibold leading-tight tracking-tight ${result.includes('error') ? 'text-rose-300' : 'text-white'}`}>{result}</div>
      </div>

      <div className="mb-1.5 grid grid-cols-5 gap-1">
        {scientificButtons.map((button) => <CalculatorButton key={button.label} button={button} onPress={pressButton} />)}
      </div>

      <div className="grid grid-cols-5 gap-1">
        {keypadButtons.map((button) => <CalculatorButton key={button.label} button={button} onPress={pressButton} />)}
      </div>

      <details className="mt-1.5 border-t border-slate-800 pt-1">
        <summary className="cursor-pointer text-[10px] font-semibold text-slate-500 transition hover:text-slate-300">History ({history.length})</summary>
        <div className="mt-2 max-h-24 space-y-1.5 overflow-y-auto rounded-lg bg-slate-900 p-2">
          {history.length === 0 ? <p className="text-[10px] text-slate-600">No calculations yet.</p> : history.map((entry, index) => (
            <button type="button" key={`${entry.expression}-${index}`} onClick={() => { setExpression(entry.expression); setResult(entry.result); }} className="block w-full rounded-md px-2 py-1 text-right font-mono text-[10px] text-slate-400 hover:bg-slate-800">
              <span className="block truncate">{formatExpression(entry.expression)}</span><span className="text-emerald-300">= {entry.result}</span>
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}

function CalculatorButton({ button, onPress }) {
  const tone = toneClasses[button.tone || 'number'];
  return (
    <button type="button" onClick={() => onPress(button)} className={`flex min-h-7 items-center justify-center rounded border px-1 text-[10px] font-semibold shadow-sm transition active:scale-95 ${tone} ${button.colSpan ? 'col-span-2' : ''} ${button.rowSpan ? 'row-span-2' : ''}`}>
      {button.label}
    </button>
  );
}
