import mermaid from 'mermaid'

const mermaidChart = (code) => {
    try {
        mermaid.parse(code)
        return `<div class="mermaid">${code}</div>`
    } catch ({str, hash}) {
        return `<pre>${str}</pre>`
    }
}

const MermaidPlugin = (md) => {
    md.mermaid = mermaid
    // @ts-ignore
    mermaid.loadPreferences = (preferenceStore) => {
        let mermaidTheme = preferenceStore.get('mermaid-theme')
        if (mermaidTheme === undefined) {
            mermaidTheme = 'default'
        }
        let ganttAxisFormat = preferenceStore.get('gantt-axis-format')
        if (ganttAxisFormat === undefined) {
            ganttAxisFormat = '%Y-%m-%d'
        }
        // @ts-ignore
        mermaid.initialize({
            theme: mermaidTheme,
            gantt: {
                // @ts-ignore
                axisFormatter: [
                    [ganttAxisFormat, (d) => {
                        return d.getDay() === 1
                    }]
                ]
            }
        })
        return {
            'mermaid-theme': mermaidTheme,
            'gantt-axis-format': ganttAxisFormat
        }
    }

    const temp = md.renderer.rules.fence.bind(md.renderer.rules)
    md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
        const token = tokens[idx]
        const code = token.content.trim()
        if (token.info === 'mermaid') {
            return mermaidChart(code)
        }
        const firstLine = code.split(/\n/)[0].trim()
        if (firstLine === 'gantt' ||
            firstLine === 'classDiagram' ||
            firstLine === 'gitGraph' ||
            firstLine === 'sequenceDiagram' ||
            firstLine.match(/^graph (?:TB|BT|RL|LR|TD);?$/)) {
            return mermaidChart(code)
        }
        return temp(tokens, idx, options, env, slf)
    }
}

export default MermaidPlugin
