import { test, expect } from '@playwright/test'

test.describe('PWA assets', () => {
  test('manifest.webmanifest と icon.svg が配信される', async ({ request }) => {
    const manifest = await request.get('/manifest.webmanifest')
    expect(manifest.status()).toBe(200)
    expect(manifest.headers()['content-type']).toMatch(/manifest|json/)

    const icon = await request.get('/icon.svg')
    expect(icon.status()).toBe(200)
    expect(icon.headers()['content-type']).toMatch(/svg/)
  })

  test('index.html に meta viewport と manifest link が含まれる', async ({ page }) => {
    await page.goto('/')
    const html = await page.content()
    expect(html).toContain('rel="manifest"')
    expect(html).toContain('viewport-fit=cover')
    expect(html).toContain('Lifelog')
  })
})
