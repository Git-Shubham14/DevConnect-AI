"use client";

import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const S = {
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
  navActions: { display: "flex", alignItems: "center", gap: 16 },
  btnNavBack: {
    padding: "8px 16px",
    background: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    fontSize: "0.9rem",
    textDecoration: "none",
  },
  btnLogout: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    width: "auto",
    padding: "0 14px",
    height: 36,
    background: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-full)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "inherit",
  },
  card: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 24,
    boxShadow: "var(--shadow-sm)",
  },
  cardSmall: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 24,
    marginTop: 20,
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: "var(--radius-full)",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-ai))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#000",
    border: "3px solid var(--border-color)",
    flexShrink: 0,
  },
  divider: { borderTop: "1px solid var(--border-color)" },
  infoRow: { display: "flex", alignItems: "center", gap: 12 },
  infoLabel: { color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 2, margin: "0 0 2px 0" },
  infoValue: { color: "var(--text-primary)", fontSize: "0.95rem", margin: 0 },
  btnSignOut: {
    width: "100%",
    padding: 12,
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "var(--radius-md)",
    color: "#ef4444",
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
};

export default function Profile() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
        <p style={{ color: "var(--text-muted)" }}>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const joinedDate = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "Recently";

  return (
    <main style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      {/* Navbar */}
      <header style={S.navbar}>
        <Link href="/dashboard" style={S.navBrand}>
          <span>🧠 DevConnect AI</span>
        </Link>
        <div style={S.navActions}>
          <Link href="/dashboard" style={S.btnNavBack}>← Dashboard</Link>
          <button onClick={handleLogout} style={S.btnLogout} title="Logout">
            🚪 Logout
          </button>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: "40px auto", padding: "0 24px" }}>

        {/* Profile Card */}
        <div style={S.card}>
          {/* Avatar + Name */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                style={{ width: 80, height: 80, borderRadius: "var(--radius-full)", border: "3px solid var(--border-color)", objectFit: "cover" }}
              />
            ) : (
              <div style={S.avatarLarge}>
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "var(--text-primary)", fontSize: "1.6rem", fontWeight: 700, margin: "0 0 4px 0" }}>
                {user.displayName || "Anonymous Developer"}
              </h1>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
                Joined {joinedDate}
              </p>
            </div>
          </div>

          <div style={S.divider} />

          {/* Info rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={S.infoRow}>
              <span style={{ fontSize: "1.1rem" }}>📧</span>
              <div>
                <p style={S.infoLabel}>Email</p>
                <p style={S.infoValue}>{user.email}</p>
              </div>
            </div>

            <div style={S.infoRow}>
              <span style={{ fontSize: "1.1rem" }}>🔐</span>
              <div>
                <p style={S.infoLabel}>Sign-in Provider</p>
                <p style={{ ...S.infoValue, textTransform: "capitalize" }}>
                  {user.providerData?.[0]?.providerId?.replace(".com", "") || "Unknown"}
                </p>
              </div>
            </div>

            <div style={S.infoRow}>
              <span style={{ fontSize: "1.1rem" }}>✅</span>
              <div>
                <p style={S.infoLabel}>Email Verified</p>
                <p style={{ ...S.infoValue, color: user.emailVerified ? "var(--accent-success)" : "var(--accent-warning)", fontWeight: 600 }}>
                  {user.emailVerified ? "Verified" : "Not Verified"}
                </p>
              </div>
            </div>

            <div style={S.infoRow}>
              <span style={{ fontSize: "1.1rem" }}>🪪</span>
              <div>
                <p style={S.infoLabel}>User ID</p>
                <p style={{ ...S.infoValue, color: "var(--text-secondary)", fontSize: "0.8rem", fontFamily: "var(--font-mono)", wordBreak: "break-all" }}>
                  {user.uid}
                </p>
              </div>
            </div>
          </div>

          <div style={S.divider} />

          <button onClick={handleLogout} style={S.btnSignOut}>
            🚪 Sign Out
          </button>
        </div>

        {/* Coming soon card */}
        <div style={S.cardSmall}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            📝 Your posts, saved items, and activity will appear here soon.
          </p>
        </div>
      </div>
    </main>
  );
}
