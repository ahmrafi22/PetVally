import { type NextRequest, NextResponse } from "next/server";
import {
  getAllMissingPosts,
  getMissingPostsInArea,
  createMissingPost,
} from "@/controllers/missing-post-data";
import { verifyJwtToken } from "@/lib/auth";

// Get all missing posts
export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("Authorization");

    // Check if the authorization header exists and is in the correct format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    // Verify the token
    const payload = await verifyJwtToken(token);

    if (!payload || payload.role !== "user") {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const city = searchParams.get("city");
    const area = searchParams.get("area");
    let posts;
    if (city && area && city.trim() !== "" && area.trim() !== "") {
      posts = await getMissingPostsInArea(city.trim(), area.trim());
    } else {
      // fallback
      posts = await getAllMissingPosts();
    }

    // Returning to view 
    return NextResponse.json(
      {
        message: "Missing posts retrieved successfully",
        posts,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving missing posts:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { message: "Unauthorized: Missing or invalid token" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];

    const payload = await verifyJwtToken(token);

    if (!payload || payload.role !== "user") {
      return NextResponse.json(
        { message: "Unauthorized: Invalid token" },
        { status: 401 }
      );
    }

    const userId = payload.id as string;

    const body = await request.json();

    const requiredFields = [
      "title",
      "description",
      "imageBase64",
      "country",
      "city",
      "area",
      "species",
      "breed",
      "age",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const post = await createMissingPost(userId, {
      title: body.title,
      description: body.description,
      imageBase64: body.imageBase64,
      country: body.country,
      city: body.city,
      area: body.area,
      species: body.species,
      breed: body.breed,
      age: Number.parseInt(body.age),
    });

    return NextResponse.json(
      {
        message: "Missing post created successfully",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating missing post:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}