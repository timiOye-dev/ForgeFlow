import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '../../shared/components/EmptyState'
import { Button } from '../../shared/components/ui/button'

export const NotFoundPage = () => {
  return (
    <EmptyState
      icon={Compass}
      title="Page Not Found"
      description="The page you're looking for doesn't exist."
      className="min-h-dvh"
      action={
        <Button
          asChild
          className="bg-indigo-600 hover:bg-indigo-500 text-white"
        >
          <Link to="/">Back to Home</Link>
        </Button>
      }
    />
  )
}
