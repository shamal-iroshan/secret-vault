import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

type Props = {
  label: string;
  children: ReactNode;
};

export function Field({ label, children }: Readonly<Props>) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
