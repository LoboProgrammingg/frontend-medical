'use client';

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heart, Stethoscope, BookOpen, Calendar, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Branding Médico */}
      <div className="hidden lg:flex lg:w-1/2 medical-gradient p-12 text-white flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8">
            <Heart className="h-8 w-8" fill="white" />
            <h1 className="text-3xl font-bold">Amorinha</h1>
          </div>
          
          <div className="space-y-8 mt-20">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold mb-4">
                Feito com muito amor para o amor da minha vida 💙
              </h2>
              <p className="text-lg text-white/90">
                Organize seus estudos, plantões e tenha uma IA médica para te auxiliar.
              </p>
            </div>

            <div className="space-y-6 mt-12">
              <div className="flex items-start gap-4 animate-fade-in" style={{animationDelay: "0.1s"}}>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Assistente Médica IA</h3>
                  <p className="text-white/80">Tire dúvidas baseadas nas suas anotações</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-fade-in" style={{animationDelay: "0.2s"}}>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Anotações Inteligentes</h3>
                  <p className="text-white/80">Organize e analise seus estudos</p>
                </div>
              </div>

              <div className="flex items-start gap-4 animate-fade-in" style={{animationDelay: "0.3s"}}>
                <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Organização de Plantões</h3>
                  <p className="text-white/80">Gerencie sua agenda médica facilmente</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado Direito - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="flex justify-center mb-4 lg:hidden">
              <Heart className="h-12 w-12 text-primary" fill="currentColor" />
            </div>
            <CardTitle className="text-3xl font-bold">Bem-vinda de volta! 💙</CardTitle>
            <CardDescription className="text-base">
              Entre para acessar sua assistente médica
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="seu-email@exemplo.com"
                  className="h-11"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  className="h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit"
                className="w-full h-11 text-base font-semibold" 
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
