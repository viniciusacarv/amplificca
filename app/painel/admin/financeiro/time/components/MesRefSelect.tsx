'use client'
// Dois selects (mês + ano) que substituem <input type="month">. Aceita defaultValue "YYYY-MM".

import { useState } from 'react'

const MESES = [
  { v: '01', l: 'Janeiro' }, { v: '02', l: 'Fevereiro' }, { v: '03', l: 'Março' },
  { v: '04', l: 'Abril' },   { v: '05', l: 'Maio' },      { v: '06', l: 'Junho' },
  { v: '07', l: 'Julho' },   { v: '08', l: 'Agosto' },    { v: '09', l: 'Setembro' },
  { v: '10', l: 'Outubro' }, { v: '11', l: 'Novembro' },  { v: '12', l: 'Dezembro' },
]

export default function MesRefSelect({ defaultValue, anoMin = 2024, anoMax }: { defaultValue?: string; anoMin?: number; anoMax?: number }) {
  const hoje = new Date()
  const dvAno = defaultValue?.slice(0, 4) ?? String(hoje.getFullYear())
  const dvMes = defaultValue?.slice(5, 7) ?? String(hoje.getMonth() + 1).padStart(2, '0')
  const max = anoMax ?? hoje.getFullYear() + 2
  const [ano, setAno] = useState(dvAno)
  const [mes, setMes] = useState(dvMes)
  const anos: string[] = []
  for (let y = anoMin; y <= max; y++) anos.push(String(y))
  const cls = 'rounded-lg bg-gray-950 border border-gray-800 px-3 py-2 text-sm text-gray-200'

  return (
    <div className="flex gap-2">
      <select name="mes_referencia_mes" value={mes} onChange={(e) => setMes(e.target.value)} className={`${cls} flex-1`}>
        {MESES.map((m) => <option key={m.v} value={m.v}>{m.l}</option>)}
      </select>
      <select name="mes_referencia_ano" value={ano} onChange={(e) => setAno(e.target.value)} className={cls}>
        {anos.map((a) => <option key={a} value={a}>{a}</option>)}
      </select>
    </div>
  )
}
