import * as path from 'path'
import { forward_slash, pathInfoEx, resolve, readOSRConfig, } from '@polymech/commons'
export const find_items = (nodes: string[], options) => {
    nodes = nodes.filter(options.filter)
    return nodes.map((c) => {
        const root = resolve(options.root, false, {})
        return {
            rel: forward_slash(`${path.relative(root, path.parse(c).dir)}`),
            path: forward_slash(`${options.root}/${path.relative(root, c)}`),
            config: readOSRConfig(c)
        }
    })
}
export const get = (src, root, type) => {
    const srcInfo = pathInfoEx(src, false, { absolute: true})
    return srcInfo
}
