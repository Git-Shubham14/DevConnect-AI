"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect } from "react";

const S = {
  // ── Landing navbar ──────────────────────────────────────────────────────────
  landingNav: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    zIndex: 100,
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderBottom: "1px solid var(--border-color)",
    transition: "all var(--transition-fast)",
  },
  landingNavInner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 8%",
  },
  logo: {
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
    textDecoration: "none",
    flexShrink: 0,
  },
  logoIcon: {
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
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
  desktopLinks: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "color var(--transition-fast)",
    padding: "6px 12px",
    cursor: "pointer",
  },
  btnNavCta: {
    display: "inline-block",
    padding: "10px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 600,
    borderRadius: "var(--radius-sm)",
    boxShadow: "0 4px 15px rgba(56, 189, 248, 0.2)",
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    transition: "transform var(--transition-fast)",
  },
  themeToggleBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-primary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1.2rem",
    fontWeight: 600,
    flexShrink: 0,
  },
  hamburgerBtn: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    width: 40,
    height: 40,
    background: "var(--bg-primary)",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    padding: "8px",
    flexShrink: 0,
  },
  hamburgerLine: {
    width: 18,
    height: 2,
    backgroundColor: "var(--text-primary)",
    borderRadius: 2,
    transition: "all 0.25s ease",
  },
  // Mobile drawer
  mobileDrawer: (open) => ({
    overflow: "hidden",
    maxHeight: open ? 600 : 0,
    transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    borderTop: open ? "1px solid var(--border-color)" : "none",
  }),
  mobileDrawerInner: {
    display: "flex",
    flexDirection: "column",
    padding: "16px 6%",
    gap: 4,
    backgroundColor: "var(--bg-secondary)",
  },
  mobileNavLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: "1rem",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
    cursor: "pointer",
    transition: "background 0.15s",
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "none",
    background: "transparent",
    fontFamily: "inherit",
    width: "100%",
    textAlign: "left",
  },
  mobileNavDivider: {
    height: 1,
    backgroundColor: "var(--border-color)",
    margin: "8px 0",
  },
  mobileCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 20px",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    color: "#000",
    fontWeight: 700,
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
    marginTop: 8,
    fontSize: "0.95rem",
  },
  mobileThemeRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    borderRadius: "var(--radius-md)",
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
    backgroundColor: "var(--bg-secondary)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderBottom: "1px solid var(--border-color)",
    gap: 12,
  },
  navBrand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "var(--text-primary)",
    textDecoration: "none",
    flexShrink: 0,
  },
  navSearch: {
    position: "relative",
    flex: 1,
    maxWidth: 420,
  },
  navSearchInput: {
    width: "100%",
    padding: "8px 16px 8px 40px",
    backgroundColor: "var(--bg-tertiary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.9rem",
    transition: "all var(--transition-fast)",
    boxSizing: "border-box",
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
    gap: 10,
    flexShrink: 0,
  },
  btnIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
    background: "transparent",
    border: "1.5px solid var(--border-color)",
    borderRadius: "var(--radius-md)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all var(--transition-fast)",
    fontSize: "1rem",
    flexShrink: 0,
  },
  userProfileMenu: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    textDecoration: "none",
  },
  avatar: {
    width: 36,
    height: 36,
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    borderRadius: "var(--radius-full)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontWeight: 700,
    fontSize: "0.9rem",
    border: "2px solid var(--border-color)",
    flexShrink: 0,
  },
};

