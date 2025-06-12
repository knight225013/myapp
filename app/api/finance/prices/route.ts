import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 这里应该从数据库获取数据
    const prices = [
      { id: '1', name: '价格方案1' },
      { id: '2', name: '价格方案2' },
    ];
    
    return NextResponse.json({ success: true, data: prices });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '获取价格方案失败' },
      { status: 500 }
    );
  }
} 