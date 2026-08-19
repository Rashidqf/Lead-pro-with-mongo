import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { callDeviceStatus, requestCall } from "@/lib/call.functions";
import type { Contact } from "@/lib/crm";
import { cn } from "@/lib/utils";

export function CallLeadButton({
  contact,
  className,
  compact,
}: {
  contact: Contact;
  className?: string;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: device } = useQuery({
    queryKey: ["call-device"],
    queryFn: () => callDeviceStatus(),
    refetchInterval: 15_000,
  });

  const call = useMutation({
    mutationFn: async () => {
      const result = await requestCall({ data: { contactId: contact.id } });
      if (result.mode === "tel") {
        window.location.href = `tel:${result.phone}`;
      }
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      if (result.mode === "device") toast.success("Calling from your Android phone…");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!contact.phone) return null;

  return (
    <Button
      type="button"
      size={compact ? "sm" : "default"}
      variant={compact ? "secondary" : "default"}
      title="Call"
      className={cn(compact && "h-7 px-2 text-xs", className)}
      disabled={call.isPending}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        call.mutate();
      }}
    >
      <Phone className={cn("h-3.5 w-3.5", !compact && "mr-1.5")} />
      {compact ? null : device?.online ? "Call from phone" : "Call"}
    </Button>
  );
}
