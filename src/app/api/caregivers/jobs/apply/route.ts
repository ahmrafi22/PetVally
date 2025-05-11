import { type NextRequest, NextResponse } from "next/server";
import { createJobApplication } from "@/controllers/job-applications";
import { verifyCaregiverAuth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the caregiver and get their ID
    const caregiverId = await verifyCaregiverAuth(request);

    if (!caregiverId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get request body (contains job specific data)
    const data = await request.json();

    // Basic validation (optional, but good practice)
    if (!data.jobPostId || !data.proposal || data.requestedAmount === undefined) {
         return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 3. Create job application, including the authenticated caregiverId
    // Combine the request body data with the authenticated caregiverId
    const applicationData = {
        jobPostId: data.jobPostId,
        proposal: data.proposal,
        requestedAmount: data.requestedAmount,
        caregiverId: caregiverId, // <-- Add the authenticated caregiverId here
    };

    const application = await createJobApplication(applicationData);

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/caregivers/jobs/apply:", error);
    // Handle specific errors if needed (e.g., existing application)
    const status = error.message.includes("already applied") ? 400 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}