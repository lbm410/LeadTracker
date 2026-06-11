import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Agenda } from './pages/Agenda'
import { CalendarPage } from './pages/CalendarPage'
import { ContactDetail } from './pages/ContactDetail'
import { Contacts } from './pages/Contacts'
import { Dashboard } from './pages/Dashboard'
import { NotFound } from './pages/NotFound'
import { Pipeline } from './pages/Pipeline'

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="pipeline" element={<Pipeline />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="contacts/:id" element={<ContactDetail />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="agenda" element={<Agenda />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
