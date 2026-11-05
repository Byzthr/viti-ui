import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import ModalDialog from './ModalDialog.vue'

async function render(props: Record<string, unknown> = {}): Promise<string> {
  const app = createSSRApp({ render: () => h(ModalDialog, { open: true, title: 'Title', ...props }) })
  const ctx: { teleports?: Record<string, string> } = {}
  await renderToString(app, ctx)
  return ctx.teleports?.body ?? ''
}

describe('ModalDialog', () => {
  it('renders "Guardar" by default', async () => {
    const html = await render()
    expect(html).toContain('Guardar</button>')
  })

  it('renders the given submitLabel', async () => {
    const html = await render({ submitLabel: 'Reiniciar' })
    expect(html).toContain('Reiniciar</button>')
    expect(html).not.toContain('Guardar')
  })

  it('marks the submit button as danger', async () => {
    const html = await render({ danger: true })
    expect(html).toMatch(/class="[^"]*\bdanger\b[^"]*"/)
    expect(await render()).not.toMatch(/class="[^"]*\bdanger\b/)
  })
})
