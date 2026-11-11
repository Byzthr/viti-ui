import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import VViewSwitcher from './VViewSwitcher.vue'

const modes = [
  { id: 'a', label: 'Uno' },
  { id: 'b', label: 'Dos', count: 9 },
]

function render(props: Record<string, unknown> = {}): Promise<string> {
  const app = createSSRApp({ render: () => h(VViewSwitcher, { modes, active: 'a', ...props }) })
  return renderToString(app)
}

describe('VViewSwitcher', () => {
  it('is a sliding pill by default', async () => {
    const html = await render()
    expect(html).toMatch(/class="view-switcher pill"/)
    expect(html).toContain('class="marker"')
  })

  it('draws window tabs without the marker', async () => {
    const html = await render({ variant: 'tabs' })
    expect(html).toMatch(/class="view-switcher tabs"/)
    expect(html).not.toContain('class="marker"')
  })

  it('marks the vertical variant as vertical', async () => {
    expect(await render({ variant: 'vertical' })).toContain('aria-orientation="vertical"')
  })

  it('shows the count of a mode', async () => {
    expect(await render({ variant: 'vertical' })).toMatch(/>9<\/span>/)
  })

  it('only lets the active tab take the focus', async () => {
    const html = await render()
    expect(html).toMatch(/aria-selected="true"[^>]*tabindex="0"/)
    expect(html).toMatch(/aria-selected="false"[^>]*tabindex="-1"/)
  })
})
