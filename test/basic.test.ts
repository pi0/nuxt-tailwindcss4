import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
  })

  it('ssr styles', async () => {
    const html = await $fetch('/')
    const cssImport = html.match(/<link rel="stylesheet" href="([^"]+)">/)![1]
    const cssContents = await $fetch(cssImport)
    expect(cssContents).includes('https://tailwindcss.com')
    expect(cssContents).toMatchFileSnapshot('.snapshot/styles.css')
  })
})
