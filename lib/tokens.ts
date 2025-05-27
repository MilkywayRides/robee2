import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';
import { getVerificationTokenByUserId } from '@/data/verification-token';
import { getPasswordResetTokenByEmail } from '@/data/password-reset-token';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';

export async function generateVerificationToken(
  userId: string,
  isUpdateEmail: boolean = false
) {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Delete any existing tokens for this user
  await db.verificationToken.deleteMany({
    where: { userId }
  });

  // Create new token
  const verificationToken = await db.verificationToken.create({
    data: {
      token,
      userId,
      isUpdateEmail,
      expiresAt
    }
  });

  return verificationToken;
}

export async function generatePasswordResetToken(email: string) {
  const token = uuidv4();

  // Expire the token in one hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db.passwordResetToken.delete({
      where: {
        id: existingToken.id
      }
    });
  }

  const passwordResetToken = await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return passwordResetToken;
}

export async function generateTwoFactorToken(email: string) {
  const token = crypto.randomInt(100_000, 1_000_000).toString();

  // Expire the token in 10 minutes
  const expires = new Date(new Date().getTime() + 10 * 60 * 1000);

  const existingToken = await getTwoFactorTokenByEmail(email);

  if (existingToken) {
    await db.twoFactorToken.delete({
      where: {
        id: existingToken.id
      }
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires
    }
  });

  return twoFactorToken;
}
