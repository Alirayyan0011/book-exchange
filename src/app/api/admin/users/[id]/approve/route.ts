import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, AuthenticatedRequest } from '@/lib/auth/middleware';
import connectDB from '@/lib/database/connection';
import User from '@/lib/database/models/User';

async function handleApproveUser(req: AuthenticatedRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
  try {
    await connectDB();

    const resolvedParams = await params;
    const userId = resolvedParams.id;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    const { action } = await req.json(); // 'approve' or 'reject'

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Cannot modify admin users' },
        { status: 403 }
      );
    }

    if (action === 'approve') {
      user.isApproved = true;
      await user.save();

      return NextResponse.json(
        {
          success: true,
          message: 'User approved successfully',
          user: {
            id: user._id.toString(),
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isApproved: user.isApproved,
          }
        },
        { status: 200 }
      );
    } else {
      // For reject, we delete the user
      await User.findByIdAndDelete(userId);

      return NextResponse.json(
        {
          success: true,
          message: 'User registration rejected and removed',
        },
        { status: 200 }
      );
    }

  } catch (error) {
    console.error('User approval error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = async (req: Request, context: { params: Promise<{ id: string }> }) => {
  const authenticatedHandler = requireAdmin(async (authReq: AuthenticatedRequest) => {
    return handleApproveUser(authReq, context);
  });
  return authenticatedHandler(req as any);
};