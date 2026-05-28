import { type FormEvent, type ReactNode, useState } from "react";
import { emptyForm, type VaultForm, type VaultItemType } from "@/types/vault";
import { Field } from "@/components/Field";
import { ErrorBox } from "@/components/ErrorBox";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichNoteEditor } from "./RichNoteEditor";

type Props = {
  trigger: ReactNode;
  saving: boolean;
  error: string;
  onSave: (form: VaultForm) => Promise<void>;
};

export function AddSecretDialog({ trigger, saving, error, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<VaultForm>(emptyForm);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanedForm: VaultForm =
      form.type === "note"
        ? {
            ...form,
            website: "",
            username: "",
            secret: "",
          }
        : form;

    await onSave(cleanedForm);
    setForm(emptyForm);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add encrypted item</DialogTitle>
          <DialogDescription>
            Data is encrypted in your browser before it is saved to Firestore.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 pt-2">
          <Field label="Type">
            <Select
              value={form.type}
              onValueChange={(value: VaultItemType) =>
                setForm({ ...emptyForm, type: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="password">Password</SelectItem>
                <SelectItem value="note">Secret Note</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field label="Title">
            <Input
              value={form.title}
              onChange={(event) =>
                setForm({ ...form, title: event.target.value })
              }
              required
            />
          </Field>

          {form.type === "password" && (
            <>
              <Field label="Website">
                <Input
                  value={form.website}
                  onChange={(event) =>
                    setForm({ ...form, website: event.target.value })
                  }
                  placeholder="https://example.com"
                />
              </Field>

              <Field label="Email / Username">
                <Input
                  value={form.username}
                  onChange={(event) =>
                    setForm({ ...form, username: event.target.value })
                  }
                />
              </Field>

              <Field label="Password">
                <Input
                  type="password"
                  value={form.secret}
                  onChange={(event) =>
                    setForm({ ...form, secret: event.target.value })
                  }
                />
              </Field>
            </>
          )}

          {form.type === "note" && (
            <Field label="Note">
              <RichNoteEditor
                value={form.note}
                onChange={(html) => setForm({ ...form, note: html })}
              />
            </Field>
          )}

          {error && <ErrorBox text={error} />}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button disabled={saving}>
              {saving ? "Encrypting..." : "Save encrypted item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
