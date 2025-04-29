// pages/api/users/vetinfo.ts
import { type NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { getNearbyAndAllVets } from "@/controllers/vet-info";

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");

    // Check if the authorization header exists and is valid
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ message: "Unauthorized: Missing or invalid token" }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token and ensure user role
    const payload = await verifyJwtToken(token) as { id: string; role: string };
    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Get the user ID from the payload
    const userId = payload.id;

    // Fetch nearby and all vets
    const vetsData = await getNearbyAndAllVets(userId);

    // Return the vets data
    return NextResponse.json({ message: "Vet information retrieved successfully", ...vetsData }, { status: 200 });

  } catch (error) {
    console.error("Error fetching vet info:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}