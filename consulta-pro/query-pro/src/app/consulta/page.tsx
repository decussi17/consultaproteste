"use client";
import React, { useState, useEffect } from "react";
import ConsultaTable from "./_components/ConsultaTable";
import { useAuth } from "../context/AuthContext";

const ConsultaPage = () => {
  console.log("🔍 ConsultaPage component está sendo renderizado");

  const { user } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Debug: verificar se o componente está montando
  useEffect(() => {
    console.log("🔍 useEffect do ConsultaPage executado");
  }, []);

  useEffect(() => {
    const fetchConsultas = async () => {
      console.log("🔍 fetchConsultas iniciado");

      // Reiniciar estados
      setLoading(true);
      setError(null);
      setDebugInfo(null);

      // Debug: verificar o estado do user
      console.log("Contexto do usuário completo:", user);
      console.log("ID do usuário:", user?.id);
      console.log("Tipo do ID do usuário:", typeof user?.id);

      // Verificar se o usuário foi carregado e tem um ID
      if (!user || !user.id) {
        console.log("🔍 Usuário não carregado ou sem ID");
        if (user === null) {
          setError("Usuário não autenticado");
        } else if (user && !user.id) {
          setError("Usuário sem ID válido");
        }
        setLoading(user === null);
        return;
      }

      try {
        // Usando a URL correta da API
        const apiUrl = `/api/consultas?user_id=${user.id}`;
        console.log("🔍 Fazendo requisição para:", apiUrl);

        const response = await fetch(apiUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("🔍 Status da resposta:", response.status);

        const responseText = await response.text();
        console.log("🔍 Resposta bruta:", responseText);

        if (!response.ok) {
          throw new Error(
            `Erro HTTP! status: ${response.status} - ${responseText}`
          );
        }

        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error("Erro ao fazer parse do JSON:", parseError);
          throw new Error(
            `Resposta não é JSON válido. Resposta: ${responseText.substring(
              0,
              200
            )}...`
          );
        }

        console.log("🔍 Consultas recebidas:", data);
        console.log("🔍 Definindo consultas no estado...");
        setConsultas(data);
      } catch (error) {
        console.error("🔍 Erro ao buscar consultas:", error);
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Erro desconhecido");
        }
      } finally {
        console.log("🔍 Finalizando loading...");
        setLoading(false);
      }
    };

    fetchConsultas();
  }, [user]);

  console.log(
    "🔍 Estado atual - loading:",
    loading,
    "error:",
    error,
    "consultas:",
    consultas.length
  );

  // Forçar renderização da interface mesmo com loading
  if (loading) {
    console.log("🔍 Renderizando loading...");
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          minHeight: "100vh",
          backgroundColor: "#f0f0f0",
        }}
      >
        <h1>Carregando consultas...</h1>
        <p>Por favor, aguarde...</p>
      </div>
    );
  }

  if (error) {
    console.log("🔍 Renderizando erro...");
    return (
      <div
        style={{
          padding: "20px",
          textAlign: "center",
          minHeight: "100vh",
          backgroundColor: "#ffe6e6",
        }}
      >
        <h1 style={{ color: "red" }}>Erro: {error}</h1>
        <button onClick={() => window.location.reload()}>
          Recarregar Página
        </button>
      </div>
    );
  }

  console.log(
    "🔍 Renderizando ConsultaTable com",
    consultas.length,
    "consultas"
  );
  return (
    <div>
      <h1 style={{ padding: "20px", backgroundColor: "#e6f3ff" }}>
        DEBUG: Página de Consultas Carregada - {consultas.length} consultas
        encontradas
      </h1>
      <ConsultaTable consultas={consultas} />
    </div>
  );
};

export default ConsultaPage;
