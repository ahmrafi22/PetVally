import { NextRequest, NextResponse } from 'next/server';
import { getVetResponse } from '@/controllers/vetchat';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    

    const imageDataString = formData.get('imageData') as string;
    let imageData: { base64: string; mimeType: string } | undefined = undefined;
    

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


    const cookieStore = await cookies();
    let sessionId = cookieStore.get('vetchat_session_id')?.value;
    
    if (!sessionId) {
      sessionId = uuidv4();
    }


    const aiResponse = await getVetResponse(text, imageData, sessionId);

    // Create response
    const response = NextResponse.json({ 
      response: aiResponse,
      sessionId: sessionId  
    });
    
    // Set session cookie with security flags
    if (!cookieStore.get('vetchat_session_id')) {
      response.cookies.set('vetchat_session_id', sessionId, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict', 
        maxAge: 60 * 60 * 24 * 7, 
        path: '/',
      });
    }

    return response;

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}