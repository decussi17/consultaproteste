import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Inicializar Prisma Client
const prisma = new PrismaClient();

// GET /api/consultas
export async function GET(request: NextRequest) {
  try {
    // Obter parâmetros da URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    console.log("API consultas - user_id recebido:", userId);

    // Validar se user_id foi fornecido
    if (!userId) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    // Converter para número
    const userIdNumber = parseInt(userId);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: "user_id deve ser um número válido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Buscar consultas do usuário com relacionamentos
    const consultas = await prisma.consulta.findMany({
      where: {
        user_id: userIdNumber,
      },
      include: {
        documentos: {
          select: {
            id: true,
            document_name: true,
            status: true,
            created_at: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    console.log(
      `API consultas - encontradas ${consultas.length} consultas para usuário ${userIdNumber}`
    );

    // Formatar dados para retorno
    const consultasFormatadas = consultas.map((consulta) => ({
      id: consulta.id,
      status: consulta.status,
      created_at: consulta.created_at,
      updated_at: consulta.updated_at,
      form_data: consulta.form_data,
      user: consulta.user,
      documentos: consulta.documentos,
      total_documentos: consulta.documentos.length,
      documentos_pending: consulta.documentos.filter(
        (doc) => doc.status === "Pending"
      ).length,
      documentos_finished: consulta.documentos.filter(
        (doc) => doc.status === "Finished"
      ).length,
      documentos_error: consulta.documentos.filter(
        (doc) => doc.status === "Error"
      ).length,
    }));

    return NextResponse.json(consultasFormatadas, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Erro na API consultas:", error);

    // Log detalhado do erro
    if (error instanceof Error) {
      console.error("Erro detalhado:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }

    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Erro desconhecido"
            : "Erro interno",
      },
      { status: 500 }
    );
  } finally {
    // Fechar conexão Prisma
    await prisma.$disconnect();
  }
}

// POST /api/consultas - Criar nova consulta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("API consultas POST - dados recebidos:", body);

    // Validação básica
    if (!body.user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    const userIdNumber = parseInt(body.user_id);
    if (isNaN(userIdNumber)) {
      return NextResponse.json(
        { error: "user_id deve ser um número válido" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Criar nova consulta
    const novaConsulta = await prisma.consulta.create({
      data: {
        user_id: userIdNumber,
        form_data: body.form_data || null,
        status: "Pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    console.log("Nova consulta criada:", novaConsulta);

    return NextResponse.json(novaConsulta, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar consulta:", error);

    return NextResponse.json(
      {
        error: "Erro ao criar consulta",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Erro desconhecido"
            : "Erro interno",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// PUT /api/consultas - Atualizar consulta
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const consultaId = searchParams.get("id");

    if (!consultaId) {
      return NextResponse.json(
        { error: "ID da consulta é obrigatório" },
        { status: 400 }
      );
    }

    const consultaIdNumber = parseInt(consultaId);
    if (isNaN(consultaIdNumber)) {
      return NextResponse.json(
        { error: "ID da consulta deve ser um número válido" },
        { status: 400 }
      );
    }

    // Verificar se a consulta existe
    const consultaExistente = await prisma.consulta.findUnique({
      where: { id: consultaIdNumber },
    });

    if (!consultaExistente) {
      return NextResponse.json(
        { error: "Consulta não encontrada" },
        { status: 404 }
      );
    }

    // Atualizar consulta
    const consultaAtualizada = await prisma.consulta.update({
      where: { id: consultaIdNumber },
      data: {
        form_data: body.form_data !== undefined ? body.form_data : undefined,
        status: body.status || undefined,
      },
      include: {
        documentos: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(consultaAtualizada, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar consulta:", error);

    return NextResponse.json(
      {
        error: "Erro ao atualizar consulta",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Erro desconhecido"
            : "Erro interno",
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
