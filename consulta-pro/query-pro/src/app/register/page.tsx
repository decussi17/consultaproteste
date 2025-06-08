"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../login/login.css";

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validações básicas
    if (!formData.username || !formData.password) {
      setError("Usuário e senha são obrigatórios");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          name: formData.name,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao criar conta");
      }

      // Redirecionar para login após registro bem-sucedido
      router.push("/login?registered=true");
    } catch (error: any) {
      setError(error.message);
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
            <h2 className="login-title">CRIAR CONTA</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <i className="bi bi-person input-icon"></i>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome de usuário"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bi bi-person-vcard input-icon"></i>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Nome completo"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <i className="bi bi-envelope input-icon"></i>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Senha"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bi bi-lock-fill input-icon"></i>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirmar senha"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="login-actions">
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "PROCESSANDO..." : "CADASTRAR"}
                </button>
              </div>
            </form>
            <div className="social-login">
              <a href="/login" className="create-account">
                Já possui conta? Faça login
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Register;
