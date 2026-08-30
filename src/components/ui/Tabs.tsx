'use client';

// Aynı veri kümesinin gelen ve gönderilen görünümlerini değiştirir.
export function Tabs<T extends string>({ tabs, activeValue, onChange }: { tabs: Array<{ label: string; value: T }>; activeValue: T; onChange: (value: T) => void }) {
  return <div className="flex w-fit gap-1.5 rounded-lg bg-bg-elevated p-1">{tabs.map((tab) => <button key={tab.value} type="button" onClick={() => onChange(tab.value)} className={`rounded-[7px] px-3.5 py-1.5 text-[13px] ${activeValue === tab.value ? 'bg-bg-elevated-hover text-text-primary' : 'text-text-tertiary'}`}>{tab.label}</button>)}</div>;
}
