import { type FormEvent, useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Lock } from "lucide-react";

import { auth } from "@/lib/firebase";
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

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch {
      setError("Invalid email or password.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Lock size={30} />
          </div>

          <div>
            <CardTitle className="text-3xl">Secret Vault</CardTitle>
            <CardDescription>Login with your Firebase account.</CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </Field>

            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </Field>

            {error && <ErrorBox text={error} />}

            <Button className="w-full" size="lg">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
