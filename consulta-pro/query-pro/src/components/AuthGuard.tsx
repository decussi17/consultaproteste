"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const AuthGuard = ({
  children,
  redirectTo = "/login",
}: AuthGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, redirectTo, router]);

  // Renderiza um estado de carregamento enquanto verifica a autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Se não estiver autenticado, não renderize nada (o redirecionamento ocorrerá no useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // Se estiver autenticado, renderize o conteúdo protegido
  return <>{children}</>;
};

export default AuthGuard;
