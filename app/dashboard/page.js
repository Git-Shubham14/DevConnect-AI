"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useState, useMemo, useCallback } from "react";
import Navbar from "../../components/Navbar";
import ProtectedRoute from "../../components/ProtectedRoute";
import CodeEditorModal from "../../components/CodeEditorModal";
import SavedPosts from "../../components/SavedPosts";
import FeatureTour from "../../components/FeatureTour";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../lib/firebase";
import AIDraftAssistant from "../../components/AIDraftAssistant";
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

const S = {
  appContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "var(--bg-primary)",
  },
  // Desktop 3-col layout
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "240px 1fr 340px",
    gap: 24,
    maxWidth: 1440,
    width: "100%",
    margin: "0 auto",
    padding: "24px 24px 24px",
    flex: 1,
  },
  // Mobile single-col layout
  mainLayoutMobile: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    padding: "16px 16px 80px", // bottom padding for tab bar
    gap: 16,
    flex: 1,
  },
  leftSidebar: {
    position: "sticky",
    top: 88,
    height: "calc(100vh - 112px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  sidebarNavList: {
    listStyle: "none",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    margin: 0,
    padding: 0,
  },
  sidebarNavItemLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-md)",
    fontWeight: 500,
    textDecoration: "none",
    transition: "all var(--transition-fast)",
    border: "none",
    background: "transparent",
    width: "100%",
    textAlign: "left",
    fontSize: "inherit",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  sidebarNavItemLinkActive: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 16px",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-md)",
    fontWeight: 600,
    textDecoration: "none",
    backgroundColor: "var(--accent-primary-alpha)",
    border: "none",
    width: "100%",
    textAlign: "left",
    fontSize: "inherit",
    fontFamily: "inherit",
    cursor: "pointer",
  },
  sidebarFooterCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    padding: 16,
    borderRadius: "var(--radius-lg)",
    fontSize: "0.85rem",
  },
  sidebarFooterCardP: {
    color: "var(--text-muted)",
    marginBottom: 12,
    margin: "0 0 12px 0",
  },
  btnSidebarCta: {
    display: "block",
    textAlign: "center",
    padding: "8px 12px",
    backgroundColor: "var(--accent-primary-alpha)",
    color: "var(--accent-primary)",
    fontWeight: 600,
    borderRadius: "var(--radius-md)",
    textDecoration: "none",
  },
  feedColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
    minWidth: 0,
  },
  composerCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 14,
    boxShadow: "var(--shadow-sm)",
  },
  composerHeader: {
    display: "flex",
    gap: 12,
  },
  composerInputWrapper: { flex: 1 },
  composerTextarea: {
    width: "100%",
    minHeight: 72,
    background: "transparent",
    border: "none",
    resize: "vertical",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.95rem",
    fontFamily: "inherit",
  },
  composerTagsInput: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 10,
    borderTop: "1px solid rgba(255,255,255,0.05)",
  },
  tagBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    backgroundColor: "rgba(255,255,255,0.05)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.78rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  tagBadgeSelected: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 10px",
    backgroundColor: "var(--accent-primary-alpha)",
    border: "1px solid var(--accent-primary)",
    color: "var(--accent-primary)",
    borderRadius: "var(--radius-full)",
    fontSize: "0.78rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  composerActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTop: "1px solid var(--border-color)",
    gap: 8,
    flexWrap: "wrap",
  },
  composerTools: { display: "flex", gap: 6 },
  composerToolBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 32,
    height: 32,
    background: "transparent",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    cursor: "pointer",
  },
  aiHelperToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: "var(--text-muted)",
    userSelect: "none",
  },
  btnPost: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#000",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  btnPostDisabled: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 16px",
    backgroundColor: "var(--border-color)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "var(--text-muted)",
    fontWeight: 600,
    cursor: "not-allowed",
    fontSize: "0.9rem",
  },
  feedFiltersBar: {
    display: "flex",
    borderBottom: "1px solid var(--border-color)",
    paddingBottom: 2,
    gap: 4,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
    scrollbarWidth: "none",
  },
  filterTab: {
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "inherit",
  },
  filterTabActive: {
    padding: "8px 14px",
    border: "none",
    background: "transparent",
    color: "var(--accent-primary)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    whiteSpace: "nowrap",
    borderBottom: "2px solid var(--accent-primary)",
    fontFamily: "inherit",
  },
  discussionCard: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 16,
    boxShadow: "var(--shadow-sm)",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
  },
  authorInfo: { display: "flex", alignItems: "center", gap: 10 },
  authorMeta: { display: "flex", flexDirection: "column" },
  authorName: { color: "var(--text-primary)", fontWeight: 600, fontSize: "0.9rem" },
  authorTitle: { color: "var(--text-muted)", fontSize: "0.72rem" },
  postTimestamp: { color: "var(--text-muted)", fontSize: "0.75rem", textAlign: "right" },
  categoryTag: {
    display: "inline-flex",
    alignItems: "center",
    padding: "2px 8px",
    backgroundColor: "var(--bg-primary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-secondary)",
    borderRadius: "var(--radius-sm)",
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  postTitle: {
    fontSize: "1.05rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    lineHeight: 1.4,
    margin: 0,
  },
  postBody: { fontSize: "0.9rem", color: "var(--text-secondary)" },
  postTags: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 2 },
  postTag: { color: "var(--accent-primary)", fontSize: "0.82rem", fontWeight: 500 },
  postActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    borderTop: "1px solid rgba(255,255,255,0.05)",
    padding: "6px 2px",
    marginTop: 2,
    gap: 4,
    flexWrap: "wrap",
  },
  postActionsGroup: { display: "flex", gap: 6 },
  btnAction: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 500,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
  },
  btnActionActive: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "var(--accent-primary)",
    cursor: "pointer",
    fontSize: "0.82rem",
    fontWeight: 600,
    padding: "6px 8px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
  },
  btnActionDanger: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "transparent",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    fontSize: "0.78rem",
    fontWeight: 500,
    padding: "4px 6px",
    borderRadius: "var(--radius-sm)",
    fontFamily: "inherit",
  },
  commentItem: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "10px 12px",
    backgroundColor: "var(--bg-primary)",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-color)",
  },
  commentHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  commentAuthor: { fontWeight: 600, fontSize: "0.82rem", color: "var(--text-primary)" },
  commentMeta: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.72rem",
    color: "var(--text-muted)",
    flexWrap: "wrap",
  },
  commentBody: { fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 },
  commentEditTextarea: {
    width: "100%",
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-primary)",
    outline: "none",
    fontSize: "0.875rem",
    fontFamily: "inherit",
    padding: "6px 8px",
    resize: "vertical",
    minHeight: 60,
    boxSizing: "border-box",
  },
  commentEditActions: { display: "flex", gap: 6, marginTop: 4 },
  btnSm: {
    padding: "4px 12px",
    backgroundColor: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-sm)",
    color: "#000",
    fontWeight: 600,
    fontSize: "0.8rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  btnSmGhost: {
    padding: "4px 12px",
    backgroundColor: "transparent",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text-muted)",
    fontWeight: 500,
    fontSize: "0.8rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  rightSidebar: {
    position: "sticky",
    top: 88,
    height: "calc(100vh - 112px)",
    display: "flex",
    flexDirection: "column",
    gap: 20,
    overflowY: "auto",
    paddingRight: 4,
  },
  sidebarWidget: {
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  aiPromoWidget: {
    background: "radial-gradient(circle at top right, rgba(168,85,247,0.15), transparent 60%), var(--bg-secondary)",
    border: "1px solid rgba(168,85,247,0.3)",
    borderRadius: "var(--radius-lg)",
    padding: 20,
    boxShadow: "var(--shadow-sm)",
  },
  widgetTitle: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 0 16px 0",
  },
  widgetTitleAi: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "#c084fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    margin: "0 0 16px 0",
  },
  pulsePoint: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-ai)",
    animation: "pulse-glow 2s infinite",
  },
  aiPromoText: { fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0 0 16px 0" },
  btnAiCta: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    padding: 10,
    backgroundColor: "var(--accent-ai)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "#fff",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  trendingList: { display: "flex", flexDirection: "column", gap: 12 },
  trendingItem: { display: "flex", flexDirection: "column", gap: 2 },
  trendingLink: {
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.88rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    textDecoration: "none",
  },
  trendingStats: { fontSize: "0.72rem", color: "var(--text-muted)" },
  membersList: { display: "flex", flexDirection: "column", gap: 12 },
  memberItem: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  memberMeta: { display: "flex", alignItems: "center", gap: 10 },
  memberName: { fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" },
  memberRole: { fontSize: "0.7rem", color: "var(--text-muted)" },
  memberStatus: { display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "var(--text-muted)" },
  statusDotOnline: {
    width: 8,
    height: 8,
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--accent-success)",
    boxShadow: "0 0 6px var(--accent-success)",
  },

  // ── Profile popup ─────────────────────────────────────────────────────────
  profilePopupBackdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
  },

  // ── Mobile bottom tab bar ─────────────────────────────────────────────────
  bottomTabBar: {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    display: "flex",
    backgroundColor: "var(--bg-secondary)",
    borderTop: "1px solid var(--border-color)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    // Safe area for notched phones
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
  },
  tabBarItem: (active) => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px 4px 8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    gap: 4,
    color: active ? "var(--accent-primary)" : "var(--text-muted)",
    fontFamily: "inherit",
    transition: "color 0.15s",
    fontSize: "0.62rem",
    fontWeight: active ? 700 : 500,
  }),
  tabBarIcon: {
    fontSize: "1.3rem",
    lineHeight: 1,
  },
  tabBarBadge: {
    position: "absolute",
    top: 8,
    right: "calc(50% - 16px)",
    backgroundColor: "var(--accent-primary)",
    color: "#000",
    borderRadius: 9999,
    width: 16,
    height: 16,
    fontSize: "0.6rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  // Mobile sheet for right sidebar panels
  mobileSheet: (open) => ({
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 150,
    backgroundColor: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    borderRadius: "var(--radius-lg) var(--radius-lg) 0 0",
    padding: "20px 20px calc(20px + env(safe-area-inset-bottom, 0px))",
    maxHeight: "80vh",
    overflowY: "auto",
    transform: open ? "translateY(0)" : "translateY(110%)",
    transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
    boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
  }),
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "var(--border-color)",
    borderRadius: 2,
    margin: "0 auto 20px",
  },
  sheetBackdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    zIndex: 149,
  },
};

