import { useParams } from 'react-router-dom'
import CompanionApp from './CompanionApp'

/** "תצוגה כמלווה": one companion's app, opened by an admin (read only). */
export default function CompanionPreview() {
  const { id } = useParams()
  return <CompanionApp key={id} previewId={id} />
}
