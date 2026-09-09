import { User } from '@prisma/client';

// Extend Express Request to include authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
      };
    }
  }
}

// Serialized user (without password)
export type SafeUser = Omit<User, 'password'>;

// File upload result
export interface UploadResult {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}
