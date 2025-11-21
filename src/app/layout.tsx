import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Amorinha - Sua Assistente Médica Pessoal 💙",
  description: "Sistema inteligente para estudantes de medicina com IA, organização de anotações e gestão de plantões.",
  keywords: ["medicina", "estudos", "IA", "assistente médica", "plantões", "anotações"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <AuthProvider>
            {children}
            <Toaster richColors position="top-right" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
