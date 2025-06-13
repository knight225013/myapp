import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get total count for pagination
    const total = await prisma.customer.count({ where });

    // Get clients
    const clients = await prisma.customer.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Transform the data to match frontend interface
    const transformedClients = clients.map(client => ({
      id: client.id,
      companyName: (client as any).companyName || client.name,
      contactName: client.name,
      phoneNumber: client.phone || 'N/A',
      position: 'Customer',
      status: ((client as any).status || 'ACTIVE').toLowerCase(),
      createdDate: new Date(client.createdAt).toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      email: client.email,
      address: client.address,
      settlementMethod: (client as any).settlementMethod,
      financeContact: null,
      positions: [],
      shipmentCount: 0,
      loginCount: 0,
      notes: (client as any).notes,
      attachments: (client as any).attachments,
      updatedAt: (client as any).updatedAt
    }));

    return NextResponse.json({ 
      success: true, 
      data: transformedClients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
    
    // Create client with available fields
    const clientData: any = {
      name: body.contactName,
      phone: body.phoneNumber,
      email: body.email,
      address: body.address,
      tenantId: 'default-tenant'
    };

    const client = await prisma.customer.create({
      data: clientData
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