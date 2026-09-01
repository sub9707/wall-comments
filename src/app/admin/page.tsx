"use client";

import { useEffect, useState } from "react";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminPanel } from "@/components/admin/AdminPanel";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((res) => res.json())
      .then((data: { authenticated: boolean }) => setAuthenticated(data.authenticated))
      .catch(() => setAuthenticated(false));
  }, []);

  if (authenticated === null) return null;

  return authenticated ? (
    <AdminPanel onLogout={() => setAuthenticated(false)} />
  ) : (
    <AdminLogin onSuccess={() => setAuthenticated(true)} />
  );
}
