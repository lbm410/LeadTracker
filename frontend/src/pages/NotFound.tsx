import { Link } from 'react-router-dom'
import { Button } from '../components/ui'

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-5xl font-extrabold text-brand-600">404</p>
      <p className="mt-2 text-lg font-semibold text-slate-800">Page not found</p>
      <Link to="/" className="mt-4">
        <Button>Back to dashboard</Button>
      </Link>
    </div>
  )
}
