export type Lang = 'es' | 'en'

export interface PluralForms {
  one: string
  other: string
}

export type DictNode = string | PluralForms | { [key: string]: DictNode }

export interface Dictionary {
  [key: string]: DictNode
}
