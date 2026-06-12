import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { setDateLocale } from '../lib/utils'
import { translations, type Lang } from './translations'

export type { Lang } from './translations'
export { LANGS } from './translations'

const STORAGE_KEY = 'leadtracker.lang'

function detectInitial(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'en' || saved === 'es') return saved
  } catch {
    /* localStorage unavailable */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language?.toLowerCase() ?? '' : ''
  return nav.startsWith('es') ? 'es' : 'en'
}

function lookup(lang: Lang, key: string): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let cur: any = translations[lang]
  for (const p of parts) {
    if (cur && typeof cur === 'object' && p in cur) cur = cur[p]
    else return key
  }
  return typeof cur === 'string' ? cur : key
}

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str
  return str.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`))
}

export type TFunc = (key: string, vars?: Record<string, string | number>) => string

interface I18nContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: TFunc
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const initial = detectInitial()
    setDateLocale(initial)
    return initial
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
    setDateLocale(lang)
  }, [lang])

  const t = useCallback<TFunc>((key, vars) => interpolate(lookup(lang, key), vars), [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within a LanguageProvider')
  return ctx
}

/** Build a list of <option> values with translated labels for an enum. */
export function optionsFor(
  t: TFunc,
  values: readonly string[],
  prefix: string,
): { value: string; label: string }[] {
  return values.map((v) => ({ value: v, label: t(`${prefix}.${v}`) }))
}
