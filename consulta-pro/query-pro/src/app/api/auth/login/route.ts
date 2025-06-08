import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validações básicas
    if (!username || !password) {
      return NextResponse.json(
        { message: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Buscar o usuário
    const user = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    // Verificar senha
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    // Gerar token JWT
    const jwtSecret = process.env.JWT_SECRET || "secret_default_key";
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      jwtSecret,
      { expiresIn: "1d" }
    );

    // Enviar resposta com token e dados do usuário
    return NextResponse.json({
      message: "Login realizado com sucesso",
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
