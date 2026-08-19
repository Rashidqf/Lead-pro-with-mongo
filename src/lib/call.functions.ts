import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireAuth } from "@/integrations/mongo/auth-middleware";
import { requestOutboundCall, userHasOnlineDevice } from "@/lib/companion.server";

export const requestCall = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((input: unknown) => z.object({ contactId: z.string().min(1) }).parse(input))
  .handler(async ({ data, context }) => requestOutboundCall(context, data.contactId));

export const callDeviceStatus = createServerFn({ method: "GET" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const online = await userHasOnlineDevice(context.userId);
    return { online };
  });
