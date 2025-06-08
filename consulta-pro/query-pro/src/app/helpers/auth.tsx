"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Interface para os dados do usuário
export interface UserData {
  id: number;
  username: string;
  name?: string;
  role: string;
}

// Context para armazenar dados de autenticação (opcional, pode ser expandido posteriormente)
export const useAuth = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar autenticação no carregamento do componente
    const checkAuth = () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");

        if (!token || !userData) {
          throw new Error("Não autenticado");
        }

        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Erro de autenticação:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    router.push("/login");
  };

  return { user, loading, logout };
};

// HOC para proteger componentes do lado do cliente
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) {
      return <div>Carregando...</div>;
    }

    if (!user) {
      return null; // O hook useAuth já redireciona para /login
    }

    return <Component {...props} />;
  };
}

export default useAuth;
