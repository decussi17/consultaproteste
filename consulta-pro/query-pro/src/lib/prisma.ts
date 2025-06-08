import { PrismaClient } from "@prisma/client";

// Declaração global para desenvolvimento
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Criar instância única do Prisma Client
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Em desenvolvimento, salvar na variável global para evitar recriar conexões
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Hook para fechar conexões quando necessário
export const disconnectPrisma = async () => {
  await prisma.$disconnect();
};
