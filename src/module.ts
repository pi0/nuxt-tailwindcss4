import {
  defineNuxtModule,
  addVitePlugin,
  addTemplate,
  // createResolver,
} from '@nuxt/kit'
import { name, version } from '../package.json'

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'tailwindcss4',
  },
  defaults: {},
  async setup(options, nuxt) {
    // const resolver = createResolver(import.meta.url)

    // Add vite plugion
    const twVitePlugin = await import('@tailwindcss/vite').then(
      (r) => r.default,
    )
    addVitePlugin(twVitePlugin())

    // Inject css
    const cssTemplate = addTemplate({
      filename: 'tailwindcss.css',
      getContents: () => {
        return `@import 'tailwindcss';`
      },
    })
    nuxt.options.css.push(cssTemplate.dst)
  },
})
