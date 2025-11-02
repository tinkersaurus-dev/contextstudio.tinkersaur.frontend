"use client";

import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary for Theme Providers
 *
 * Catches errors in theme initialization and rendering to prevent
 * the entire app from crashing due to theme issues.
 *
 * Falls back to a minimal unstyled layout if theme providers fail.
 */
export class ThemeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Theme Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default minimal fallback
      return (
        <div
          style={{
            padding: "20px",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "#fff",
            color: "#000",
            minHeight: "100vh",
          }}
        >
          <div
            style={{
              maxWidth: "600px",
              margin: "0 auto",
              paddingTop: "100px",
            }}
          >
            <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
              Theme Loading Error
            </h1>
            <p style={{ marginBottom: "16px", color: "#666" }}>
              There was a problem loading the application theme. The app will
              continue to work, but styling may not be applied correctly.
            </p>
            <details style={{ marginTop: "20px" }}>
              <summary
                style={{
                  cursor: "pointer",
                  color: "#0066cc",
                  marginBottom: "8px",
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  padding: "12px",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {this.state.error?.message}
                {"\n\n"}
                {this.state.error?.stack}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: "20px",
                padding: "10px 20px",
                backgroundColor: "#0066cc",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
