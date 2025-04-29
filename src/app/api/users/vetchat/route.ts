// api/users/vetchat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getVetResponse } from '@/controllers/vetchat';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const formData = await request.formData();
    const text = formData.get('text') as string;
    
    // Get the image data from the form
    const imageDataString = formData.get('imageData') as string;
    let imageData: { base64: string; mimeType: string } | undefined = undefined;
    
    // Process image data if it exists
    if (imageDataString) {
      try {
        imageData = JSON.parse(imageDataString);
      } catch (e) {
        console.error('Error parsing image data:', e);
      }
    }

    if (!text && !imageData) {
      return NextResponse.json({ error: 'No text or image provided' }, { status: 400 });
    }

    // Get or create session ID from cookies
    const cookieStore = await cookies();
    let sessionId = cookieStore.get('vetchat_session_id')?.value;
    
    if (!sessionId) {
      sessionId = uuidv4();
      // Note: In a production app, you should set secure and httpOnly flags
      // This is handled by the Response object below
    }

    // Get the response from the Gemini API
    const aiResponse = await getVetResponse(text, imageData, sessionId);

    // Create response
    const response = NextResponse.json({ 
      response: aiResponse,
      sessionId: sessionId  // Return session ID to client for debugging if needed
    });
    
    // Set session cookie if it doesn't exist
    if (!cookieStore.get('vetchat_session_id')) {
      response.cookies.set('vetchat_session_id', sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}