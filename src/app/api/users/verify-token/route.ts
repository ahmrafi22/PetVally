// Path: app/api/users/verify-token/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized - Missing or invalid token format" },
        { status: 401 }
      );
    }
    
    const token = authHeader.split(" ")[1];
    
    // Verify token
    const payload = await verifyJwtToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { message: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }
    
    // Token is valid
    return NextResponse.json(
      { message: "Token is valid", user: payload },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json(
      { message: "Unauthorized - Token validation failed" },
      { status: 401 }
    );
  }
}