export default function Navbar({ variant = "landing" }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

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
        <div style={S.landingNavInner}>
          <Link href="/" style={S.logo}>
            <div style={S.logoIcon}>🧠</div>
            {!isMobile && <span>DevConnect AI</span>}
            {isMobile && <span style={{ fontSize: "1.1rem" }}>DevConnect AI</span>}
          </Link>

          {/* Desktop links */}
          {!isMobile && (
            <div style={S.desktopLinks}>
              <a href="#features" style={S.navLink}>AI Showcase</a>
              <a href="#workflow" style={S.navLink}>How It Works</a>
              <a href="#stats" style={S.navLink}>Dashboard</a>
              <a href="#waitlist" style={S.navLink}>Waitlist</a>

              {user ? (
                <>
                  <Link href="/dashboard" style={S.btnNavCta}>Open Community App</Link>
                  <Link
                    href="/profile"
                    style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.95rem", textDecoration: "none" }}
                  >
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName} style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", border: "2px solid var(--border-color)", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 28, height: 28, borderRadius: "var(--radius-full)", background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, color: "#000" }}>
                        {user.displayName?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                    <span>{user.displayName?.split(" ")[0]}</span>
                  </Link>
                </>
              ) : (
                <Link href="/login" style={S.btnNavCta}>Sign In</Link>
              )}

              <button
                onClick={toggleTheme}
                style={S.themeToggleBtn}
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--accent-primary)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--bg-primary)"; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-primary)"; }}
              >
                {isDarkMode ? "☀️" : "🌙"}
              </button>
            </div>
          )}

          {/* Mobile right side */}
          {isMobile && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={toggleTheme} style={S.themeToggleBtn} title="Toggle theme">
                {isDarkMode ? "☀️" : "🌙"}
              </button>
              <button
                style={S.hamburgerBtn}
                onClick={() => setMobileOpen((o) => !o)}
                aria-label="Toggle menu"
              >
                <span style={{ ...S.hamburgerLine, transform: mobileOpen ? "translateY(7px) rotate(45deg)" : "none" }} />
                <span style={{ ...S.hamburgerLine, opacity: mobileOpen ? 0 : 1 }} />
                <span style={{ ...S.hamburgerLine, transform: mobileOpen ? "translateY(-7px) rotate(-45deg)" : "none" }} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {isMobile && (
          <div style={S.mobileDrawer(mobileOpen)}>
            <div style={S.mobileDrawerInner}>
              <a href="#features" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>✨</span> AI Showcase
              </a>
              <a href="#workflow" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>⚙️</span> How It Works
              </a>
              <a href="#stats" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>📊</span> Dashboard
              </a>
              <a href="#waitlist" style={S.mobileNavLink} onClick={() => setMobileOpen(false)}>
                <span>📬</span> Waitlist
              </a>

              <div style={S.mobileNavDivider} />

              {user ? (
                <>
                  <Link href="/profile" style={{ ...S.mobileNavLink, textDecoration: "none" }} onClick={() => setMobileOpen(false)}>
                    <span>👤</span> {user.displayName?.split(" ")[0] || "Profile"}
                  </Link>
                  <Link href="/dashboard" style={S.mobileCta} onClick={() => setMobileOpen(false)}>
                    Open Community App →
                  </Link>
                </>
              ) : (
                <Link href="/login" style={S.mobileCta} onClick={() => setMobileOpen(false)}>
                  Sign In →
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    );
  }

  // ─── Dashboard / App Navbar ─────────────────────────────────────────────────
  return (
    <header style={S.navbar}>
      <Link href="/" style={S.navBrand} title="Back to Home">
        <span style={{ fontSize: isMobile ? "1.3rem" : "1.1rem" }}>🧠</span>
        {!isMobile && <span>DevConnect AI</span>}
      </Link>

      {/* Search — hidden on very small screens, shown on md+ */}
      {!isMobile && (
        <div style={S.navSearch}>
          <span style={S.navSearchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search discussions, tags, error codes..."
            style={S.navSearchInput}
          />
        </div>
      )}

      <div style={S.navActions}>
        {/* Show search icon on mobile instead of input */}
        {isMobile && (
          <button style={S.btnIcon} title="Search">🔍</button>
        )}

        {!isMobile && (
          <button style={S.btnIcon} title="AI Code Review Alerts">✨</button>
        )}
        <button style={S.btnIcon} title="Notifications">🔔</button>

        <button
          onClick={toggleTheme}
          style={S.btnIcon}
          title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--accent-primary-alpha)"; e.currentTarget.style.borderColor = "var(--accent-primary)"; e.currentTarget.style.color = "var(--accent-primary)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
        >
          {isDarkMode ? "☀️" : "🌙"}
        </button>

        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Link href="/profile" style={S.userProfileMenu} title="View Profile">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} style={{ width: 36, height: 36, borderRadius: "var(--radius-full)", border: "2px solid var(--border-color)", objectFit: "cover" }} />
              ) : (
                <div style={S.avatar}>{user.displayName?.charAt(0).toUpperCase() || "U"}</div>
              )}
              {!isMobile && (
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" }}>
                  {user.displayName?.split(" ")[0] || "Profile"}
                </span>
              )}
            </Link>
            {!isMobile && (
              <button onClick={handleLogout} style={{ ...S.btnIcon, fontSize: "1rem" }} title="Logout">
                🚪
              </button>
            )}
          </div>
        ) : (
          <Link href="/login" style={{ padding: "8px 16px", background: "var(--accent-primary)", color: "#000", borderRadius: "var(--radius-md)", fontWeight: 600, fontSize: "0.9rem", textDecoration: "none", border: "none" }}>
            {isMobile ? "In" : "Sign In"}
          </Link>
        )}
      </div>
    </header>
  );
}