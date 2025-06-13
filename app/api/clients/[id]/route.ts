import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id.replace('#', ''); // Remove the # prefix if present
    
    await prisma.customer.delete({
      where: { id }
    });

    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete client' },
      { status: 500 }
    );
  }
} 