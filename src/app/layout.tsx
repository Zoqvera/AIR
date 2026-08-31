import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "AIR — Artificial Intelligence Reactor",
  description: "Persistent AI simulation experiments with agents, variables and observable timelines.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
