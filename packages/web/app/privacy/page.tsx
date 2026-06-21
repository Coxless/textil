import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — textil",
  description: "textil processes everything in your browser. No data is collected or stored.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono mb-8 transition-colors"
            style={{ color: "var(--fg-4)" }}
          >
            ← back to textil
          </Link>
          <h1
            className="text-2xl font-bold font-mono mb-2"
            style={{
              background: "linear-gradient(135deg, #a78bfa 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm" style={{ color: "var(--fg-4)" }}>
            Effective date: June 2025
          </p>
        </div>

        <div
          className="flex flex-col gap-8 text-sm leading-relaxed"
          style={{ color: "var(--fg-2)" }}
        >
          {/* Core principle */}
          <section
            className="rounded-xl p-5"
            style={{ background: "var(--surf)", border: "1px solid var(--bd)" }}
          >
            <h2 className="font-semibold mb-3" style={{ color: "var(--fg)" }}>
              No data collection
            </h2>
            <p>
              textil processes everything locally in your browser. Your text, images, and generated
              ASCII art are never sent to any server, stored in a database, or shared with third
              parties. When you close the tab, the data is gone.
            </p>
          </section>

          {/* What runs where */}
          <section>
            <h2 className="font-semibold mb-3" style={{ color: "var(--fg)" }}>
              How it works
            </h2>
            <ul className="flex flex-col gap-2" style={{ color: "var(--fg-3)" }}>
              <li className="flex gap-2">
                <span style={{ color: "var(--fg-4)" }}>—</span>
                All font rendering, image processing, and ASCII generation runs entirely on-device
                via WebAssembly and the Canvas API.
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--fg-4)" }}>—</span>
                No analytics, tracking scripts, cookies, or fingerprinting.
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--fg-4)" }}>—</span>
                No account creation or login required.
              </li>
              <li className="flex gap-2">
                <span style={{ color: "var(--fg-4)" }}>—</span>
                Theme preference is saved only in{" "}
                <code
                  className="px-1 py-0.5 rounded text-xs"
                  style={{ background: "var(--surf-2)", color: "var(--fg-3)" }}
                >
                  localStorage
                </code>{" "}
                on your device and never transmitted.
              </li>
            </ul>
          </section>

          {/* Open source */}
          <section>
            <h2 className="font-semibold mb-3" style={{ color: "var(--fg)" }}>
              Open source
            </h2>
            <p style={{ color: "var(--fg-3)" }}>
              The full source code is publicly available. You can verify these claims and audit
              exactly how the app works.
            </p>
            <a
              href="https://github.com/Coxless/textil"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              style={{
                background: "var(--surf)",
                border: "1px solid var(--bd-2)",
                color: "var(--fg-3)",
              }}
            >
              <GitHubIcon />
              github.com/Coxless/textil
            </a>
          </section>

          {/* Contact */}
          <section>
            <h2 className="font-semibold mb-3" style={{ color: "var(--fg)" }}>
              Questions
            </h2>
            <p style={{ color: "var(--fg-3)" }}>
              Open an issue on the{" "}
              <a
                href="https://github.com/Coxless/textil/issues"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "var(--accent)" }}
              >
                GitHub repository
              </a>{" "}
              if you have any questions about privacy.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}