const FEATURE_TOUR_KEY = "devconnect_feature_tour_seen";

// ── Reusable avatar ────────────────────────────────────────────────────────────
function UserAvatar({ photoURL, displayName, size = 36, fontSize = "0.9rem", onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-full)",
        background: "linear-gradient(135deg, #0284c7, #38bdf8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#000",
        fontWeight: 700,
        fontSize,
        border: "2px solid var(--border-color)",
        flexShrink: 0,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
      }}
      title={onClick ? `View ${displayName || "user"}'s profile` : undefined}
    >
      {photoURL ? (
        <img src={photoURL} alt={displayName || "Avatar"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        displayName?.charAt(0)?.toUpperCase() || "U"
      )}
    </div>
  );
}

// ── Profile popup ──────────────────────────────────────────────────────────────
function ProfilePopup({ data, posts, onClose }) {
  if (!data) return null;
  const userPostCount = posts.filter((p) => p.uid === data.uid).length;
  const flippedLeft = data.flipped;

  return (
    <>
      <div style={S.profilePopupBackdrop} onClick={onClose} />
      <div style={{
        position: "fixed",
        top: data.y,
        left: data.x,
        zIndex: 999,
        width: 240,
        backgroundColor: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-lg)",
        padding: "16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        transform: "translateY(-50%)",
      }}>
        {!flippedLeft && <>
          <div style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderRight: "8px solid var(--border-color)" }} />
          <div style={{ position: "absolute", left: -6, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderRight: "7px solid var(--bg-secondary)" }} />
        </>}
        {flippedLeft && <>
          <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "8px solid transparent", borderBottom: "8px solid transparent", borderLeft: "8px solid var(--border-color)" }} />
          <div style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", width: 0, height: 0, borderTop: "7px solid transparent", borderBottom: "7px solid transparent", borderLeft: "7px solid var(--bg-secondary)" }} />
        </>}

        <UserAvatar photoURL={data.photoURL} displayName={data.displayName} size={60} fontSize="1.5rem" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "1rem", marginBottom: 4 }}>
            {data.displayName || "Anonymous User"}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", backgroundColor: "var(--accent-primary-alpha)", color: "var(--accent-primary)", borderRadius: "var(--radius-full)", fontSize: "0.7rem", fontWeight: 600 }}>
            Community Member
          </div>
        </div>
        <div style={{ display: "flex", width: "100%", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "8px 0", justifyContent: "space-around" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "var(--accent-primary)", fontWeight: 700, fontSize: "1.1rem" }}>{userPostCount}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Posts</div>
          </div>
          <div style={{ width: 1, backgroundColor: "var(--border-color)" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--accent-success)", boxShadow: "0 0 4px var(--accent-success)", display: "inline-block" }} />
              <span style={{ color: "var(--accent-success)", fontWeight: 700, fontSize: "0.8rem" }}>Online</span>
            </div>
            <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Status</div>
          </div>
        </div>
        <button onClick={onClose} style={{ width: "100%", padding: "6px 0", background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-secondary)", fontWeight: 500, fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
          Close
        </button>
      </div>
    </>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [posting, setPosting] = useState(false);
  const [showAiDraft, setShowAiDraft] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [openCommentsFor, setOpenCommentsFor] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [activeMembers, setActiveMembers] = useState([]);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editingCommentDraft, setEditingCommentDraft] = useState("");
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showFeatureTour, setShowFeatureTour] = useState(false);
  const [usersCache, setUsersCache] = useState({});
  const [profilePopup, setProfilePopup] = useState(null);

  // Mobile state
  const [isMobile, setIsMobile] = useState(false);
  // Which mobile tab is active: "feed" | "trending" | "members" | "saved"
  const [mobileTab, setMobileTab] = useState("feed");
  // Which sheet is open: null | "trending" | "members"
  const [mobileSheet, setMobileSheet] = useState(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const availableTags = [
    "#react", "#nextjs", "#javascript", "#typescript",
    "#frontend", "#backend", "#nodejs", "#python",
    "#rust", "#go", "#ai-agents", "#machine-learning",
    "#css", "#devops", "#docker", "#database",
  ];

  useEffect(() => {
    try {
      const seen = localStorage.getItem(FEATURE_TOUR_KEY);
      if (!seen) setShowFeatureTour(true);
    } catch { }
  }, []);

  const closeFeatureTour = () => {
    setShowFeatureTour(false);
    try { localStorage.setItem(FEATURE_TOUR_KEY, "true"); } catch { }
  };

  useEffect(() => {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => { console.error(err); setError("Failed to load posts."); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const uids = new Set();
    posts.forEach((p) => {
      if (p.uid) uids.add(p.uid);
      (p.comments || []).forEach((c) => { if (c.uid) uids.add(c.uid); });
    });
    const unsubs = [];
    uids.forEach((uid) => {
      const unsub = onSnapshot(doc(db, "users", uid), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setUsersCache((prev) => ({ ...prev, [uid]: { photoURL: data.photoURL || "", displayName: data.displayName || "" } }));
        }
      });
      unsubs.push(unsub);
    });
    return () => unsubs.forEach((u) => u());
  }, [posts]);

  useEffect(() => {
    if (!user) { setSavedPostIds([]); return; }
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      setSavedPostIds(snap.data()?.savedPosts || []);
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const membersQuery = query(collection(db, "users"), where("isOnline", "==", true));
    const unsubscribe = onSnapshot(membersQuery, (snapshot) => {
      setActiveMembers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    }, (err) => console.error(err));
    return () => unsubscribe();
  }, []);

  const getLiveName = useCallback((uid, fallback) => usersCache[uid]?.displayName || fallback || "Anonymous User", [usersCache]);
  const getLivePhoto = useCallback((uid, fallback) => usersCache[uid]?.photoURL ?? fallback ?? "", [usersCache]);

  const openProfile = useCallback((e, uid, storedName, storedPhoto) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const popupWidth = 240;
    const popupHeight = 220;
    const margin = 12;
    let x = rect.right + margin;
    let y = rect.top + rect.height / 2;
    if (x + popupWidth > window.innerWidth - 16) x = rect.left - popupWidth - margin;
    const halfPopup = popupHeight / 2;
    if (y - halfPopup < 8) y = halfPopup + 8;
    if (y + halfPopup > window.innerHeight - 8) y = window.innerHeight - halfPopup - 8;
    setProfilePopup({
      uid,
      displayName: usersCache[uid]?.displayName || storedName || "Anonymous User",
      photoURL: usersCache[uid]?.photoURL ?? storedPhoto ?? "",
      x, y,
      flipped: rect.right + margin + popupWidth > window.innerWidth - 16,
    });
  }, [usersCache]);

  const trendingTags = useMemo(() => {
    const counts = {};
    const newToday = {};
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    posts.forEach((post) => {
      const postDate = post.timestamp?.toDate ? post.timestamp.toDate() : null;
      const isToday = postDate && postDate >= startOfToday;
      (post.tags || []).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
        if (isToday) newToday[tag] = (newToday[tag] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([tag, count]) => ({
      tag,
      posts: `${count} post${count === 1 ? "" : "s"}`,
      new: newToday[tag] ? `+${newToday[tag]} new today` : "No new posts today",
    }));
  }, [posts]);

  const addCustomTag = () => {
    let tag = customTag.trim();
    if (!tag) return;
    if (!tag.startsWith("#")) tag = "#" + tag;
    tag = tag.toLowerCase().replace(/\s+/g, "-");
    if (!selectedTags.includes(tag)) setSelectedTags((prev) => [...prev, tag]);
    setCustomTag("");
  };

  const handleCreatePost = async () => {
    if (!content.trim() || !user) return;
    try {
      setPosting(true);
      setError("");
      await addDoc(collection(db, "posts"), {
        uid: user.uid,
        displayName: user.displayName || user.email || "Anonymous User",
        photoURL: user.photoURL || "",
        content: content.trim(),
        tags: selectedTags,
        timestamp: serverTimestamp(),
        likes: 0,
        likedBy: [],
        comments: [],
      });
      setContent("");
      setSelectedTags([]);
    } catch (err) {
      console.error(err);
      setError("Failed to create post. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  const handleInsertCode = (codeBlock) => {
    setContent((prev) => prev + (prev ? "\n\n" : "") + codeBlock);
    setShowCodeEditor(false);
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const handleToggleLike = async (post) => {
    if (!user) return;
    const liked = (post.likedBy || []).includes(user.uid);
    try {
      await updateDoc(doc(db, "posts", post.id), {
        likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes: (post.likedBy || []).length + (liked ? -1 : 1),
      });
    } catch (err) { console.error(err); setError("Failed to update like."); }
  };

  const handleToggleSave = async (postId) => {
    if (!user) return;
    const isSaved = savedPostIds.includes(postId);
    try {
      await setDoc(doc(db, "users", user.uid), { savedPosts: isSaved ? arrayRemove(postId) : arrayUnion(postId) }, { merge: true });
    } catch (err) { console.error(err); setError("Failed to update saved posts."); }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "posts", postId));
    } catch (err) { console.error(err); setError("Failed to delete post."); }
  };

  const startEdit = (post) => { setEditingId(post.id); setEditContent(post.content); };
  const cancelEdit = () => { setEditingId(null); setEditContent(""); };

  const handleSaveEdit = async (postId) => {
    if (!editContent.trim()) return;
    try {
      await updateDoc(doc(db, "posts", postId), { content: editContent.trim(), edited: true });
      setEditingId(null);
      setEditContent("");
    } catch (err) { console.error(err); setError("Failed to update post."); }
  };

  const toggleComments = (postId) => {
    setOpenCommentsFor((prev) => (prev === postId ? null : postId));
    setCommentDraft("");
    setEditingComment(null);
  };

  const handleAddComment = async (post) => {
    if (!commentDraft.trim() || !user) return;
    const newComment = {
      uid: user.uid,
      displayName: user.displayName || user.email || "Anonymous User",
      photoURL: user.photoURL || "",
      content: commentDraft.trim(),
      createdAt: Date.now(),
      edited: false,
    };
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: arrayUnion(newComment) });
      setCommentDraft("");
    } catch (err) { console.error(err); setError("Failed to add comment."); }
  };

  const startEditComment = (comment) => {
    setEditingComment({ postId: comment._postId, createdAt: comment.createdAt });
    setEditingCommentDraft(comment.content);
  };
  const cancelEditComment = () => { setEditingComment(null); setEditingCommentDraft(""); };

  const handleSaveCommentEdit = async (post, oldComment) => {
    if (!editingCommentDraft.trim()) return;
    const updatedComments = (post.comments || []).map((c) =>
      c.createdAt === oldComment.createdAt && c.uid === oldComment.uid
        ? { ...c, content: editingCommentDraft.trim(), edited: true }
        : c
    );
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
      setEditingComment(null);
      setEditingCommentDraft("");
    } catch (err) { console.error(err); setError("Failed to edit comment."); }
  };

  const handleDeleteComment = async (post, comment) => {
    if (!window.confirm("Delete this comment?")) return;
    const updatedComments = (post.comments || []).filter((c) => !(c.createdAt === comment.createdAt && c.uid === comment.uid));
    try {
      await updateDoc(doc(db, "posts", post.id), { comments: updatedComments });
    } catch (err) { console.error(err); setError("Failed to delete comment."); }
  };

  // ── Shared feed JSX ────────────────────────────────────────────────────────
  const feedJSX = (
    <section style={S.feedColumn}>
      {/* Composer */}
      <div id="composer-card" style={S.composerCard}>
        <div style={S.composerHeader}>
          <UserAvatar
            photoURL={getLivePhoto(user?.uid, user?.photoURL)}
            displayName={getLiveName(user?.uid, user?.displayName)}
            size={36}
          />
          <div style={S.composerInputWrapper}>
            <textarea
              style={S.composerTextarea}
              placeholder="Share a coding question, project idea, or debugging help..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <div id="composer-tags" style={S.composerTagsInput}>
          {availableTags.map((tag) => (
            <span
              key={tag}
              onClick={() => toggleTag(tag)}
              style={{ ...(selectedTags.includes(tag) ? S.tagBadgeSelected : S.tagBadge), userSelect: "none" }}
            >
              {tag}
            </span>
          ))}
          {selectedTags.filter((tag) => !availableTags.includes(tag)).map((tag) => (
            <span key={tag} onClick={() => toggleTag(tag)} style={{ ...S.tagBadgeSelected, userSelect: "none" }}>
              {tag} ✕
            </span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <input
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomTag(); } }}
              placeholder="Add tag..."
              style={{ background: "transparent", border: "1px solid var(--border-color)", borderRadius: "var(--radius-full)", color: "var(--text-primary)", outline: "none", fontSize: "0.78rem", padding: "4px 10px", width: 80 }}
            />
            <button onClick={addCustomTag} type="button" style={{ ...S.tagBadge, cursor: "pointer", border: "1px solid var(--accent-primary)", color: "var(--accent-primary)" }}>
              + Add
            </button>
          </div>
        </div>

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <div style={S.composerActions}>
          <div style={S.composerTools}>
            <button style={S.composerToolBtn} title="Add Image">🖼️</button>
            <button
              id="open-code-editor-btn"
              style={S.composerToolBtn}
              title="Insert Code Block"
              onClick={() => setShowCodeEditor(true)}
            >
              {"</>"}
            </button>
          </div>

          <label id="ai-draft-toggle" style={S.aiHelperToggle} onClick={() => setShowAiDraft((p) => !p)}>
            <span style={{ position: "relative", display: "inline-block", width: 36, height: 20, backgroundColor: showAiDraft ? "var(--accent-ai)" : "var(--border-color)", borderRadius: "var(--radius-full)", transition: "background-color 0.2s" }}>
              <span style={{ position: "absolute", top: 2, left: showAiDraft ? 18 : 2, width: 16, height: 16, backgroundColor: "#fff", borderRadius: "50%", transition: "left 0.2s" }} />
            </span>
            {!isMobile && <span>Draft with AI</span>}
            <span style={S.pulsePoint} />
          </label>

          <button
            style={posting || !content.trim() ? S.btnPostDisabled : S.btnPost}
            onClick={handleCreatePost}
            disabled={posting || !content.trim()}
          >
            {posting ? "Posting..." : "Post"}
          </button>
        </div>

        {showAiDraft && (
          <AIDraftAssistant
            onInsert={(draft) => {
              setContent((prev) => (prev ? prev + "\n\n" + draft : draft));
              setShowAiDraft(false);
            }}
          />
        )}
      </div>

      {/* Feed filters */}
      <div style={S.feedFiltersBar}>
        {["Latest Feed", "Trending", "Questions", "Collaborations"].map((tab, i) => (
          <button key={tab} style={i === 0 ? S.filterTabActive : S.filterTab}>{tab}</button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>No posts yet. Create the first post!</p>
        ) : (
          posts.map((post, postIndex) => {
            const isSaved = savedPostIds.includes(post.id);
            const postPhoto = getLivePhoto(post.uid, post.photoURL);
            const postName = getLiveName(post.uid, post.displayName);

            return (
              <article style={S.discussionCard} key={post.id}>
                <div style={S.cardHeader}>
                  <div style={S.authorInfo}>
                    <UserAvatar
                      photoURL={postPhoto}
                      displayName={postName}
                      size={isMobile ? 34 : 40}
                      fontSize={isMobile ? "0.85rem" : "1rem"}
                      onClick={(e) => openProfile(e, post.uid, post.displayName, post.photoURL)}
                    />
                    <div style={S.authorMeta}>
                      <span style={{ ...S.authorName, cursor: "pointer" }} onClick={(e) => openProfile(e, post.uid, post.displayName, post.photoURL)}>
                        {postName}
                      </span>
                      <span style={S.authorTitle}>Community Member</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <span style={S.categoryTag}>Discussion</span>
                    <span style={S.postTimestamp}>
                      {post.timestamp?.toDate ? post.timestamp.toDate().toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Just now"}
                      {post.edited ? " (edited)" : ""}
                    </span>
                  </div>
                </div>

                {editingId === post.id ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <textarea style={{ ...S.composerTextarea, border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 8, minHeight: 80 }} value={editContent} onChange={(e) => setEditContent(e.target.value)} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={S.btnPost} onClick={() => handleSaveEdit(post.id)}>Save</button>
                      <button style={S.btnAction} onClick={cancelEdit}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={S.postBody}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const isInline = !className;
                          return isInline ? (
                            <code style={{ background: "var(--bg-primary)", padding: "2px 6px", borderRadius: 4, fontSize: "0.82em" }} {...props}>{children}</code>
                          ) : (
                            <pre style={{ background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: 12, overflowX: "auto", fontSize: "0.82em" }}>
                              <code className={className} {...props}>{children}</code>
                            </pre>
                          );
                        },
                        p({ children }) { return <p style={{ margin: "0 0 10px 0", lineHeight: 1.6 }}>{children}</p>; },
                        h1({ children }) { return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>; },
                        h2({ children }) { return <h3 style={{ margin: "12px 0 6px" }}>{children}</h3>; },
                        h3({ children }) { return <h4 style={{ margin: "10px 0 6px" }}>{children}</h4>; },
                        ul({ children }) { return <ul style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ul>; },
                        ol({ children }) { return <ol style={{ paddingLeft: 20, margin: "0 0 10px 0" }}>{children}</ol>; },
                        li({ children }) { return <li style={{ marginBottom: 4 }}>{children}</li>; },
                      }}
                    >
                      {post.content}
                    </ReactMarkdown>
                  </div>
                )}

                <div style={S.postTags}>
                  {post.tags && post.tags.length > 0
                    ? post.tags.map((tag) => <a href="#" style={S.postTag} key={tag}>{tag}</a>)
                    : <a href="#" style={S.postTag}>#community</a>
                  }
                </div>

                <div id={postIndex === 0 ? "post-actions-0" : undefined} style={S.postActions}>
                  <div style={S.postActionsGroup}>
                    <button style={S.btnAction} onClick={() => handleToggleLike(post)}>
                      {(post.likedBy || []).includes(user?.uid) ? "❤️" : "♡"} {post.likes || 0}
                    </button>
                    <button style={S.btnAction} onClick={() => toggleComments(post.id)}>
                      💬 {post.comments?.length || 0}
                    </button>
                  </div>
                  <button style={savedPostIds.includes(post.id) ? S.btnActionActive : S.btnAction} onClick={() => handleToggleSave(post.id)}>
                    {savedPostIds.includes(post.id) ? "🔖" : "🔖"}
                  </button>
                  {user?.uid === post.uid && (
                    <div style={{ display: "flex", gap: 2 }}>
                      <button style={S.btnAction} onClick={() => startEdit(post)}>✏️</button>
                      <button style={S.btnAction} onClick={() => handleDeletePost(post.id)}>🗑️</button>
                    </div>
                  )}
                </div>

                {openCommentsFor === post.id && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: "1px solid var(--border-color)", paddingTop: 12 }}>
                    {(post.comments || []).length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", margin: 0 }}>No comments yet. Be the first!</p>
                    ) : (
                      (post.comments || []).slice().sort((a, b) => a.createdAt - b.createdAt).map((c) => {
                        const isEditingThis = editingComment?.postId === post.id && editingComment?.createdAt === c.createdAt;
                        const isOwner = user?.uid === c.uid;
                        const commentPhoto = getLivePhoto(c.uid, c.photoURL);
                        const commentName = getLiveName(c.uid, c.displayName);

                        return (
                          <div key={`${c.uid}-${c.createdAt}`} style={S.commentItem}>
                            <div style={S.commentHeader}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <UserAvatar photoURL={commentPhoto} displayName={commentName} size={24} fontSize="0.7rem" onClick={(e) => openProfile(e, c.uid, c.displayName, c.photoURL)} />
                                <span style={{ ...S.commentAuthor, cursor: "pointer" }} onClick={(e) => openProfile(e, c.uid, c.displayName, c.photoURL)}>
                                  {commentName}
                                </span>
                              </div>
                              <div style={S.commentMeta}>
                                <span>{new Date(c.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                                {c.edited && <span style={{ fontStyle: "italic" }}>(edited)</span>}
                                {isOwner && !isEditingThis && (
                                  <>
                                    <button style={S.btnActionDanger} onClick={() => startEditComment({ ...c, _postId: post.id })}>✏️</button>
                                    <button style={S.btnActionDanger} onClick={() => handleDeleteComment(post, c)}>🗑️</button>
                                  </>
                                )}
                              </div>
                            </div>
                            {isEditingThis ? (
                              <>
                                <textarea style={S.commentEditTextarea} value={editingCommentDraft} onChange={(e) => setEditingCommentDraft(e.target.value)} autoFocus />
                                <div style={S.commentEditActions}>
                                  <button style={S.btnSm} onClick={() => handleSaveCommentEdit(post, c)}>Save</button>
                                  <button style={S.btnSmGhost} onClick={cancelEditComment}>Cancel</button>
                                </div>
                              </>
                            ) : (
                              <p style={{ ...S.commentBody, margin: 0 }}>{c.content}</p>
                            )}
                          </div>
                        );
                      })
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        style={{ flex: 1, background: "var(--bg-primary)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", fontSize: "0.875rem", fontFamily: "inherit", padding: "8px 12px" }}
                        placeholder="Write a comment…"
                        value={commentDraft}
                        onChange={(e) => setCommentDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleAddComment(post); } }}
                      />
                      <button style={commentDraft.trim() ? S.btnPost : S.btnPostDisabled} disabled={!commentDraft.trim()} onClick={() => handleAddComment(post)}>
                        Post
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </section>
  );

  // ── Trending widget JSX (reused on desktop sidebar + mobile sheet) ─────────
  const trendingWidgetJSX = (
    <div style={isMobile ? {} : S.sidebarWidget}>
      {!isMobile && <h3 style={S.widgetTitle}>Trending Tags</h3>}
      <div style={S.trendingList}>
        {trendingTags.length === 0 ? (
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>No tags yet — be the first to tag a post!</p>
        ) : (
          trendingTags.map(({ tag, posts: p, new: newPosts }) => (
            <div key={tag} style={S.trendingItem}>
              <a href="#" style={S.trendingLink}><span>{tag}</span><span>{p}</span></a>
              <span style={S.trendingStats}>{newPosts}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // ── Members widget JSX ─────────────────────────────────────────────────────
  const membersWidgetJSX = (
    <div style={isMobile ? {} : S.sidebarWidget}>
      {!isMobile && <h3 style={S.widgetTitle}>Active Members</h3>}
      <div style={S.membersList}>
        {activeMembers.map((member) => {
          const name = member.displayName || member.email || "Anonymous";
          const initials = name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
          return (
            <div key={member.id} style={S.memberItem}>
              <div style={S.memberMeta}>
                <div style={{ width: 28, height: 28, fontSize: "0.75rem", background: "linear-gradient(135deg, #10b981, #059669)", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", color: "#000", fontWeight: 700 }}>
                  {initials}
                </div>
                <div>
                  <div style={S.memberName}>{name}</div>
                  <div style={S.memberRole}>{member.email}</div>
                </div>
              </div>
              <div style={S.memberStatus}>
                <span style={S.statusDotOnline} /><span>Online</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <main style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh" }}>
        <div style={S.appContainer}>
          <Navbar variant="dashboard" />

          {/* ── Desktop Layout ─────────────────────────────────────── */}
          {!isMobile && (
            <div style={S.mainLayout}>
              {/* Left Sidebar */}
              <aside style={S.leftSidebar}>
                <ul style={S.sidebarNavList}>
                  {[
                    { icon: "▦", label: "Feed", active: true },
                    { icon: "📈", label: "Trending" },
                    { icon: "❔", label: "Questions" },
                    { icon: "👥", label: "Collaborations" },
                  ].map(({ icon, label, active }) => (
                    <li key={label}>
                      <a href="#" style={active ? S.sidebarNavItemLinkActive : S.sidebarNavItemLink}>
                        <span>{icon}</span><span>{label}</span>
                      </a>
                    </li>
                  ))}
                  <li>
                    <button id="saved-posts-nav" style={S.sidebarNavItemLink} onClick={() => setShowSavedPosts(true)}>
                      <span>🔖</span>
                      <span>Saved Posts</span>
                      {savedPostIds.length > 0 && (
                        <span style={{ marginLeft: "auto", fontSize: "0.7rem", color: "var(--text-muted)" }}>{savedPostIds.length}</span>
                      )}
                    </button>
                  </li>
                  <li>
                    <button style={S.sidebarNavItemLink} onClick={() => setShowFeatureTour(true)}>
                      <span>ℹ️</span><span>Features Tour</span>
                    </button>
                  </li>
                </ul>
                <div style={S.sidebarFooterCard}>
                  <p style={S.sidebarFooterCardP}>Get instant AI reviews of your code repositories directly from GitHub.</p>
                  <a href="/#features" style={S.btnSidebarCta}>Activate AI Copilot</a>
                </div>
              </aside>

              {/* Feed */}
              {feedJSX}

              {/* Right Sidebar */}
              <aside style={S.rightSidebar}>
                <div id="ai-copilot-widget" style={S.aiPromoWidget}>
                  <h3 style={S.widgetTitleAi}><span>Code Review Copilot</span><span style={S.pulsePoint} /></h3>
                  <p style={S.aiPromoText}>Let AI review your code changes, suggest performance improvements, and write documentation snippets.</p>
                  <button style={S.btnAiCta}>Ask for AI Code Review</button>
                </div>
                <div id="trending-tags-widget" style={S.sidebarWidget}>
                  <h3 style={S.widgetTitle}>Trending Tags</h3>
                  {trendingWidgetJSX}
                </div>
                <div style={S.sidebarWidget}>
                  <h3 style={S.widgetTitle}>Active Members</h3>
                  {membersWidgetJSX}
                </div>
              </aside>
            </div>
          )}

          {/* ── Mobile Layout ──────────────────────────────────────── */}
          {isMobile && (
            <div style={S.mainLayoutMobile}>
              {/* AI Copilot banner — compact on mobile */}
              {mobileTab === "feed" && (
                <div style={{ ...S.aiPromoWidget, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ ...S.widgetTitleAi, margin: 0, fontSize: "0.85rem" }}>
                        <span>Code Review Copilot</span>
                        <span style={{ ...S.pulsePoint, marginLeft: 8 }} />
                      </div>
                      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 2 }}>AI-powered code review</div>
                    </div>
                    <button style={{ ...S.btnAiCta, width: "auto", padding: "8px 14px", fontSize: "0.8rem" }}>Try it</button>
                  </div>
                </div>
              )}

              {/* Trending tab content */}
              {mobileTab === "trending" && (
                <div style={S.sidebarWidget}>
                  <h3 style={S.widgetTitle}>Trending Tags</h3>
                  {trendingWidgetJSX}
                </div>
              )}

              {/* Members tab content */}
              {mobileTab === "members" && (
                <div style={S.sidebarWidget}>
                  <h3 style={S.widgetTitle}>Active Members</h3>
                  {membersWidgetJSX}
                </div>
              )}

              {/* Saved tab content */}
              {mobileTab === "saved" && (
                <div style={S.sidebarWidget}>
                  <h3 style={S.widgetTitle}>
                    Saved Posts
                    {savedPostIds.length > 0 && (
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 400 }}>{savedPostIds.length} saved</span>
                    )}
                  </h3>
                  {savedPostIds.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>No saved posts yet. Tap 🔖 on any post to save it.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {posts.filter((p) => savedPostIds.includes(p.id)).map((post) => (
                        <div key={post.id} style={{ padding: "10px 12px", backgroundColor: "var(--bg-primary)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
                          <div style={{ fontSize: "0.88rem", color: "var(--text-primary)", fontWeight: 600, marginBottom: 4 }}>
                            {getLiveName(post.uid, post.displayName)}
                          </div>
                          <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                            {post.content}
                          </div>
                          <button style={{ ...S.btnActionActive, padding: "4px 0", marginTop: 8, fontSize: "0.78rem" }} onClick={() => handleToggleSave(post.id)}>
                            🔖 Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Feed always visible */}
              {mobileTab === "feed" && feedJSX}
            </div>
          )}
        </div>

        {/* ── Mobile Bottom Tab Bar ─────────────────────────────────── */}
        {isMobile && (
          <nav style={S.bottomTabBar}>
            {[
              { id: "feed", icon: "▦", label: "Feed" },
              { id: "trending", icon: "📈", label: "Trending" },
              { id: "members", icon: "👥", label: "Members" },
              {
                id: "saved",
                icon: "🔖",
                label: "Saved",
                badge: savedPostIds.length > 0 ? savedPostIds.length : null,
              },
            ].map(({ id, icon, label, badge }) => (
              <button
                key={id}
                style={S.tabBarItem(mobileTab === id)}
                onClick={() => {
                  setMobileTab(id);
                  if (id === "saved") setShowSavedPosts(false);
                }}
              >
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span style={S.tabBarIcon}>{icon}</span>
                  {badge && (
                    <span style={S.tabBarBadge}>{badge > 9 ? "9+" : badge}</span>
                  )}
                </span>
                <span>{label}</span>
              </button>
            ))}
            <button
              style={S.tabBarItem(false)}
              onClick={() => setShowFeatureTour(true)}
            >
              <span style={S.tabBarIcon}>ℹ️</span>
              <span>Tour</span>
            </button>
          </nav>
        )}
      </main>

      {/* ── Modals & overlays ──────────────────────────────────────── */}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={() => setShowCodeEditor(false)}
        onInsert={handleInsertCode}
      />

      {showSavedPosts && !isMobile && (
        <SavedPosts
          onClose={() => setShowSavedPosts(false)}
          onUnsave={(postId) => handleToggleSave(postId)}
        />
      )}

      {showFeatureTour && <FeatureTour onClose={closeFeatureTour} />}

      <ProfilePopup
        data={profilePopup}
        posts={posts}
        onClose={() => setProfilePopup(null)}
      />
    </ProtectedRoute>
  );
}