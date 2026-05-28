import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";

import type { VaultItem } from "@/types/vault";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type Props = {
  item: VaultItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (id: string) => Promise<void>;
};

const allowedTags = [
  "H1",
  "H2",
  "H3",
  "P",
  "BR",
  "UL",
  "OL",
  "LI",
  "STRONG",
  "B",
  "EM",
  "I",
  "U",
  "A",
  "CODE",
  "PRE",
];

function sanitizeBasicHtml(html: string) {
  const parser = new DOMParser();
  const document = parser.parseFromString(html, "text/html");

  function cleanNode(node: Node) {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;

        if (!allowedTags.includes(element.tagName)) {
          element.replaceWith(...Array.from(element.childNodes));
          return;
        }

        [...element.attributes].forEach((attribute) => {
          const name = attribute.name.toLowerCase();

          if (element.tagName === "A" && name === "href") {
            const href = element.getAttribute("href") || "";

            if (!href.startsWith("http://") && !href.startsWith("https://")) {
              element.removeAttribute("href");
            } else {
              element.setAttribute("target", "_blank");
              element.setAttribute("rel", "noopener noreferrer");
            }

            return;
          }

          element.removeAttribute(attribute.name);
        });

        cleanNode(element);
      }
    });
  }

  cleanNode(document.body);
  return document.body.innerHTML;
}

export function SecretDetailsDialog({
  item,
  open,
  onOpenChange,
  onDelete,
}: Props) {
  const [showSecret, setShowSecret] = useState(false);

  if (!item) return null;

  const sanitizedNote = item.note ? sanitizeBasicHtml(item.note) : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setShowSecret(false);
        onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.title || "Untitled"}</DialogTitle>
          <DialogDescription>Decrypted record details</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          <div className="flex flex-wrap gap-2">
            <Badge>{item.type}</Badge>
            {item.createdAt && (
              <Badge variant="outline">{item.createdAt}</Badge>
            )}
          </div>

          <Separator />

          {item.type === "password" && (
            <>
              <Detail label="Website" value={item.website} />
              <Detail label="Email / Username" value={item.username} />

              <div className="space-y-2">
                <Label>Password</Label>

                <div className="flex items-center gap-2 rounded-md border bg-muted px-3 py-2">
                  <code className="flex-1 break-all text-sm">
                    {item.secret
                      ? showSecret
                        ? item.secret
                        : "••••••••••••••••"
                      : "-"}
                  </code>

                  {item.secret && (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowSecret((value) => !value)}
                    >
                      {showSecret ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {item.type === "note" && (
            <div className="space-y-2">
              <Label>Note</Label>

              <div
                className="rounded-md border bg-muted px-4 py-3 text-sm [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_strong]:font-bold [&_em]:italic"
                dangerouslySetInnerHTML={{
                  __html: sanitizedNote || "<p>-</p>",
                }}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="destructive"
              onClick={() => onDelete(item.id)}
              type="button"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type DetailProps = {
  label: string;
  value?: string;
};

function Detail({ label, value }: DetailProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="rounded-md border bg-muted px-3 py-2 text-sm">
        {value || "-"}
      </div>
    </div>
  );
}
