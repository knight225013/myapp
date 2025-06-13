import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get shipment count by status
    const statusCounts = await prisma.fBAOrder.groupBy({
      by: ['status'],
      where: { customerId: params.id },
      _count: {
        id: true
      }
    });

    // Get total shipments
    const total = await prisma.fBAOrder.count({
      where: { customerId: params.id }
    });

    // Get recent shipments
    const shipments = await prisma.fBAOrder.findMany({
      where: { customerId: params.id },
      include: {
        channel: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    return NextResponse.json({
      success: true,
      data: {
        statusCounts,
        total,
        shipments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Failed to fetch client shipments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch client shipments' },
      { status: 500 }
    );
  }
} 