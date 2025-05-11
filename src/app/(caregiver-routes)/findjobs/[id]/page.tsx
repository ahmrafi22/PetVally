import CaregiverJobDetailsClient from "./_components/caregiver-job-details-client";

interface CaregiverJobDetailsPageProps {
   params: Promise<{
    id: string;
   }>;
}

export default async function CaregiverJobDetailsPage({ params }: CaregiverJobDetailsPageProps) {
   const { id } = await params

  return <CaregiverJobDetailsClient jobId={id} />;
}