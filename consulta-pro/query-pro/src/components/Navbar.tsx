"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link href="/login" className="navbar-brand">
          <Image
            src="/logo_tech_docs.svg"
            alt="Logo"
            width={50}
            height={50}
            priority
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <div className="dropdown show" ref={dropdownRef}>
            <button
              className={`${styles.navbarButton} btn`}
              onClick={toggleDropdown}
              aria-haspopup="true"
              aria-expanded={isOpen}
            >
              Novo Negócio
            </button>

            <div
              className={`dropdown-menu ${isOpen ? "show" : ""}`}
              aria-labelledby="dropdownMenuLink"
            >
              <Link className="dropdown-item" href="/formulario">
                <span className={styles.dropdownItem}>Nova Consulta</span>
              </Link>
              <Link className="dropdown-item" href="/">
                <span className={styles.dropdownItem}>Novo Negócio</span>
              </Link>
            </div>
          </div>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link
                className={`${styles.navbarLink} nav-link`}
                href="/consulta"
              >
                <span>Histórico de Consultas</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
