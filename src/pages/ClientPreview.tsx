import { useParams } from 'react-router-dom'
import ClientApp from './ClientApp'

/** "תצוגה כלקוח": the client portal for one client, opened by an admin. */
export default function ClientPreview() {
  const { id } = useParams()
  return <ClientApp key={id} previewId={id} />
}
