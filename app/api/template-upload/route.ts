import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// 处理 POST 请求，上传 Excel 文件
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const templateName = formData.get('templateName') as string | null;

    // 验证输入
    if (!file || !templateName) {
      return NextResponse.json({ success: false, error: '缺少文件或模板名称' }, { status: 400 });
    }

    // 验证文件类型
    if (
      !file.type.includes('spreadsheet') &&
      !file.name.endsWith('.xlsx') &&
      !file.name.endsWith('.xls')
    ) {
      return NextResponse.json(
        { success: false, error: '仅支持 Excel 文件（.xlsx 或 .xls）' },
        { status: 400 },
      );
    }

    // 清理模板名称，允许中文、字母、数字、下划线、连字符
    const sanitizedTemplateName = templateName.replace(/[<>:"/\\|?*]/g, '');
    console.debug('POST 原始模板名称:', templateName, '清理后:', sanitizedTemplateName);
    if (!sanitizedTemplateName) {
      return NextResponse.json(
        { success: false, error: '模板名称需包含中文、字母、数字、下划线或连字符' },
        { status: 400 },
      );
    }

    // 定义保存路径，使用编码后的名称
    const uploadDir = path.join(process.cwd(), 'public', 'template');
    const encodedFileName = encodeURIComponent(sanitizedTemplateName) + '.xlsx';
    const filePath = path.join(uploadDir, encodedFileName);

    // 确保目录存在
    await fs.mkdir(uploadDir, { recursive: true });

    // 保存文件
    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filePath, new Uint8Array(arrayBuffer));

    return NextResponse.json({
      success: true,
      filePath: `/template/${encodedFileName}`,
    });
  } catch (error) {
    console.error('上传文件失败:', error);
    return NextResponse.json({ success: false, error: '上传失败' }, { status: 500 });
  }
}

// 处理 GET 请求，下载 Excel 文件
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateName = searchParams.get('name');

    // 验证输入
    if (!templateName) {
      console.error('GET 请求缺少模板名称');
      return NextResponse.json({ success: false, error: '缺少模板名称' }, { status: 400 });
    }

    // 清理模板名称
    const sanitizedTemplateName = templateName.replace(/[<>:"/\\|?*]/g, '');
    console.debug('GET 原始模板名称:', templateName, '清理后:', sanitizedTemplateName);
    if (!sanitizedTemplateName) {
      console.error('无效的模板名称:', templateName);
      return NextResponse.json(
        { success: false, error: '模板名称需包含中文、字母、数字、下划线或连字符' },
        { status: 400 },
      );
    }

    // 定义文件路径，使用编码后的名称
    const filePath = path.join(
      process.cwd(),
      'public',
      'template',
      `${encodeURIComponent(sanitizedTemplateName)}.xlsx`,
    );

    // 检查文件是否存在
    try {
      await fs.access(filePath);
      console.debug(`找到模板文件: ${filePath}`);
    } catch {
      console.error(`模板文件不存在: ${filePath}`);
      return NextResponse.json(
        { success: false, error: `模板文件不存在: ${sanitizedTemplateName}.xlsx` },
        { status: 404 },
      );
    }

    // 读取文件
    const fileBuffer = await fs.readFile(filePath);

    // 设置响应头
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(sanitizedTemplateName)}.xlsx"`,
      },
    });
  } catch (error) {
    console.error('下载模板文件失败:', error);
    return NextResponse.json(
      { success: false, error: `下载失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 },
    );
  }
}
