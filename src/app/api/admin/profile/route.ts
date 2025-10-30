import { NextResponse } from 'next/server';
import { authenticateToken, AuthenticatedRequest } from '@/lib/auth/middleware';
import { findUserById, hashPassword, validatePassword } from '@/lib/auth/database-utils';
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary/config';
import User from '@/lib/database/models/User';

async function handleGetProfile(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Ensure user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required' },
        { status: 403 }
      );
    }

    const userProfile = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobileNumber: user.mobileNumber,
      profileImage: user.profileImage,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    };
    return NextResponse.json(
      {
        success: true,
        message: 'Admin profile retrieved successfully',
        user: userProfile,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUpdateProfile(req: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'User ID not found' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const mobileNumber = formData.get('mobileNumber') as string;
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const profileImage = formData.get('profileImage') as File;

    const user = await findUserById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Admin not found' },
        { status: 404 }
      );
    }

    // Ensure user is admin
    if (!user.isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Update basic info
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (mobileNumber) updateData.mobileNumber = mobileNumber;

    // Handle password update
    if (currentPassword && newPassword) {
      const bcrypt = require('bcryptjs');
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidCurrentPassword) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { success: false, message: passwordValidation.message },
          { status: 400 }
        );
      }

      updateData.password = await hashPassword(newPassword);
    }

    // Handle profile image upload
    if (profileImage && profileImage.size > 0) {
      // Delete old image if exists
      if (user.profileImage) {
        try {
          const publicId = user.profileImage.split('/').pop()?.split('.')[0];
          if (publicId) {
            await deleteFromCloudinary(`book-exchange/profiles/${publicId}`);
          }
        } catch (error) {
          console.log('Error deleting old image:', error);
        }
      }

      // Upload new image
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const uploadResult = await uploadToCloudinary(buffer);
      updateData.profileImage = uploadResult.url;
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'Failed to update admin profile' },
        { status: 500 }
      );
    }

    const userProfile = {
      id: updatedUser._id.toString(),
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      mobileNumber: updatedUser.mobileNumber,
      profileImage: updatedUser.profileImage,
      isAdmin: updatedUser.isAdmin,
      createdAt: updatedUser.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Admin profile updated successfully',
        user: userProfile,
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = authenticateToken(handleGetProfile);
export const PUT = authenticateToken(handleUpdateProfile);