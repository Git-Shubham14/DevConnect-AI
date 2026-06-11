"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

const S = {
  // ── Landing navbar ──────────────────────────────────────────────────────────
  landingNav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8%",
    background: "rgba(3, 7, 18, 0.75)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all var(--transition-fast)",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
  },
  logoIcon: {
    background: "linear-gradient(135deg, #38bdf8, #a855f7)",
    color: "#000",
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    fontWeight: 900,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 0 15px rgba(56, 189, 248, 0.3)",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: 32,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "var(--transition-fast)",
    padding: "6px 0",
  },
  btnNavCta: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, #38bdf8, #a855f7)",
    color: "#000",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.2)",
    textDecoration: "none",
  },

  // ── Dashboard navbar ─────────────────────────────────────────────────────────
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 64,
    padding: "0 24px",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: "1.25rem",
    color: "var(--text-primary)",
    textDecoration: "none",
  },
  navSearch: {
    position: "relative",
    width: "100%",
    maxWidth: 420,
    margin: "0 16px",
  },
  navSearchInput: {
    width: "100%",
    padding: "8px 16px 8px 40px",
    backgroundColor: "rgba(30, 41, 59, 0.8)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.9rem",
    transition: "all var(--transition-fast)",
  },
  navSearchIcon: {
    position: "absolute",
    left: 14,
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
    pointerEvents: "none",
  },
  navActions: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  btnIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
  },
  userProfileMenu: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    cursor: "pointer",
    textDecoration: "none",
  },
  avatar: {
    position: "relative",
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, #0284c7, #38bdf8)",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "2px solid var(--border-color)",
  },
};

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // ─── Landing Page Navbar ────────────────────────────────────────────────────
  if (variant === "landing") {
    return (
      <nav style={S.landingNav}>
        <Link href="/" style={S.logo}>
          <div style={S.logoIcon}>🧠</div>
          <span>DevConnect AI</span>
        </Link>

        <div style={S.navLinks}>
          <a href="#features" style={S.navLink}>AI Showcase</a>
          <a href="#workflow" style={S.navLink}>How It Works</a>
          <a href="#stats" style={S.navLink}>Dashboard</a>
          <a href="#waitlist" style={S.navLink}>Waitlist</a>

          {user ? (
            <>
              <Link href="/dashboard" style={S.btnNavCta}>
                Open Community App
              </Link>
              <Link
                href="/profile"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      border: "2px solid var(--border-color)",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "var(--radius-full)",
                      background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "#000",
                    }}
                  >
                    {user.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <span>{user.displayName?.split(" ")[0]}</span>
              </Link>
            </>
          ) : (
            <Link href="/login" style={S.btnNavCta}>
              Sign In
            </Link>
          )}
        </div>
      </nav>
    );
  }

  // ─── Dashboard / App Navbar ─────────────────────────────────────────────────
  return (
    <header style={S.navbar}>
      <Link href="/" style={S.navBrand} title="Back to Home">
        <span>🧠 DevConnect AI</span>
      </Link>

      <div style={S.navSearch}>
        <span style={S.navSearchIcon}>🔍</span>
        <input
          type="text"
          placeholder="Search discussions, tags, error codes..."
          style={S.navSearchInput}
        />
      </div>

      <div style={S.navActions}>
        <button style={S.btnIcon} title="AI Code Review Alerts">✨</button>
        <button style={S.btnIcon} title="Notifications">🔔</button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link href="/profile" style={S.userProfileMenu} title="View Profile">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "var(--radius-full)",
                    border: "2px solid var(--border-color)",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={S.avatar}>
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </div>
              )}
              <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                {user.displayName?.split(" ")[0] || "Profile"}
              </span>
            </Link>

            <button onClick={handleLogout} style={{ ...S.btnIcon, fontSize: "1rem" }} title="Logout">
              🚪
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            style={{
              padding: "8px 16px",
              background: "var(--accent-primary)",
              color: "#000",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
