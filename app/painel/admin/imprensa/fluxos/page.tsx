// app/painel/admin/imprensa/fluxos/page.tsx
// Documentação viva do processo de Assessoria de Imprensa — com atalhos operacionais.
// Acesso restrito a admins (herda do layout /painel/admin).

'use client'

import { useState } from 'react'
import Link from 'next/link'

// ═══════════════════════════════════════════════════════════════════════════
// Paleta e componentes visuais
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  bg: '#0f0f0f',
  card: '#1a1a1a',
  border: '#2a2a2a',
  accent: '#4ade80',
  accentBg: '#052e16',
  blue: '#60a5fa',
  blueBg: '#1e3a5f',
  yellow: '#fbbf24',
  yellowBg: '#451a03',
  red: '#f87171',
  redBg: '#450a0a',
  purple: '#a78bfa',
  purpleBg: '#2e1065',
  orange: '#fb923c',
  orangeBg: '#431407',
  text: '#f1f5f9',
  muted: '#94a3b8',
  mutedDark: '#475569',
} as const

type ColorKey = keyof typeof colors
type NodeColor = 'card' | 'green' | 'blue' | 'yellow' | 'red' | 'purple' | 'orange'

const colorMap: Record<NodeColor, { bg: string; border: string; text: string }> = {
  card: { bg: colors.card, border: colors.border, text: colors.text },
  green: { bg: colors.accentBg, border: colors.accent, text: colors.accent },
  blue: { bg: colors.blueBg, border: colors.blue, text: colors.blue },
  yellow: { bg: colors.yellowBg, border: colors.yellow, text: colors.yellow },
  red: { bg: colors.redBg, border: colors.red, text: colors.red },
  purple: { bg: colors.purpleBg, border: colors.purple, text: colors.purple },
  orange: { bg: colors.orangeBg, border: colors.orange, text: colors.orange },
}

