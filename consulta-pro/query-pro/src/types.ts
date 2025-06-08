export type ClientFormData = {
  cpf?: string;
  cnpj?: string;
  nome?: string;
  email: string;
  gender?: string;
  nome_mae?: string;
  nascimento?: string;
  rg_document?: string;
  tipo_pessoa: "fisica" | "juridica";
  uf_nascimento?: string;
};
