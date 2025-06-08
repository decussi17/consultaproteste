"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import "bootstrap-icons/font/bootstrap-icons.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import "./login.css";

const Login = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Se já estiver autenticado, redirecione para a página principal
    if (isAuthenticated) {
      router.push("/personselection");
    }

    // Verificar se o usuário foi registrado com sucesso
    if (searchParams?.get("registered") === "true") {
      setSuccess("Conta criada com sucesso! Faça login para continuar.");
    }
  }, [isAuthenticated, router, searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Falha ao fazer login");
      }

      // Usar a função login do contexto de autenticação
      login(data.token, data.user);

      // Redirecionar para a página principal
      router.push("/personselection");
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
            <h2 className="login-title">LOGIN</h2>

            {success && <div className="alert alert-success">{success}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="input-group">
                <i className="bi bi-person input-icon"></i>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Insira o usuário"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="input-group">
                <i className="bi bi-lock input-icon"></i>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Insira a Senha"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="login-actions">
                <a href="/forgot-password" className="forgot-password">
                  Esqueceu a senha?
                </a>
                <button
                  type="submit"
                  className="login-button"
                  disabled={loading}
                >
                  {loading ? "ENTRANDO..." : "ENTRAR"}
                </button>
              </div>
            </form>
            <div className="social-login">
              <a href="/register" className="create-account">
                Criar Conta
              </a>
              <div className="social-icons">
                <a href="#" className="social-icon social-facebook">
                  <i className="bi bi-facebook"></i>
                </a>
                <a href="#" className="social-icon social-google">
                  <i className="bi bi-google"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
