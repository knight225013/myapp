import { initTRPC } from '@trpc/server';
import { z } from 'zod';
const t = initTRPC.create();
export const appRouter = t.router({
  createWaybill: t.procedure
    .input(z.object({ recipient: z.string(), country: z.string() }))
    .mutation(({ input }) => {
      return prisma.waybill.create({ data: input });
    }),
});
