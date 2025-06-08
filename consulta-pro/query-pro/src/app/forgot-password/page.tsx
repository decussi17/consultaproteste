"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../login/login.css";

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Validação simples
    if (!email) {
      setError("Por favor, informe seu email");
      setLoading(false);
      return;
    }

    try {
      // Aqui você implementaria a lógica real de recuperação de senha
      // Por enquanto vamos apenas simular o processo

      // Fingir um atraso na rede
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulando sucesso
      setMessage(
        "Instruções de recuperação de senha foram enviadas para seu email"
      );

      // Em uma implementação real, você enviaria um email com link para reset de senha
    } catch (error: any) {
      setError(error.message || "Ocorreu um erro ao processar sua solicitação");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="login-container">
      <div className="login-card">
        <div className="logo-section">
          <div className="logo-container">
            <Image
              src="./logo_tech_docs.svg"
              alt="Logo"
              width={200}
              height={80}
            />
          </div>
        </div>

        <div className="form-section">
          <div className="login-form">
            <h2 className="login-title">RECUPERAR SENHA</h2>

            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <i className="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Digite seu email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="login-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "ENVIANDO..." : "ENVIAR INSTRUÇÕES"}
                </button>
              </div>
            </form>
            <div className="social-login">
              <a href="/login" className="create-account">
                Voltar para o login
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ForgotPassword;
