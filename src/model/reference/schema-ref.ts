import { z } from 'zod'
import * as path from 'path'

import * as env from 'env-var'
import { sync as writeFS } from '@polymech/fs/write'
import { generate_interfaces, write, ZodMetaMap } from '@polymech/commons'

export const get_var = (key: string ='') => env.get(key).asString() || env.get(key.replace(/-/g, '_')).asString() || env.get(key.replace(/_/g, '-')).asString()
export const HOME = (sub = '') => path.join(process.env[(process.platform == 'win32' ) ? 'USERPROFILE' : 'HOME'] || '', sub)
// https://rjsf-team.github.io/react-jsonschema-form/docs/usage/widgets#file-widgets

export type ModelSchemaMeta = Record<string, unknown>
let map: ZodMetaMap
export const OptionsSchema = (opts?: any) => {
  map = ZodMetaMap.create<ModelSchemaMeta>()
  map.add(
    'path',
    z.string()
      .min(1)
      .default('.')
      .describe('Target directory')
    , {'ui:widget': 'file'})
    .add(
      'output',
      z.string()
        .optional()
        .describe('Optional output path for modified files (Tool mode only)')
    )
  return map.root()
    .passthrough()
    .describe('IKBotOptions')
}

export const types = () => {
  generate_interfaces([OptionsSchema()], 'src/zod_types.ts')
  schemas()
}

export const schemas = () => {
  write([OptionsSchema()], 'schema.json', 'model', {})
  writeFS('schema_ui.json', map.getUISchema())
}