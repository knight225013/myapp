import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const clients = await prisma.customer.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match our frontend interface
    // Since the Customer model doesn't have company and status fields,
    // we'll use default values or derive them
    const transformedClients = clients.map(client => ({
      id: `#${client.id.slice(0, 8)}`,
      companyName: client.name, // Use name as company name
      contactName: client.name,
      phoneNumber: client.phone || 'N/A',
      position: 'Customer', // Default position
      status: 'active' as const, // Default to active since there's no status field
      createdDate: new Date(client.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      email: client.email
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedClients 
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const client = await prisma.customer.create({
      data: {
        name: body.contactName,
        phone: body.phoneNumber,
        email: body.email,
        address: body.address,
        tenantId: 'default-tenant' // You may want to get this from session
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: client 
    });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create client' },
      { status: 500 }
    );
  }
} 