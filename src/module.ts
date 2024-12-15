import { existsSync } from 'node:fs'
import {
  defineNuxtModule,
  addVitePlugin,
  addTemplate,
  resolvePath,
  useNuxt,
} from '@nuxt/kit'
import { join } from 'pathe'
import { name, version, configKey, compatibility } from '../package.json'

async function resolveCSSPath(cssPath: string) {
  const _cssPath = await resolvePath(cssPath, { extensions: ['.css', '.sass', '.scss', '.less', '.styl'] })

  return existsSync(_cssPath)
    ? _cssPath
    : addTemplate({ filename: 'tailwind.css', getContents: () => `@import 'tailwindcss';` }).dst
}

function resolveInjectPosition(css: string[], position: Extract<ModuleOptions['cssPath'], any[]>[1]['injectPosition'] = 'first') {
  if (typeof (position) === 'number') {
    return ~~Math.min(position, css.length + 1)
  }

  if (typeof (position) === 'string') {
    switch (position) {
      case 'first': return 0
      case 'last': return css.length
      default: throw new Error('invalid literal: ' + position)
    }
  }

  if (position.after !== undefined) {
    const index = css.indexOf(position.after)
    if (index === -1) {
      throw new Error('`after` position specifies a file which does not exists on CSS stack: ' + position.after)
    }

    return index + 1
  }

  throw new Error('invalid position: ' + JSON.stringify(position))
}

export interface ModuleOptions {
  /**
  * The path of the Tailwind CSS file. If the file does not exist, the module's default CSS file will be imported instead.
  *
  * @default '~/assets/css/tailwind.css'
  */
 cssPath: string | false | [string | false, { injectPosition: 'first' | 'last' | number | { after: string } }]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey,
    compatibility
  },
  defaults: (nuxt = useNuxt()) => ({
    cssPath: join(nuxt.options.dir.assets, 'css/tailwind.css'),
  }),
  async setup(moduleOptions, nuxt) {
    // const resolver = createResolver(import.meta.url)

    // Add plugin
    if (nuxt.options.builder === '@nuxt/vite-builder') {
      await import('@tailwindcss/vite').then((r) => addVitePlugin(r.default()))
    } else {
      nuxt.options.postcss.plugins['@tailwindcss/postcss'] = {}
    }

    const [cssPath, cssPathConfig] = Array.isArray(moduleOptions.cssPath) ? moduleOptions.cssPath : [moduleOptions.cssPath]
    if (!cssPath) return

    const resolvedCss = await resolveCSSPath(cssPath)
    nuxt.options.css = nuxt.options.css ?? []
    const resolvedNuxtCss = await Promise.all(nuxt.options.css.map((p: any) => resolvePath(p.src ?? p))) || []

    // inject only if this file isn't listed already by user
    if (!resolvedNuxtCss.includes(resolvedCss)) {
      let injectPosition: number
      try {
        injectPosition = resolveInjectPosition(nuxt.options.css, cssPathConfig?.injectPosition)
      }
      catch (e: any) {
        throw new Error('failed to resolve Tailwind CSS injection position: ' + e.message)
      }

      nuxt.options.css.splice(injectPosition, 0, resolvedCss)
    }
  },
})