function Node({
  label, sub, color = 'card', icon, wide, small, badge,
}: {
  label: string; sub?: string; color?: NodeColor; icon?: string;
  wide?: boolean; small?: boolean; badge?: 'done' | 'planned';
}) {
  const c = colorMap[color]
  return (
    <div
      style={{
        position: 'relative',
        background: c.bg,
        border: `1.5px solid ${c.border}`,
        borderRadius: 10,
        padding: small ? '8px 14px' : '12px 18px',
        minWidth: wide ? 220 : small ? 130 : 160,
        maxWidth: wide ? 300 : 220,
        textAlign: 'center',
        boxShadow: `0 0 12px ${c.border}33`,
      }}
    >
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: -8,
            right: -6,
            background: badge === 'done' ? colors.accent : colors.yellow,
            color: '#0a0a0a',
            fontSize: 9,
            fontWeight: 800,
            padding: '2px 6px',
            borderRadius: 10,
            letterSpacing: 0.3,
          }}
        >
          {badge === 'done' ? 'NO PAINEL' : 'PLANEJADO'}
        </div>
      )}
      {icon && <div style={{ fontSize: 18, marginBottom: 4 }}>{icon}</div>}
      <div style={{ color: c.text, fontWeight: 600, fontSize: small ? 12 : 13, lineHeight: 1.3 }}>
        {label}
      </div>
      {sub && (
        <div style={{ color: colors.muted, fontSize: 11, marginTop: 4, lineHeight: 1.3 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function Arrow({
  label, vertical = true, dashed,
}: { label?: string; vertical?: boolean; dashed?: boolean }) {
  if (vertical) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '2px 0' }}>
        <div
          style={{
            width: 1.5,
            height: 28,
            background: dashed
              ? 'repeating-linear-gradient(to bottom, #475569 0, #475569 4px, transparent 4px, transparent 8px)'
              : colors.mutedDark,
          }}
        />
        {label && (
          <div
            style={{
              color: colors.muted, fontSize: 10, background: colors.bg,
              padding: '0 6px', marginTop: -2, borderRadius: 4,
            }}
          >
            {label}
          </div>
        )}
        <div style={{ color: colors.mutedDark, fontSize: 16, lineHeight: 1, marginTop: -2 }}>▾</div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', margin: '0 4px' }}>
      <div
        style={{
          height: 1.5, width: 32,
          background: dashed
            ? 'repeating-linear-gradient(to right, #475569 0, #475569 4px, transparent 4px, transparent 8px)'
            : colors.mutedDark,
        }}
      />
      {label && (
        <div style={{ color: colors.muted, fontSize: 10, background: colors.bg, padding: '0 4px' }}>
          {label}
        </div>
      )}
      <div style={{ color: colors.mutedDark, fontSize: 14 }}>▶</div>
    </div>
  )
}

function Diamond({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
      <div
        style={{
          minWidth: 120, height: 44,
          background: colors.card,
          border: `1.5px solid ${colors.yellow}`,
          borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: colors.yellow, fontSize: 12, fontWeight: 700,
          padding: '0 14px',
          boxShadow: `0 0 10px ${colors.yellow}33`,
        }}
      >
        ◆ {label}
      </div>
    </div>
  )
}

function SectionTitle({ n, title, subtitle }: { n: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: '50%',
            background: colors.accentBg, border: `2px solid ${colors.accent}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: colors.accent, fontWeight: 800, fontSize: 15,
          }}
        >
          {n}
        </div>
        <h2 style={{ color: colors.text, fontSize: 20, fontWeight: 700, margin: 0 }}>{title}</h2>
      </div>
      {subtitle && (
        <p style={{ color: colors.muted, fontSize: 13, margin: '0 0 0 48px' }}>{subtitle}</p>
      )}
    </div>
  )
}

function Tag({ label, color }: { label: string; color: NodeColor }) {
  const c = colorMap[color]
  return (
    <span
      style={{
        background: c.bg, color: c.text, border: `1px solid ${c.border}`,
        borderRadius: 20, padding: '2px 10px',
        fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  )
}

// ─── Atalho operacional — abre tela real do painel ──────────────────────────

function QuickAction({
  href, label, icon = '→',
}: { href: string; label: string; icon?: string }) {
  return (
    <Link
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        background: 'rgba(74, 222, 128, 0.08)',
        border: `1px solid ${colors.accent}55`,
        color: colors.accent,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 600,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: 0.2,
        transition: 'all 0.15s',
      }}
    >
      <span>{icon}</span> {label}
    </Link>
  )
}

function NodeWithAction({
  node, actions,
}: { node: React.ReactNode; actions: { href: string; label: string; icon?: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      {node}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', maxWidth: 240 }}>
        {actions.map((a, i) => (
          <QuickAction key={i} href={a.href} label={a.label} icon={a.icon} />
        ))}
      </div>
    </div>
  )
}

function Legend() {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 16,
        background: colors.card, border: `1px solid ${colors.border}`,
        borderRadius: 8, padding: '8px 14px', marginBottom: 20,
        fontSize: 11, color: colors.muted, flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 700, color: colors.text, letterSpacing: 0.5 }}>LEGENDA:</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ background: colors.accent, color: '#0a0a0a', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>NO PAINEL</span>
        Já implementado
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ background: colors.yellow, color: '#0a0a0a', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10 }}>PLANEJADO</span>
        Próxima entrega
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: colors.accent }}>→</span>
        Atalho operacional (clique abre a tela correspondente)
      </span>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Fluxo 1.1 — Pré-publicação
// ═══════════════════════════════════════════════════════════════════════════

function Fluxo11() {
  return (
    <div>
      <SectionTitle
        n="1.1"
        title="Pré-publicação"
        subtitle="Do envio do texto pelo fellow até a aprovação e encaminhamento à imprensa"
      />
      <Legend />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 220 }}>
          <Node label="Fellow envia texto ou pitch" sub="pelo painel do fellow" color="blue" icon="📝" badge="done" />
          <Arrow label="automático" />
          <NodeWithAction
            node={<Node label="Notificação para Sara e Anne" sub="sino + e-mail" color="green" icon="🔔" badge="done" />}
            actions={[{ href: '/painel/admin/imprensa?status=pendentes', label: 'Ver pendentes' }]}
          />
          <Arrow />
          <NodeWithAction
            node={<Node label="Sara avalia o conteúdo" sub="prazo: até 2 dias úteis" color="card" icon="🔍" />}
            actions={[{ href: '/painel/admin/imprensa?status=em_avaliacao', label: 'Abrir fila' }]}
          />
          <Arrow />
          <Diamond label="Decisão" />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 12,
              width: '100%',
              maxWidth: 620,
              marginTop: 8,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Aprovado" color="green" />
              <Arrow />
              <NodeWithAction
                node={<Node label="Pronto para placement" sub="segue para 1.3" color="green" icon="📤" small />}
                actions={[{ href: '/painel/admin/imprensa?status=aprovado', label: 'Ver aprovados' }]}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Ajustes" color="yellow" />
              <Arrow />
              <NodeWithAction
                node={<Node label="Feedback ao fellow" sub="registrado no painel" color="yellow" icon="💬" small badge="done" />}
                actions={[{ href: '/painel/admin/imprensa?status=ajustes_solicitados', label: 'Responder' }]}
              />
              <Arrow />
              <Node label="Fellow revisa" sub="reescreve ou ajusta" color="yellow" icon="✏️" small />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Rejeitado" color="red" />
              <Arrow />
              <NodeWithAction
                node={<Node label="Justificativa construtiva" sub="para o fellow" color="red" icon="❌" small />}
                actions={[{ href: '/painel/admin/imprensa?status=rejeitado', label: 'Ver rejeitados' }]}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 260, alignSelf: 'flex-start' }}>
          <div
            style={{
              background: colors.yellowBg, border: `1px solid ${colors.yellow}`,
              borderRadius: 10, padding: 16,
            }}
          >
            <div style={{ color: colors.yellow, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
              💡 Pendência editorial
            </div>
            <div style={{ color: colors.text, fontSize: 12, lineHeight: 1.6 }}>
              <strong>Definir critérios objetivos</strong> de avaliação (editorial, relevância, qualidade) e documentá-los aqui — reduz subjetividade e facilita onboarding de jornalistas.
            </div>
            <div style={{ marginTop: 10, color: colors.yellow, fontSize: 11 }}>
              Responsável: Sara · Curto prazo
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Fluxo 1.2 — CRM de Veículos
// ═══════════════════════════════════════════════════════════════════════════

function Fluxo12() {
  const niveis: { nivel: string; icon: string; color: NodeColor; desc: string; abordagem: string; exemplos: string }[] = [
    { nivel: 'Alta',        icon: '🤝', color: 'green',  desc: 'Relação próxima, contato direto',             abordagem: 'Informal — WhatsApp ou telefone',         exemplos: 'Boletim da Liberdade · Instituto Liberal' },
    { nivel: 'Média',       icon: '📨', color: 'blue',   desc: 'Já houve placement ou contato recente',       abordagem: 'Semi-formal — e-mail + follow-up',        exemplos: 'Revista Oeste · Gazeta do Povo' },
    { nivel: 'Baixa',       icon: '🎯', color: 'yellow', desc: 'Contato esporádico ou via intermediário',     abordagem: 'Formal e personalizada por editor',       exemplos: 'Jovem Pan (via Mano Ferreira)' },
    { nivel: 'Inexistente', icon: '🧭', color: 'red',    desc: 'Sem contato prévio documentado',              abordagem: 'Prospecção estruturada',                   exemplos: 'Folha · Estadão · Valor' },
  ]

  return (
    <div>
      <SectionTitle
        n="1.2"
        title="CRM de Veículos"
        subtitle="Cadastro, classificação e estratégia de aproximação — saindo do Excel, entrando no painel"
      />
      <Legend />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ color: colors.muted, fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Nível de proximidade <span style={{ color: colors.accent }}>(4 faixas)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {niveis.map((v) => (
              <div
                key={v.nivel}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: colors.card, border: `1px solid ${colors.border}`,
                  borderRadius: 8, padding: '12px 14px', gap: 14,
                }}
              >
                <div style={{ fontSize: 22 }}>{v.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: colors.text, fontWeight: 700, fontSize: 13 }}>Proximidade {v.nivel}</span>
                    <Tag label={v.abordagem} color={v.color} />
                  </div>
                  <div style={{ color: colors.muted, fontSize: 11, marginBottom: 3 }}>{v.desc}</div>
                  <div style={{ color: colors.mutedDark, fontSize: 10, fontStyle: 'italic' }}>Ex.: {v.exemplos}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ color: colors.muted, fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            Ciclo de cadastro e manutenção
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <NodeWithAction
              node={<Node label="Cadastrar veículo" sub="nome, site, cobertura" color="blue" icon="➕" badge="done" />}
              actions={[
                { href: '/painel/admin/veiculos/novo', label: 'Cadastrar agora' },
                { href: '/painel/admin/veiculos', label: 'Ver CRM' },
              ]}
            />
            <Arrow />
            <Node label="Classificar proximidade" sub="alta · média · baixa · inexistente" color="card" icon="🏷️" badge="planned" />
            <Arrow />
            <Node label="Preencher ficha do veículo" wide color="card" icon="📇" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, width: '100%', maxWidth: 640, marginTop: 12 }}>
              <Node label="Contato principal" sub="nome · e-mail · whatsapp" color="card" small badge="done" />
              <Node label="Estratégia" sub="como entrar no radar" color="purple" small badge="planned" />
              <Node label="Próximos passos" sub="checklist com prazos" color="purple" small badge="planned" />
              <Node label="Tags" sub="tema · tamanho · perfil" color="orange" small badge="planned" />
            </div>
            <Arrow />
            <Diamond label="Toda publicação atualiza o nível" />
            <Arrow dashed label="revisão trimestral" />
            <Node label="Anne + Sara revisam" sub="ajustam proximidade e estratégia" color="card" icon="🔄" />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 280, alignSelf: 'flex-start' }}>
          <div
            style={{
              background: colors.purpleBg, border: `1px solid ${colors.purple}`,
              borderRadius: 10, padding: 16,
            }}
          >
            <div style={{ color: colors.purple, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>🗂️ Ficha do Veículo</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.7 }}>
              <div><strong>Dados básicos:</strong> nome, site, cobertura</div>
              <div style={{ marginTop: 6 }}><strong>Relacionamento:</strong> proximidade (4 níveis), contato principal</div>
              <div style={{ marginTop: 6 }}><strong>Estratégia:</strong> como abordar, quem intermedia</div>
              <div style={{ marginTop: 6 }}><strong>Próximos passos:</strong> ações com prazo e responsável</div>
              <div style={{ marginTop: 6 }}><strong>Tags:</strong> tema, tamanho, perfil editorial</div>
            </div>
          </div>

          <div
            style={{
              background: colors.orangeBg, border: `1px solid ${colors.orange}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.orange, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🏷️ Tags</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.6, marginBottom: 8 }}>
              Busca cruzada: <em>"veículos de economia, grandes, proximidade média"</em>.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Tag label="economia" color="orange" />
              <Tag label="cultura" color="orange" />
              <Tag label="grande" color="purple" />
              <Tag label="nicho" color="purple" />
              <Tag label="liberal" color="blue" />
            </div>
          </div>

          <div
            style={{
              background: colors.yellowBg, border: `1px solid ${colors.yellow}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.yellow, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠️ Migração do Excel</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.5, marginBottom: 8 }}>
              A planilha legada tem ~20 veículos. Precisamos importá-los, classificar nos 4 níveis e anexar o histórico.
            </div>
            <QuickAction href="/painel/admin/veiculos" label="Abrir CRM" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Fluxo 1.3 — Tentativa de Placement
// ═══════════════════════════════════════════════════════════════════════════

function Fluxo13() {
  return (
    <div>
      <SectionTitle
        n="1.3"
        title="Tentativa de Placement"
        subtitle="Do texto aprovado à resposta do veículo — toda tentativa é registrada, mesmo sem publicação"
      />
      <Legend />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <NodeWithAction
            node={<Node label="Texto aprovado (vindo de 1.1)" color="green" icon="✅" badge="done" />}
            actions={[{ href: '/painel/admin/imprensa?status=aprovado', label: 'Ver aprovados' }]}
          />
          <Arrow />
          <NodeWithAction
            node={<Node label="Escolher veículo alvo" sub="pela ficha + tags do CRM" color="card" icon="🎯" />}
            actions={[{ href: '/painel/admin/veiculos', label: 'Lista de veículos' }]}
          />
          <Arrow />
          <Node label="Preparar abordagem" sub="respeita nível de proximidade" color="card" icon="✍️" />
          <Arrow />
          <Node label="Registrar tentativa" sub="quem enviou · veículo · data" color="blue" icon="📋" badge="planned" wide />
          <Arrow />
          <Node label="Enviar ao veículo" sub="canal definido na ficha" color="blue" icon="📤" />
          <Arrow />
          <Node label="Follow-up" sub="prazo por nível de proximidade" color="card" icon="🔄" />
          <Arrow />
          <Diamond label="Resposta do veículo" />

          <div
            style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 14, width: '100%', maxWidth: 680, marginTop: 10,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Publicado" color="green" />
              <Arrow />
              <NodeWithAction
                node={<Node label="Salvar URL + métricas" sub="histórico fellow × veículo" color="green" icon="🎉" small badge="planned" />}
                actions={[{ href: '/painel/admin/imprensa?status=publicado', label: 'Ver publicados' }]}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Aguardando" color="yellow" />
              <Arrow />
              <Node label="Manter em aberto" sub="reenviar follow-up" color="yellow" icon="⏳" small />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Sem retorno" color="orange" />
              <Arrow />
              <Node label="Registrar 'sem retorno'" sub="com data de corte" color="orange" icon="🔇" small badge="planned" />
              <Arrow dashed label="tentar outro" />
              <Node label="Próximo veículo da lista" color="card" small />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Tag label="Negativo" color="red" />
              <Arrow />
              <Node label="Registrar motivo" sub="alimenta aprendizado" color="red" icon="❌" small badge="planned" />
              <Arrow dashed label="tentar outro" />
              <Node label="Próximo veículo da lista" color="card" small />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 280, alignSelf: 'flex-start' }}>
          <div
            style={{
              background: colors.blueBg, border: `1px solid ${colors.blue}`,
              borderRadius: 10, padding: 16,
            }}
          >
            <div style={{ color: colors.blue, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📋 Registro de Tentativas</div>
            <div style={{ color: colors.text, fontSize: 12, lineHeight: 1.6, marginBottom: 10 }}>
              Tabela nova: <code style={{ background: '#1a1a1a', padding: '1px 4px', borderRadius: 3 }}>tentativas_placement</code>
            </div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.7 }}>
              <div>• fellow_id (quem é o autor)</div>
              <div>• submissao_id (qual texto)</div>
              <div>• veiculo_id (para onde foi)</div>
              <div>• responsavel_id (quem enviou)</div>
              <div>• status: aguardando / sem_retorno / negativo / publicado</div>
              <div>• motivo (se negativo)</div>
              <div>• enviado_em · respondido_em</div>
            </div>
          </div>

          <div
            style={{
              background: colors.accentBg, border: `1px solid ${colors.accent}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.accent, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🎯 Cenário da Anne</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.6 }}>
              <em>"Sara entra no perfil do Davi, registra que tentou a Folha e não teve retorno. Isso fica salvo como histórico. Se houver publicação depois, a gente registra em qual veículo saiu."</em>
            </div>
          </div>

          <div
            style={{
              background: colors.purpleBg, border: `1px solid ${colors.purple}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.purple, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>👤 Perfil do fellow</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.5 }}>
              Aba <strong>Histórico de Imprensa</strong> mostra todas as tentativas cronologicamente — publicadas e não publicadas.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Fluxo 1.4 — Pós-publicação
// ═══════════════════════════════════════════════════════════════════════════

function Fluxo14() {
  return (
    <div>
      <SectionTitle
        n="1.4"
        title="Pós-publicação"
        subtitle="Amplificação, atualização do CRM e métricas de impacto"
      />
      <Legend />

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <NodeWithAction
            node={<Node label="Artigo publicado 🎉" color="green" icon="📰" />}
            actions={[{ href: '/painel/admin/imprensa?status=publicado', label: 'Ver publicados' }]}
          />
          <Arrow />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, width: '100%', maxWidth: 680 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Node label="Notificar o fellow" sub="sino + e-mail com link" color="blue" icon="🔔" small badge="done" />
              <Arrow />
              <Node label="Registrar no perfil" sub="histórico de imprensa" color="blue" icon="👤" small badge="planned" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Node label="Atualizar ficha do veículo" sub="+1 publicação · data" color="purple" icon="📇" small badge="planned" />
              <Arrow />
              <Node label="Reavaliar proximidade" sub="pode subir de nível" color="purple" icon="⬆️" small badge="planned" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <Node label="Produzir carrossel" sub="Instagram Amplifica" color="orange" icon="📱" small />
              <Arrow />
              <Node label="Publicar nas redes" sub="com crédito ao fellow" color="orange" icon="📣" small />
            </div>
          </div>

          <Arrow label="consolidação" />
          <Node label="Registrar métricas" sub="audiência · repercussão · engajamento" color="yellow" icon="📊" />
          <Arrow />
          <Node label="Painel de métricas integrado" sub="visível para fellow + admin" color="green" icon="📈" badge="planned" wide />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 280, alignSelf: 'flex-start' }}>
          <div
            style={{
              background: colors.orangeBg, border: `1px solid ${colors.orange}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.orange, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>🤖 Automação do Carrossel</div>
            <div style={{ color: colors.text, fontSize: 12, lineHeight: 1.5 }}>
              Avaliar <strong>Make.com</strong> — trigger: novo status <code style={{ background: '#1a1a1a', padding: '1px 4px', borderRadius: 3 }}>publicado</code> em <code style={{ background: '#1a1a1a', padding: '1px 4px', borderRadius: 3 }}>submissoes</code>.
            </div>
          </div>

          <div
            style={{
              background: colors.card, border: `1px solid ${colors.border}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.yellow, fontWeight: 700, fontSize: 13, marginBottom: 10 }}>📊 Métricas do CRM</div>
            {[
              { label: 'Nº de artigos publicados (por fellow)', icon: '📰' },
              { label: 'Taxa de aceite por nível de proximidade', icon: '🎯' },
              { label: 'Tempo médio de placement', icon: '⏱️' },
              { label: 'Tentativas sem retorno (reclassificar)', icon: '🔇' },
              { label: 'Veículos "conquistados" no trimestre', icon: '🏆' },
            ].map((m, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8, color: colors.text, fontSize: 11, lineHeight: 1.4 }}>
                <span style={{ flexShrink: 0 }}>{m.icon}</span>
                <span>{m.label}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: colors.accentBg, border: `1px solid ${colors.accent}`,
              borderRadius: 10, padding: 14,
            }}
          >
            <div style={{ color: colors.accent, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>🎯 Meta do sistema</div>
            <div style={{ color: colors.text, fontSize: 11, lineHeight: 1.6 }}>
              Ter em um só lugar, dentro do painel, <strong>todos os fellows, todas as interações com a imprensa, o nível de relacionamento com cada veículo e tags</strong>. Simples, intuitivo, funcional.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Roadmap
// ═══════════════════════════════════════════════════════════════════════════

function Roadmap() {
  const items: { fase: string; status: 'done' | 'next' | 'future'; desc: string; entregas: string[] }[] = [
    {
      fase: 'Fase 1 · Consolidar base atual',
      status: 'done',
      desc: 'Módulo /painel/imprensa já entrega submissões, aprovações, feedback e notificações.',
      entregas: ['Submissão de textos pelos fellows', 'Painel admin (Sara/Anne)', 'Cadastro inicial de veículos', 'Sistema de notificações'],
    },
    {
      fase: 'Fase 2 · Evoluir CRM de Veículos',
      status: 'next',
      desc: 'Atualizar o modelo para refletir a visão da Anne — 4 níveis, estratégia, próximos passos, tags.',
      entregas: [
        'Migrar tipo_relacionamento de 3 → 4 níveis',
        'Novos campos: estrategia_aproximacao, proximos_passos',
        'Tabela tags + veiculos_tags (many-to-many)',
        'Tela /painel/admin/veiculos/[id] com ficha completa',
      ],
    },
    {
      fase: 'Fase 3 · Registro de tentativas',
      status: 'next',
      desc: 'Nova tabela tentativas_placement para capturar cada interação — mesmo as sem retorno.',
      entregas: [
        'Tabela tentativas_placement + RLS',
        'Ação "Registrar tentativa" no perfil do fellow',
        'Timeline no perfil do fellow',
        'Timeline no perfil do veículo',
      ],
    },
    {
      fase: 'Fase 4 · Inteligência e métricas',
      status: 'future',
      desc: 'Dashboards de saúde do pipeline e performance do relacionamento.',
      entregas: [
        'Painel de métricas (taxa de aceite por nível)',
        'Alerta de veículos "mudos"',
        'Importador da planilha Excel legada',
        'Automação de carrossel (Make.com)',
      ],
    },
  ]

  const statusColor: Record<string, NodeColor> = { done: 'green', next: 'yellow', future: 'purple' }
  const statusLabel: Record<string, string> = { done: '✅ Concluído', next: '⏭️ Próxima entrega', future: '🔭 Futuro' }

  return (
    <div>
      <SectionTitle n="R" title="Roadmap" subtitle="O que já está no ar e o que vem pela frente" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((it) => {
          const c = colorMap[statusColor[it.status]]
          return (
            <div
              key={it.fase}
              style={{
                background: colors.card,
                border: `1.5px solid ${c.border}`,
                borderRadius: 12,
                padding: 18,
                boxShadow: `0 0 14px ${c.border}22`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{ color: colors.text, fontWeight: 700, fontSize: 15 }}>{it.fase}</div>
                <Tag label={statusLabel[it.status]} color={statusColor[it.status]} />
              </div>
              <div style={{ color: colors.muted, fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>{it.desc}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
                {it.entregas.map((e, i) => (
                  <div
                    key={i}
                    style={{
                      background: colors.bg, border: `1px solid ${colors.border}`,
                      borderRadius: 6, padding: '8px 12px',
                      color: colors.text, fontSize: 11, lineHeight: 1.4,
                    }}
                  >
                    {it.status === 'done' ? '✓' : '→'} {e}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════════════════
// Página principal — /painel/admin/imprensa/fluxos
// ═══════════════════════════════════════════════════════════════════════════

const tabs = [
  { id: '11',      label: '1.1 Pré-publicação' },
  { id: '12',      label: '1.2 CRM de Veículos' },
  { id: '13',      label: '1.3 Placement' },
  { id: '14',      label: '1.4 Pós-publicação' },
  { id: 'roadmap', label: '🗺️ Roadmap' },
]

export default function FluxosImprensaPage() {
  const [activeTab, setActiveTab] = useState('11')

  return (
    <div style={{ color: colors.text }}>
      {/* Breadcrumb + título */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: colors.muted, marginBottom: 8 }}>
          <Link href="/painel/admin/imprensa" style={{ color: colors.muted, textDecoration: 'none' }}>
            ← Assessoria de Imprensa
          </Link>
          <span>/</span>
          <span style={{ color: colors.text }}>Fluxos do processo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ color: colors.text, fontSize: 24, fontWeight: 800, margin: 0 }}>
              Fluxos de Assessoria de Imprensa
            </h1>
            <p style={{ color: colors.muted, fontSize: 13, marginTop: 6, maxWidth: 640, lineHeight: 1.5 }}>
              Documentação viva do processo. Cada nó com o badge <strong style={{ color: colors.accent }}>NO PAINEL</strong> tem um atalho direto para a tela correspondente.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link
              href="/painel/admin/imprensa"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: colors.card, border: `1px solid ${colors.border}`,
                color: colors.text, padding: '8px 14px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}
            >
              📥 Fila de submissões
            </Link>
            <Link
              href="/painel/admin/veiculos"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: colors.card, border: `1px solid ${colors.border}`,
                color: colors.text, padding: '8px 14px', borderRadius: 10,
                fontSize: 12, fontWeight: 600, textDecoration: 'none',
              }}
            >
              🌐 CRM de Veículos
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: colors.card, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: 6, display: 'flex', gap: 2,
          marginBottom: 24, overflowX: 'auto',
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              flex: 1, minWidth: 140,
              background: activeTab === t.id ? colors.accentBg : 'transparent',
              border: activeTab === t.id ? `1px solid ${colors.accent}` : '1px solid transparent',
              color: activeTab === t.id ? colors.accent : colors.muted,
              padding: '10px 14px', borderRadius: 8,
              fontSize: 12, fontWeight: activeTab === t.id ? 700 : 500,
              cursor: 'pointer', transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Conteúdo */}
      <div
        style={{
          background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 12, padding: 24,
        }}
      >
        {activeTab === '11'      && <Fluxo11 />}
        {activeTab === '12'      && <Fluxo12 />}
        {activeTab === '13'      && <Fluxo13 />}
        {activeTab === '14'      && <Fluxo14 />}
        {activeTab === 'roadmap' && <Roadmap />}
      </div>
    </div>
  )
}
