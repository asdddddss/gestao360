import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAppData();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: loginError } = await login(email, password);
    
    // O `onAuthStateChange` listener no AppDataContext irá atualizar o estado global,
    // e o componente PublicRoute/ProtectedRoute irá lidar com o redirecionamento.
    // Nós só precisamos lidar com o caso de erro de login imediato aqui.
    if (loginError) {
        setError(loginError.message);
        setLoading(false);
    }
    // Em caso de sucesso, não fazemos nada. O componente será desmontado pela mudança de rota.
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex justify-center mb-6">
          <Logo />
        </Link>
        <Card>
          <h2 className="text-2xl font-bold text-center text-white mb-6">Acessar Painel</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
             <Input
              label="Senha"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          <p className="text-center text-sm text-gray-400 mt-6">
            Não tem uma conta?{' '}
            <Link to="/signup" className="font-medium text-brand-gold hover:underline">
              Crie uma agora
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};