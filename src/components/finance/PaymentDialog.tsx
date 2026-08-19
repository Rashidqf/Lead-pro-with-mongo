import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Contact } from "@/lib/crm";
import type { Payment, Project } from "@/lib/finance";
import { getPayments } from "@/lib/finance.functions";

export function PaymentsList({
  contacts,
  projects,
}: {
  contacts: Contact[];
  projects: Project[];
}) {
  const [phoneSearch, setPhoneSearch] = useState("");

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const result = await getPayments();
      return result as Payment[];
    },
  });

  const contactById = useMemo(() => {
    const map = new Map<string, Contact>();
    for (const contact of contacts) {
      map.set(contact.id, contact);
    }
    return map;
  }, [contacts]);

  const projectById = useMemo(() => {
    const map = new Map<string, Project>();
    for (const project of projects) {
      map.set(project.id, project);
    }
    return map;
  }, [projects]);

  const normalizedSearch = phoneSearch.replace(/\D/g, "");

  const filteredPayments = useMemo(() => {
    if (!normalizedSearch) {
      return payments;
    }
    return payments.filter((payment) => {
      const contact = contactById.get(payment.contact_id);
      const contactPhone = contact?.phone ? contact.phone.replace(/\D/g, "") : "";
      return contactPhone.includes(normalizedSearch);
    });
  }, [payments, contactById, normalizedSearch]);

  const totalAmount = useMemo(
    () => filteredPayments.reduce((sum, payment) => sum + payment.amount, 0),
    [filteredPayments],
  );

  return (
    <div className="grid gap-4">
      <div>
        <Label className="mb-1.5 block text-xs">Search by phone number</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="tel"
            placeholder="e.g. 0300 1234567"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading payments...</p>
      ) : filteredPayments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No payments found.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount (Rs.)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => {
                const contact = contactById.get(payment.contact_id);
                const project = payment.project_id
                  ? projectById.get(payment.project_id)
                  : undefined;
                return (
                  <TableRow key={payment.id}>
                    <TableCell>{contact?.name ?? "Unknown"}</TableCell>
                    <TableCell>{contact?.phone ?? "-"}</TableCell>
                    <TableCell>{project?.name ?? "-"}</TableCell>
                    <TableCell>{payment.date.slice(0, 10)}</TableCell>
                    <TableCell>{payment.payment_method}</TableCell>
                    <TableCell className="text-right font-medium">
                      {payment.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="flex justify-end text-sm font-medium">
            Total: Rs. {totalAmount.toLocaleString()}
          </div>
        </>
      )}
    </div>
  );
}