import type { Metadata } from "next";
import "./styles.css";
import "./prototype.css";
import "./footer.css";

export const metadata: Metadata = {
  title: "AIR — Artificial Intelligence Reactor",
  description: "Persistent AI simulation experiments with agents, variables and observable timelines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <footer className="site-footer">
          Desenvolvido por{" "}
          <a href="https://zoqvera.com" target="_blank" rel="noopener noreferrer">
            Zoqvera
          </a>
          .
        </footer>
      </body>
    </html>
  );
}
