import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useCrmAuth } from "@/hooks/use-crm-auth";
import { columnsQuery } from "@/lib/crm";
import { parseContactImportFile } from "@/lib/import-file";
import { importContacts } from "@/lib/crm.functions";

const CHUNK = 150;

export function ImportContactsButton() {
  const { isAdmin } = useCrmAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: columns = [] } = useQuery(columnsQuery);

  const importFile = useMutation({
    mutationFn: async (file: File) => {
      const rows = parseContactImportFile(file.name, await file.text());
      const payload = rows.filter((row) => row.phone);
      if (!payload.length) throw new Error("No rows with a phone number found");
      const leads = columns.find((c) => c.name === "Leads") ?? columns[0];
      let count = 0;
      let skipped = 0;
      for (let i = 0; i < payload.length; i += CHUNK) {
        const result = await importContacts({
          data: {
            column_id: leads?.id ?? null,
            rows: payload.slice(i, i + CHUNK),
          },
        });
        count += result.count;
        skipped += result.skipped;
      }
      return { count, skipped };
    },
    onSuccess: ({ count, skipped }) => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      toast.success(
        skipped
          ? `Imported ${count} contacts (${skipped} skipped — already exist)`
          : `Imported ${count} contacts`,
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!isAdmin) return null;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) importFile.mutate(file);
          e.target.value = "";
        }}
      />
      <Button
        variant="outline"
        onClick={() => fileRef.current?.click()}
        disabled={importFile.isPending}
      >
        <Upload className="mr-1.5 h-4 w-4" />
        {importFile.isPending ? "Importing…" : "Import CSV"}
      </Button>
    </>
  );
}
