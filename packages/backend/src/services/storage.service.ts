import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import type { UploadResult } from '../types/index.js';

export class StorageService {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(env.UPLOAD_DIR);
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getFileUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }

  getFilePath(fileName: string): string {
    return path.join(this.uploadDir, fileName);
  }

  processUploadedFile(file: Express.Multer.File): UploadResult {
    return {
      fileName: file.filename,
      filePath: this.getFilePath(file.filename),
      fileUrl: this.getFileUrl(file.filename),
      fileType: file.mimetype,
      fileSize: file.size,
    };
  }

  async deleteFile(fileName: string): Promise<void> {
    const filePath = this.getFilePath(fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete file: ${filePath}`, error);
    }
  }

  async fileExists(fileName: string): Promise<boolean> {
    const filePath = this.getFilePath(fileName);
    return fs.existsSync(filePath);
  }
}

export const storageService = new StorageService();
