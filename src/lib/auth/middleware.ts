import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, findUserById } from './database-utils';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    isAdmin: boolean;
  };
}

export const authenticateToken = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const authHeader = req.headers.get('authorization');
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        return NextResponse.json(
          { success: false, message: 'Access token required' },
          { status: 401 }
        );
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 403 }
        );
      }

      // Verify user still exists
      const user = await findUserById(decoded.id);
      if (!user) {
        return NextResponse.json(
          { success: false, message: 'User not found' },
          { status: 404 }
        );
      }

      // Add user to request
      const authenticatedReq = req as AuthenticatedRequest;
      authenticatedReq.user = {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
      };

      return handler(authenticatedReq);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 500 }
      );
    }
  };
};

export const requireAdmin = (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
  return authenticateToken(async (req: AuthenticatedRequest): Promise<NextResponse> => {
    if (!req.user?.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      );
    }

    return handler(req);
  });
};