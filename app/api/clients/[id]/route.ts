import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.customer.findUnique({
      where: { id: params.id }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('Failed to fetch client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const client = await prisma.customer.update({
      where: { id: params.id },
      data: {
        name: body.contactName,
        phone: body.phoneNumber,
        email: body.email,
        address: body.address
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update client' },
      { status: 500 }
    );
  }
}

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