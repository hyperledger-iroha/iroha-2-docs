import MarkdownIt from 'markdown-it'
import hasha from 'hasha'

/**
 * Mermaid-js markdown-it plugin
 */
export const mermaid = (md: MarkdownIt) => {
  const fence = md.renderer.rules.fence.bind(md.renderer.rules)

  md.renderer.rules.fence = (tokens, index, options, env, slf) => {
    const token = tokens[index]

    if (token.info.trim() === 'mermaid') {
      const content = token.content.trim()
      const id = `mermaid_${hasha(content)}`
      return `<MermaidRenderWrap id="${id}" text="${encodeURIComponent(content)}" />`
    }

    // Shiki will highlight `mmd` as `mermaid`
    if (token.info.trim() === 'mmd') {
      tokens[index].info = 'mermaid'
    }

    return fence(tokens, index, options, env, slf)
  }
}
