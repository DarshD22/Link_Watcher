"use client";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      background: "var(--bg)",
      flexDirection: "column",
      gap: 24,
      textAlign: "center",
      padding: "24px"
    }}>
      <style>{`
        :root {
          --bg: #0a0a0a;
          --text: #e8e8e8;
          --accent: #c8ff00;
          --muted: #888;
        }
        
        body {
          background: var(--bg);
          color: var(--text);
          font-family: "DM Mono", monospace;
        }
      `}</style>
      
      <div>
        <h1 style={{ 
          fontFamily: "Syne, sans-serif", 
          fontWeight: 800, 
          fontSize: 48,
          letterSpacing: "-0.03em",
          marginBottom: 12,
          color: "var(--accent)"
        }}>
          LinkWatcher
        </h1>
        <p style={{ 
          fontSize: 14, 
          color: "var(--muted)",
          marginBottom: 32
        }}>
          Monitor and track website changes
        </p>
      </div>

      <div style={{ 
        display: "flex", 
        gap: 16,
        flexWrap: "wrap",
        justifyContent: "center"
      }}>
        <Link href="/dashboard" style={{
          background: "var(--accent)",
          color: "#000",
          padding: "12px 24px",
          borderRadius: 4,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.08em",
          cursor: "pointer",
          border: "none",
          transition: "opacity 0.15s ease"
        }}>
          Dashboard
        </Link>
        <Link href="/home" style={{
          background: "transparent",
          color: "var(--text)",
          padding: "12px 24px",
          borderRadius: 4,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.08em",
          cursor: "pointer",
          border: "1px solid var(--muted)",
          transition: "all 0.15s ease"
        }}>
          Learn More
        </Link>
        <Link href="/status" style={{
          background: "transparent",
          color: "var(--text)",
          padding: "12px 24px",
          borderRadius: 4,
          textDecoration: "none",
          fontWeight: 700,
          fontSize: 12,
          letterSpacing: "0.08em",
          cursor: "pointer",
          border: "1px solid var(--muted)",
          transition: "all 0.15s ease"
        }}>
          Status
        </Link>
      </div>

      <div style={{ 
        marginTop: 48,
        padding: "24px",
        background: "rgba(200,255,0,0.04)",
        border: "1px solid rgba(200,255,0,0.2)",
        borderRadius: 4,
        maxWidth: 400,
        fontSize: 12,
        color: "var(--muted)"
      }}>
        <p>
          LinkWatcher helps you track changes across your monitored websites. 
          Use the dashboard to manage your links, view statistics, and track modifications.
        </p>
      </div>
    </div>
  );
}
