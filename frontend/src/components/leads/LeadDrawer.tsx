import { useState } from "react";
import { ExternalLink, Building2 } from "lucide-react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLeadStore } from "@/store";
import { useUpdateLead } from "@/hooks/useLeads";
import { formatDateTime } from "@/lib/utils";

function Field({ label, value, href }: { label: string; value: string | null; href?: string }) {
  if (!value) return null;
  return (
    <div className="space-y-1">
      <p className="text-label text-muted-foreground">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-foreground hover:underline font-medium"
        >
          {value}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <p className="text-sm text-foreground">{value}</p>
      )}
    </div>
  );
}

export function LeadDrawer() {
  const { drawerOpen, selectedLead, closeDrawer } = useLeadStore();
  const updateLead = useUpdateLead();
  const [notes, setNotes] = useState("");

  const lead = selectedLead;

  if (!lead) return null;

  const handleSaveNotes = () => {
    updateLead.mutate({ id: lead.id, data: { notes } });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) closeDrawer();
  };

  return (
    <Sheet open={drawerOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="flex flex-col overflow-hidden w-[520px] max-w-full p-0 bg-canvas">
        {/* Header */}
        <div className="border-b border-border px-6 pb-5 pt-8">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-title-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-card">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
              {lead.company_name}
            </SheetTitle>
            <SheetDescription className="text-sm text-muted-foreground">
              {lead.industry ?? "Unknown industry"} · {lead.location ?? "Unknown location"}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Company */}
          <div>
            <p className="text-label text-muted-foreground mb-3">Company</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Industry" value={lead.industry} />
              <Field label="Employees" value={lead.employee_count} />
              <Field label="Location" value={lead.location} />
              <Field label="Source" value={lead.source} />
              <Field label="Website" value={lead.website} href={lead.website ?? undefined} />
              <Field label="LinkedIn" value={lead.linkedin_url ? "View Profile" : null} href={lead.linkedin_url ?? undefined} />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Contact */}
          <div>
            <p className="text-label text-muted-foreground mb-3">Contact</p>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={lead.contact_name} />
              <Field label="Title" value={lead.contact_title} />
              <Field label="Email" value={lead.email} href={lead.email ? `mailto:${lead.email}` : undefined} />
              <Field label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Notes */}
          <div>
            <Label className="text-label text-muted-foreground">Notes</Label>
            <textarea
              className="mt-2 min-h-[100px] w-full resize-none rounded-md border border-input bg-canvas px-4 py-3 text-sm text-foreground focus-visible:border-foreground focus-visible:outline-none placeholder:text-muted-foreground"
              placeholder="Add notes about this lead..."
              defaultValue={lead.notes ?? ""}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Button
              size="sm"
              variant="secondary"
              className="mt-2"
              onClick={handleSaveNotes}
              disabled={updateLead.isPending}
            >
              Save Notes
            </Button>
          </div>

          <Separator className="bg-border" />

          {/* Meta */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Added {formatDateTime(lead.created_at)}</p>
            {lead.source_url && (
              <a
                href={lead.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-foreground hover:underline flex items-center gap-1 font-medium"
              >
                View source
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
