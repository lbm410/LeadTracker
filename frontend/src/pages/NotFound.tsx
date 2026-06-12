import { Link } from 'react-router-dom'
import { useI18n } from '../i18n'
import { Button } from '../components/ui'

export function NotFound() {
  const { t } = useI18n()
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <p className="mt-2 text-lg font-semibold text-slate-800">{t('not_found.message')}</p>
      <Link to="/" className="mt-4">
        <Button>{t('not_found.back')}</Button>
      </Link>
    </div>
  )
}
