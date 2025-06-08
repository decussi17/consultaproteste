import React from "react";

export default function Spinner() {
  return (
    <div className="row justify-content-center text-center">
      <span>Carregando...</span>
      <i className="spinner-border mt-3" role="status"></i>
    </div>
  );
}
