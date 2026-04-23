function getAdminRecipients() {
  return (process.env.IMPRENSA_NOTIFICATION_TO ?? process.env.ADMIN_EMAIL ?? '')
    .split(',')
    .map((email) => email.trim())
    .filter(Boolean)
}

function getBaseUrl() {
  return (
    process.env.APP_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    ''
  ).replace(/\/$/, '')
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

type SubmissionEmailInput = {
  submissaoId: string
  fellowNome: string
  titulo: string
  tipo: string
  googleDocUrl?: string | null
}

export async function enviarEmailNovaSubmissao(input: SubmissionEmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  const to = getAdminRecipients()

  if (!apiKey || !from || to.length === 0) {
    return { sent: false, reason: 'missing-config' as const }
  }

  const baseUrl = getBaseUrl()
  const detalheUrl = baseUrl ? `${baseUrl}/painel/admin/imprensa/${input.submissaoId}` : null

  const tipoLabel = input.tipo === 'pitch' ? 'pitch' : 'artigo'
  const fellowNome = escapeHtml(input.fellowNome)
  const titulo = escapeHtml(input.titulo)
  const googleDocUrl = input.googleDocUrl ? escapeHtml(input.googleDocUrl) : null

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h2 style="margin-bottom: 12px;">Nova submissão no painel</h2>
      <p><strong>${fellowNome}</strong> enviou um ${tipoLabel} para avaliação.</p>
      <p><strong>Título:</strong> ${titulo}</p>
      ${
        googleDocUrl
          ? `<p><strong>Google Doc:</strong> <a href="${googleDocUrl}">${googleDocUrl}</a></p>`
          : ''
      }
      <p>
        ${
          detalheUrl
            ? `<a
          href="${detalheUrl}"
          style="display: inline-block; padding: 10px 14px; border-radius: 8px; background: #10b981; color: #000; text-decoration: none; font-weight: 700;"
        >
          Abrir submissão no painel
        </a>`
            : 'Abra o painel de Assessoria de Imprensa para avaliar a nova submissão.'
        }
      </p>
    </div>
  `

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Nova submissão de imprensa: ${input.titulo}`,
      html,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Falha ao enviar e-mail de submissão: ${response.status} ${errorText}`)
  }

  return { sent: true as const }
}
