import { type NextRequest, NextResponse } from "next/server";
import { getJobPostById } from "@/controllers/job-posts";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const awaitedParamas = await params;
  const jobId = awaitedParamas.id;

  try {
    const jobPost = await getJobPostById(jobId);
    if (!jobPost) {
      return NextResponse.json({ error: "Job post not found" }, { status: 404 });
    }

    return NextResponse.json({ jobPost });
  } catch (error: any) {
    console.error(`Error in GET /api/caregivers/jobs/${jobId}:`, error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}