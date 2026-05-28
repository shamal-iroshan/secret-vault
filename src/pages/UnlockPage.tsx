import { type FormEvent, useMemo, useState } from "react";
import { type User, signOut } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { KeyRound, LogOut } from "lucide-react";

import { auth } from "@/lib/firebase";
import { db } from "@/lib/firebase";
import {
  decryptText,
  deriveVaultKey,
  encryptText,
  KEY_CHECK_TEXT,
  randomBase64,
} from "@/lib/crypto";
import type { UserVaultDocument } from "@/types/vault";
import { Field } from "@/components/Field";
import { ErrorBox } from "@/components/ErrorBox";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Props = {
  user: User;
  onUnlocked: (key: CryptoKey) => void;
};

export function UnlockPage({ user, onUnlocked }: Props) {
  const [masterKeyInput, setMasterKeyInput] = useState("");
  const [error, setError] = useState("");

  const userDocRef = useMemo(() => {
    return doc(db, "users", user.uid);
  }, [user.uid]);

  async function unlockVault(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      const userSnapshot = await getDoc(userDocRef);

      if (!userSnapshot.exists()) {
        const salt = randomBase64(16);
        const key = await deriveVaultKey(masterKeyInput, salt);
        const check = await encryptText(key, KEY_CHECK_TEXT);

        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          salt,
          keyCheck: check,
          createdAt: serverTimestamp(),
        });

        onUnlocked(key);
        return;
      }

      const data = userSnapshot.data() as UserVaultDocument;
      const key = await deriveVaultKey(masterKeyInput, data.salt);
      const checkText = await decryptText(key, data.keyCheck);

      if (checkText !== KEY_CHECK_TEXT) {
        throw new Error("Wrong vault key");
      }

      onUnlocked(key);
    } catch {
      setError(
        "Wrong encryption/decryption key. Your vault could not be unlocked.",
      );
    }
  }

  async function logout() {
    await signOut(auth);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
              <KeyRound size={30} />
            </div>

            <Button variant="ghost" size="icon" onClick={logout} type="button">
              <LogOut size={18} />
            </Button>
          </div>

          <div>
            <CardTitle className="text-3xl">Unlock Vault</CardTitle>
            <CardDescription>Signed in as {user.email}</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={unlockVault} className="space-y-4">
            <Field label="Encryption / Decryption Key">
              <Input
                type="password"
                value={masterKeyInput}
                onChange={(event) => setMasterKeyInput(event.target.value)}
                placeholder="Enter your private vault key"
                required
              />
            </Field>

            {error && <ErrorBox text={error} />}

            <Button className="w-full" size="lg">
              Unlock Vault
            </Button>
          </form>

          <div className="mt-5 rounded-xl border bg-muted/60 p-4 text-sm text-muted-foreground">
            First login creates the vault key for this account. If the key is
            forgotten, old encrypted data cannot be recovered.
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
