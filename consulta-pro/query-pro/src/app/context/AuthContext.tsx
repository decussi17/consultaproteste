"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

// Defina o tipo para os dados do usuário
interface UserData {
  id: number;
  username: string;
  name?: string;
  role: string;
}

// Interface para o contexto de autenticação
interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  login: (token: string, userData: UserData) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Crie o contexto de autenticação
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Componente provedor de autenticação
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verifique a autenticação quando o componente for montado
  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      const userData = localStorage.getItem("userData");

      if (!token || !userData) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(JSON.parse(userData));
    } catch (error) {
      console.error("Erro na verificação de autenticação:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de login
  const login = (token: string, userData: UserData) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("userData", JSON.stringify(userData));
    setUser(userData);
  };

  // Função de logout
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    setUser(null);
    router.push("/login");
  };

  const isAuthenticated = !!user && !!localStorage.getItem("authToken");

  // Valor a ser fornecido pelo contexto
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Componente de proteção de rota
interface RouteGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const RouteGuard = ({ children, fallback }: RouteGuardProps) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/register", "/", "/about"];

  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    if (!loading && !isAuthenticated && !isPublicRoute) {
      router.push("/login");
    }
  }, [isAuthenticated, loading, isPublicRoute, router]);

  // Mostra loading enquanto verifica autenticação
  if (loading) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )
    );
  }

  // Se não está autenticado e não é rota pública, não renderiza nada
  // (o useEffect já redirecionou para login)
  if (!isAuthenticated && !isPublicRoute) {
    return null;
  }

  return <>{children}</>;
};

// Hook para verificar permissões por role
export const usePermissions = () => {
  const { user } = useAuth();

  const hasRole = (requiredRole: string) => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  return { hasRole, hasAnyRole };
};

// Componente para proteger por role
interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export const RoleGuard = ({
  children,
  allowedRoles,
  fallback,
}: RoleGuardProps) => {
  const { user } = useAuth();
  const { hasAnyRole } = usePermissions();

  if (!user || !hasAnyRole(allowedRoles)) {
    return (
      fallback || (
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Acesso Negado
            </h2>
            <p className="text-gray-600">
              Você não tem permissão para acessar esta página.
            </p>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
