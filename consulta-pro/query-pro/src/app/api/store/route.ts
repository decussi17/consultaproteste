import { ClientFormData } from "@/types";
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

const documentList: {
  CPF: { label: string; link: string; params?: any }[];
  CNPJ: { label: string; link: string; params?: any }[];
} = {
  CPF: [
    {
      label:
        "RF - Certidão de Débitos Relativos a Créditos Tributários Federais e à Dívida Ativa de União",
      link: `https:api.infosimples.com/api/v2/consultas/receita-federal/pgfn`,
    },
    {
      label: "TRT2 - Certidão de Reclamação Trabalhista",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt2/ceat`,
    },
    {
      label: "TRT15 - Certidão Eletrônica de Ações Trabalhistas CEAT",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt15/ceat`,
    },
    {
      label:
        "PJE - Emissão de Certidão Trabalhista - Processos eletrônicos trabalhistas",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt2/ceat-digital`,
    },
    {
      label: "CNDT - Certidão Negativa de Débitos Trabalhistas",
      link: `https://api.infosimples.com/api/v2/consultas/tst/cndt`,
    },
    {
      label:
        "PROTESTOS - Central de Protestos do Estado de São Paulo - CENPROT",
      link: `https://api.infosimples.com/api/v2/consultas/cenprot-sp/protestos`,
    },
    {
      label: "MUNICIPAL - Emissão de Certidão Conjunta de Tributos Municipais",
      link: `https://api.infosimples.com/api/v2/consultas/pref/sp/sao-paulo/ctm`,
    },
    {
      label:
        "DIVIDA ATIVA - Certidão Negativa de Débitos Inscritos da Dívida Ativa do Estado de São Paulo - e - CRDA",
      link: `https://api.infosimples.com/api/v2/consultas/pge/sp/cndt`,
    },
    {
      label:
        "ESTADUAL - Certidão Negativa de Débitos Tributários Não Inscritos",
      link: `https://api.infosimples.com/api/v2/consultas/sefaz/sp/certidao-debitos`,
    },
    {
      label: "Justiça Federal Civel São Paulo - JF CIVEL",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        tipo: "1",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CRIMINAL",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        tipo: "2",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CRIMINAL - Segundo Grau",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        abrangencia: "3",
        tipo: "2",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CÍVEL - Segundo Grau",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        abrangencia: "3",
        tipo: "1",
      },
    },
    {
      label: "CERTIDÃO DISTRIBUIÇÃO - FALÊNCIAS, CONCORDATAS E RECUPERAÇÕES",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "1",
      },
    },
    {
      label: "CERTIDÃO DISTRIBUIÇÃO - INVENTÁRIOS, ARROLAMENTOS E TESTAMENTOS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "2",
      },
    },
    {
      label: "CERTIDÃO DE DISTRIBUIÇÃO CIVEL EM GERAL - ATÉ 10 ANOS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "4",
      },
    },
    {
      label: "CERTIDÃO DE DISTRIBUIÇÃO DE AÇÕES CRIMINAIS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "6",
      },
    },
    {
      label: "TJ CONSULTA - Consulta Processual - Tribunal de Justiça",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/primeiro-grau`,
    },
  ],
  CNPJ: [
    {
      label:
        "CNPJ - Emissão de Comprovante de Inscrição e de Situação Cadastral",
      link: `https://api.infosimples.com/api/v2/consultas/receita-federal/cnpj`,
    },
    {
      label: "FGTS - Consulta Regularidade do Empregador",
      link: `https://api.infosimples.com/api/v2/consultas/caixa/regularidade`,
    },
    {
      label:
        "RF - Certidão de Débitos Relativos a Créditos Tributários Federais e à Divida Ativa da União",
      link: `https://api.infosimples.com/api/v2/consultas/receita-federal/pgfn/nova`,
    },
    {
      label: "TRT2 - Certidão Eletrônica de Ações Trabalhistas",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt2/ceat`,
    },
    {
      label: "TRT15 - Certidão Eletrônica de Ações Trabalhistas",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt15/ceat`,
    },
    {
      label:
        "PJE - Emissão de Certidão Trabalhista (PJE) Processos Eletrônicos Trabalistas",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trt23/ceat`,
    },
    {
      label: "CNDT - Certidão Negativa de Débitos Trabalhistas",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tst/cndt`,
    },
    {
      label:
        "PROTESTOS - CENPROT - Central de Protestos do Estado de São Paulo",
      link: `https://api.infosimples.com/api/v2/consultas/cenprot-sp/protestos`,
    },
    {
      label: "MUNICIPAL - Emissão de Certidão Conjunta de Tributos Municipais",
      link: `https://api.infosimples.com/api/v2/consultas/pref/sp/sao-paulo/ctm`,
    },
    {
      label:
        "e-CRDA - Certidão Negativa de Débitos Inscritos da Dívida Ativa do Estado de São Paulo",
      link: `https://api.infosimples.com/api/v2/consultas/pge/sp/cndt`,
    },
    {
      label:
        "DIVIDA ATIVA - Certidão Negativa de Débitos Inscritos da Dívida Ativa do Estado de São Paulo",
      link: `https://api.infosimples.com/api/v2/consultas/sefaz/sp/certidao-debitos`,
    },
    {
      label: "Justiça Federal Civel São Paulo - JF CIVEL",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        tipo: "1",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CRIMINAL",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        tipo: "2",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CRIMINAL - Segundo Grau",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        abrangencia: "3",
        tipo: "2",
      },
    },
    {
      label: "Justiça Federal CrIminal São Paulo – JF CÍVEL - Segundo Grau",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/trf3/certidao-distr`,
      params: {
        abrangencia: "3",
        tipo: "1",
      },
    },
    {
      label: "CERTIDÃO DISTRIBUIÇÃO - FALÊNCIAS, CONCORDATAS E RECUPERAÇÕES",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "1",
      },
    },
    {
      label: "CERTIDÃO DISTRIBUIÇÃO - INVENTÁRIOS, ARROLAMENTOS E TESTAMENTOS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "2",
      },
    },
    {
      label: "CERTIDÃO DE DISTRIBUIÇÃO CIVEL EM GERAL - ATÉ 10 ANOS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "4",
      },
    },
    {
      label: "CERTIDÃO DE DISTRIBUIÇÃO DE AÇÕES CRIMINAIS",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/pedido-certidao`,
      params: {
        modelo: "7",
      },
    },
    {
      label: "TJ CONSULTA - Consulta Processual - Tribunal de Justiça",
      link: `https://api.infosimples.com/api/v2/consultas/tribunal/tjsp/primeiro-grau`,
    },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validações
    if (!data.user_id) {
      return NextResponse.json(
        { error: "user_id é obrigatório" },
        { status: 400 }
      );
    }

    if (!data.tipo_pessoa) {
      return NextResponse.json(
        { error: "tipo_pessoa é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: parseInt(data.user_id) },
    });

    if (!userExists) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    // Criar a consulta
    const consulta = await prisma.consulta.create({
      data: {
        form_data: data,
        status: "Pending",
        user_id: parseInt(data.user_id), // Garantir que seja um número
      },
    });

    // Função para criar documentos de forma assíncrona mas aguardando todas
    const createDocuments = async (documents: any[]) => {
      const documentPromises = documents.map(async (doc) => {
        return await prisma.documento.create({
          data: {
            consulta_id: consulta.id,
            document_name: doc.label,
            integration_url: doc.link,
            sent_data: doc.params ? doc.params : null,
            status: "Pending",
            user_id: parseInt(data.user_id), // Garantir que seja um número
          },
        });
      });

      return await Promise.all(documentPromises);
    };

    // Criar documentos baseado no tipo de pessoa
    if (data.tipo_pessoa === "fisica") {
      await createDocuments(documentList.CPF);
    } else if (data.tipo_pessoa === "juridica") {
      await createDocuments(documentList.CNPJ);
    } else {
      return NextResponse.json(
        { error: "tipo_pessoa deve ser 'fisica' ou 'juridica'" },
        { status: 400 }
      );
    }

    // Retornar a consulta criada com os documentos
    const consultaCompleta = await prisma.consulta.findUnique({
      where: { id: consulta.id },
      include: {
        documentos: true,
        user: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(consultaCompleta);
  } catch (error) {
    console.error("Erro ao criar consulta:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
