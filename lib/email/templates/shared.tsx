import type { ReactNode } from "react";

export function EmailLayout({
  title,
  preheader,
  children,
}: {
  title: string;
  preheader?: string;
  children: ReactNode;
}) {
  return (
    <html>
      <body
        style={{
          margin: 0,
          backgroundColor: "#f8fafc",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#0f172a",
        }}
      >
        <div
          style={{
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          {preheader ?? title}
        </div>
        <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style={{ backgroundColor: "#f8fafc", padding: "32px 16px" }}>
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="100%"
                  cellPadding="0"
                  cellSpacing="0"
                  role="presentation"
                  style={{
                    maxWidth: "640px",
                    width: "100%",
                    backgroundColor: "#ffffff",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <tbody>
                    <tr>
                      <td
                        style={{
                          background:
                            "linear-gradient(135deg, #0f766e 0%, #0891b2 45%, #14b8a6 100%)",
                          padding: "28px 32px",
                          color: "#ffffff",
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "12px", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 700, opacity: 0.8 }}>
                          iThoddoo Maldives
                        </p>
                        <h1 style={{ margin: "10px 0 0", fontSize: "28px", lineHeight: 1.2 }}>
                          {title}
                        </h1>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "32px" }}>{children}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function EmailSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginTop: title ? 24 : 0 }}>
      {title ? (
        <p style={{ margin: "0 0 10px", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase", color: "#0f766e", fontWeight: 700 }}>
          {title}
        </p>
      ) : null}
      <div style={{ fontSize: "15px", lineHeight: 1.7, color: "#334155" }}>{children}</div>
    </div>
  );
}

export function EmailButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-block",
        marginTop: "24px",
        borderRadius: "9999px",
        backgroundColor: "#0f766e",
        color: "#ffffff",
        textDecoration: "none",
        padding: "14px 22px",
        fontWeight: 700,
      }}
    >
      {children}
    </a>
  );
}

export function EmailFooter({ children }: { children: ReactNode }) {
  return (
    <p style={{ margin: "24px 0 0", fontSize: "13px", lineHeight: 1.6, color: "#64748b" }}>{children}</p>
  );
}
