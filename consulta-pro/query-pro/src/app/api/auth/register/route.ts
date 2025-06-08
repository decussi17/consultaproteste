import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, name, email } = body;

    // Validações básicas
    if (!username || !password) {
      return NextResponse.json(
        { message: "Usuário e senha são obrigatórios" },
        { status: 400 }
      );
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: {
        username,
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Nome de usuário ou email já cadastrado" },
        { status: 409 }
      );
    }

    // Hash da senha
    const saltRounds = 8;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Criar o usuário
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        email: email || null,
        role: "user", // Padrão é "user"
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
