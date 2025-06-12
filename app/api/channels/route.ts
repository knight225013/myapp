import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const channels = await prisma.channel.findMany();
    return NextResponse.json({ success: true, data: channels });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取渠道失败' },
      { status: 500 }
    );
  }
} 