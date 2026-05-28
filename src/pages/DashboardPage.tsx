import { useEffect, useMemo, useState } from "react";
import { type User, signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { LogOut, Plus, Search, ShieldCheck } from "lucide-react";

import { auth, db } from "@/lib/firebase";
import { decryptText, encryptText } from "@/lib/crypto";
import type {
  VaultFirestoreDocument,
  VaultForm,
  VaultItem,
} from "@/types/vault";

import { AddSecretDialog } from "@/components/AddSecretDialog";
import { SecretDetailsDialog } from "@/components/SecretDetailsDialog";
import { StatCard } from "@/components/StatCard";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  user: User;
  vaultKey: CryptoKey;
  onLocked: () => void;
};

export function DashboardPage({ user, vaultKey, onLocked }: Props) {
  const [items, setItems] = useState<VaultItem[]>([]);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filteredItems = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return items;

    return items.filter((item) => {
      return [item.title, item.username, item.website, item.type, item.note]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(value));
    });
  }, [items, search]);

  useEffect(() => {
    void loadItems();
  }, [user.uid]);

  async function loadItems() {
    const vaultQuery = query(
      collection(db, "users", user.uid, "vault"),
      orderBy("createdAt", "desc"),
    );

    const snapshot = await getDocs(vaultQuery);
    const decryptedItems: VaultItem[] = [];

    for (const documentSnapshot of snapshot.docs) {
      const encryptedRecord = documentSnapshot.data() as VaultFirestoreDocument;

      try {
        if (!encryptedRecord.encrypted) {
          throw new Error("Missing encrypted payload");
        }

        const decryptedJson = await decryptText(
          vaultKey,
          encryptedRecord.encrypted,
        );

        const parsedItem = JSON.parse(decryptedJson) as VaultForm & {
          createdAtClient?: string;
        };

        decryptedItems.push({
          id: documentSnapshot.id,
          ...parsedItem,
          createdAt:
            encryptedRecord.createdAt?.toDate?.()?.toLocaleString() ?? "-",
        });
      } catch {
        decryptedItems.push({
          id: documentSnapshot.id,
          title: "Unable to decrypt item",
          username: "",
          website: "",
          secret: "",
          note: "Wrong key or corrupted data.",
          type: "note",
          createdAt: "-",
        });
      }
    }

    setItems(decryptedItems);
  }

  async function saveItem(form: VaultForm) {
    setSaving(true);
    setError("");

    try {
      const plainRecord: VaultForm & { createdAtClient: string } = {
        ...form,
        createdAtClient: new Date().toISOString(),
      };

      const encrypted = await encryptText(
        vaultKey,
        JSON.stringify(plainRecord),
      );

      await addDoc(collection(db, "users", user.uid, "vault"), {
        encrypted,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await loadItems();
    } catch {
      setError("Could not save the encrypted item.");
      throw new Error("Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(itemId: string) {
    await deleteDoc(doc(db, "users", user.uid, "vault", itemId));

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId),
    );

    setSelectedItem(null);
  }

  async function logout() {
    onLocked();
    await signOut(auth);
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold leading-tight">Secret Vault</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <AddSecretDialog
              saving={saving}
              error={error}
              onSave={saveItem}
              trigger={
                <Button type="button">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Secret
                </Button>
              }
            />

            <Button variant="outline" onClick={logout} type="button">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total records"
            value={items.length}
            description="Decrypted only in browser"
          />

          <StatCard
            title="Passwords"
            value={items.filter((item) => item.type === "password").length}
            description="Stored as encrypted ciphertext"
          />

          <StatCard
            title="Notes"
            value={items.filter((item) => item.type === "note").length}
            description="Private notes and secrets"
          />
        </div>

        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Vault records</CardTitle>
              <CardDescription>
                Click a row to view the decrypted record.
              </CardDescription>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                className="pl-9"
                placeholder="Search records..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </CardHeader>

          <CardContent>
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-28 text-center text-muted-foreground"
                      >
                        No records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems.map((item) => (
                      <TableRow
                        key={item.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <TableCell className="font-medium">
                          {item.title || "Untitled"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              item.type === "password" ? "default" : "secondary"
                            }
                          >
                            {item.type}
                          </Badge>
                        </TableCell>

                        <TableCell className="max-w-[260px] truncate text-muted-foreground">
                          {item.website || "-"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {item.username || "-"}
                        </TableCell>

                        <TableCell className="text-muted-foreground">
                          {item.createdAt || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>

      <SecretDetailsDialog
        item={selectedItem}
        open={Boolean(selectedItem)}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null);
        }}
        onDelete={deleteItem}
      />
    </main>
  );
}
