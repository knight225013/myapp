// plop-templates/controller.hbs
import { DemoModel } from '@/prisma/zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// TODO: 其他 CRUD 操作可仿造此处 stub 再补充
export async function createDemo(req, res) {
  const result = DemoModel.omit({ id: true, createdAt: true }).safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: result.error.format() });
  }

  try {
    const record = await prisma.demo.create({ data: result.data });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
