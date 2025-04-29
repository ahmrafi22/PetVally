// pages/api/users/appointments.ts
import { type NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";
import { createAppointment, getUserAppointments } from "@/controllers/vet-info";

export async function POST(request: NextRequest) {
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
    const payload = await verifyJwtToken(token);
    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Get the user ID from the payload
    const userId = payload.id as string;

    // Extract appointment data from the request body
    const { vetId, date, time, reason } = (await request.json()) as { vetId: string; date: string; time: string; reason: string };

    if (!vetId || !date || !time || !reason) {
      return NextResponse.json({ message: "Bad Request: Missing required fields" }, { status: 400 });
    }

    const appointmentDate = new Date(date);

    // Create the appointment
      const newAppointment = await createAppointment(userId as string, vetId, appointmentDate, time, reason);

    // Return the new appointment
    return NextResponse.json({ message: "Appointment created successfully", appointment: newAppointment }, { status: 201 });

  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

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
    const payload = await verifyJwtToken(token);
    if (!payload || payload.role !== "user") {
      return NextResponse.json({ message: "Unauthorized: Invalid token" }, { status: 401 });
    }

    // Get the user ID from the payload
    const userId = payload.id as string;

    // Fetch user's appointments
    const appointments = await getUserAppointments(userId);

    // Return the appointments
    return NextResponse.json({ message: "User appointments retrieved successfully", appointments }, { status: 200 });

  } catch (error) {
    console.error("Error fetching user appointments:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}