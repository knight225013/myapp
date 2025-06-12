import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { PrismaClient, OrderStatus } from '@prisma/client';
const t = initTRPC.create();
const prisma = new PrismaClient();

export const appRouter = t.router({
  createWaybill: t.procedure
    .input(z.object({
      recipient: z.string(),
      country: z.string(),
      quantity: z.number().default(1),
      status: z.nativeEnum(OrderStatus).default('已下单'),
      type: z.string().default('FBA'),
      channelId: z.string(),
      tenantId: z.string()
    }))
    .mutation(({ input }) => {
      return prisma.fBAOrder.create({
        data: {
          type: input.type as string,
          status: input.status as OrderStatus,
          recipient: input.recipient as string,
          country: input.country as string,
          quantity: input.quantity as number,
          channel: { connect: { id: input.channelId as string } },
          tenant: { connect: { id: input.tenantId as string } }
        }
      });
    }),
});