'use client'
// Botão de cobrança via WhatsApp. Gera link wa.me com texto pré-formatado.

import { MessageCircle } from 'lucide-react'

type Config = {
  pix_chave: string | null
  pix_tipo: string | null
  beneficiario: string | null
  banco: string | null
  prazo_dia: number | null
  whatsapp_template: string | null
}

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function brl(n: number) {
  return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function WhatsAppButton({
  fellow,
  cobranca,
  config,
}: {
  fellow: { nome: string; whatsapp: string | null }
  cobranca: { mes_referencia: string; valor: number; status: string }
  config: Config | null
}) {
  function buildText() {
    const [, mm] = cobranca.mes_referencia.split('-')
    const mes_extenso = MESES[Number(mm) - 1] ?? cobranca.mes_referencia.slice(0, 7)
    const template = config?.whatsapp_template ??
      'Oi {nome}! Lembrete da mensalidade do Amplifica de {mes_extenso}: R$ {valor}. PIX: {pix_chave} ({beneficiario}). Prazo: dia {prazo_dia}.'
    return template
      .replace(/\{nome\}/g, fellow.nome.split(' ')[0] ?? fellow.nome)
      .replace(/\{nome_completo\}/g, fellow.nome)
      .replace(/\{mes_extenso\}/g, mes_extenso)
      .replace(/\{mes\}/g, cobranca.mes_referencia.slice(0, 7))
      .replace(/\{valor\}/g, brl(Number(cobranca.valor)))
      .replace(/\{pix_chave\}/g, config?.pix_chave ?? '(configure no painel)')
      .replace(/\{pix_tipo\}/g, config?.pix_tipo ?? '')
      .replace(/\{beneficiario\}/g, config?.beneficiario ?? '')
      .replace(/\{banco\}/g, config?.banco ?? '')
      .replace(/\{prazo_dia\}/g, String(config?.prazo_dia ?? 10))
  }

  function handleClick() {
    const text = buildText()
    const numero = fellow.whatsapp?.replace(/\D/g, '') ?? ''
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(text)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const disabled = cobranca.status === 'pago'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      title={disabled ? 'Cobrança já paga' : 'Cobrar via WhatsApp'}
      className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <MessageCircle className="h-3 w-3" />
      WhatsApp
    </button>
  )
}
