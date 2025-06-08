import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Função para verificar o token JWT com jose
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || "secret_default_key"
    );
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    return null;
  }
}

// Rotas públicas que não precisam de autenticação
const publicRoutes = ["/login", "/register"];

// Middleware para autenticação
export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Verificar se é uma rota de API
  const isApiRoute = path.startsWith("/api");

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  // Permitir acesso a rotas públicas
  if (
    isPublicRoute ||
    (isApiRoute &&
      (path.includes("/auth/login") || path.includes("/auth/register")))
  ) {
    return NextResponse.next();
  }

  // Verificar token nas rotas protegidas
  const token =
    request.cookies.get("authToken")?.value ||
    request.headers.get("Authorization")?.split(" ")[1];

  if (!token) {
    // Se for uma rota de API, retornar erro 401
    if (isApiRoute) {
      return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
    }
    // Redirecionar para login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Verificar validade do token
  const payload = await verifyToken(token);

  if (!payload) {
    // Se for uma rota de API, retornar erro 401
    if (isApiRoute) {
      return NextResponse.json(
        { message: "Token inválido ou expirado" },
        { status: 401 }
      );
    }
    // Redirecionar para login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

// Configurar em quais caminhos o middleware será executado
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo_tech_docs.svg|maleprofile.webp).*)",
  ],
};
