
import JobDetailsClient from "./_components/job-details-client"

interface JobDetailsPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { id } = await params
  return <JobDetailsClient jobId={id} />
}