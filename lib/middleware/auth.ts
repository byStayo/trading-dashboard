import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '../utils/jwt';

export async function authMiddleware(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    
    // Add user info to request context
    (req as any).user = decoded;
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid authentication token' },
      { status: 401 }
    );
  }
} 