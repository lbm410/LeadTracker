import { Languages } from 'lucide-react'
import { LANGS, useI18n } from '../i18n'
import { cn } from '../lib/utils'

export function LanguageSwitcher({ compact }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n()

  if (compact) {
    return (
      <div className="flex items-center rounded-lg bg-slate-100 p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLang(l.value)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-semibold uppercase transition-colors',
              lang === l.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500',
            )}
          >
            {l.value}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="px-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Languages className="h-3.5 w-3.5" /> {t('lang.switch')}
      </div>
      <div className="flex rounded-lg bg-slate-100 p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.value}
            onClick={() => setLang(l.value)}
            className={cn(
              'flex-1 rounded-md px-2 py-1.5 text-xs font-semibold transition-colors',
              lang === l.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-500 hover:text-slate-700',
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  )
}
