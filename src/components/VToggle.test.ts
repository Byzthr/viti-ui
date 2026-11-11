import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it } from 'vitest'
import VToggle from './VToggle.vue'

function render(props: Record<string, unknown> = {}): Promise<string> {
  const app = createSSRApp({
    render: () => h(VToggle, { modelValue: false, label: 'Label', ...props }),
  })
  return renderToString(app)
}

describe('VToggle', () => {
  it('renders a switch with aria-checked', async () => {
    const on = await render({ modelValue: true })
    expect(on).toContain('role="switch"')
    expect(on).toContain('aria-checked="true"')
    expect(await render({ modelValue: false })).toContain('aria-checked="false"')
  })

  it('uses the label as its accessible name', async () => {
    expect(await render({ label: 'pvp' })).toContain('aria-label="pvp"')
  })

  it('can be disabled', async () => {
    expect(await render({ disabled: true })).toMatch(/<button[^>]*\sdisabled/)
    expect(await render()).not.toMatch(/<button[^>]*\sdisabled/)
  })
})
