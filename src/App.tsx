import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { LoginPage } from "@/pages/LoginPage";
import { UnlockPage } from "@/pages/UnlockPage";
import { DashboardPage } from "@/pages/DashboardPage";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [vaultKey, setVaultKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setVaultKey(null);
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        Loading secure vault...
      </main>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (!vaultKey) {
    return <UnlockPage user={user} onUnlocked={setVaultKey} />;
  }

  return (
    <DashboardPage
      user={user}
      vaultKey={vaultKey}
      onLocked={() => setVaultKey(null)}
    />
  );
}
