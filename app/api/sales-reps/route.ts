import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const salesReps = await prisma.user.findMany({
      where: {
        role: {
          in: ['TENANT_ADMIN', 'TENANT_STAFF']
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      data: salesReps
    });
  } catch (error) {
    console.error('Failed to fetch sales reps:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales reps' },
      { status: 500 }
    );
  }
} 