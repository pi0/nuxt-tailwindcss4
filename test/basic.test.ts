import { describe, it, expect } from 'vitest'
import { fileURLToPath } from 'node:url'
import { setup, $fetch, useTestContext } from '@nuxt/test-utils/e2e'
import { getCSSContents } from './utils'

describe('module', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixture', import.meta.url)),
    // nuxtConfig: { builder: 'webpack' }
  })

  it('ssr styles', async () => {
    const html = await $fetch<string>('/')
    const cssContents = await getCSSContents(html)
    expect(cssContents).includes('tailwindcss')
    expect(cssContents).toMatchFileSnapshot('.snapshot/styles.css')
  })

  it('detects CSS file and places it first by default', () => {
    const { nuxt } = useTestContext()
    expect(nuxt!.options.css[0].endsWith('css/tailwind.css')).toBe(true)
  })
})
