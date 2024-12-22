import { $fetch } from '@nuxt/test-utils/e2e'

export const getCSSContents = async (html: string) => {
  const cssImport = html.match(/<link rel="stylesheet" href="([^"]+)">/)
  return cssImport ? $fetch<string>(cssImport[1]) : html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)?.[1] ?? html
}
