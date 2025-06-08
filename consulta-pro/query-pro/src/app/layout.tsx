import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { Suspense } from "react";
import Spinner from "@/components/Spinner";
import { AuthProvider, RouteGuard } from "./context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Query.PRO",
  description: "Formulário de consulta para pessoa física e jurídica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          <RouteGuard>
            <Suspense fallback={<Spinner />}>{children}</Suspense>
          </RouteGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
