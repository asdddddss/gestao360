import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';

export const SignupPage: React.FC = () => {
    const [negocioName, setNegocioName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [honeypot, setHoneypot] = useState(''); // Anti-spam field
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAppData();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            return;
        }
        setError('');
        setLoading(true);
        const { error: signUpError } = await signUp(negocioName, email, password, honeypot);
        if (signUpError) {
            if (signUpError.message === 'Bot detected') {
                 // Fail silently for bots
                 navigate('/login');
                 return;
            }
            setError(signUpError.message);
        } else {
            // This message is shown before the user confirms their email.
            // After email confirmation, their account will be inactive and await admin approval.
            alert("Cadastro realizado! Verifique seu email para confirmar a conta. Após a confirmação, sua conta entrará em análise para aprovação.");
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/" className="flex justify-center mb-6">
                    <Logo />
                </Link>
                <Card>
                    <h2 className="text-2xl font-bold text-center text-white mb-6">Crie sua Conta</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nome do seu Negócio"
                            id="negocioName"
                            type="text"
                            value={negocioName}
                            onChange={(e) => setNegocioName(e.target.value)}
                            placeholder="Ex: Barbearia do Ricardo"
                            required
                        />
                        <Input
                            label="Seu Email de Acesso"
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />
                        <Input
                            label="Crie uma Senha"
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {/* Honeypot field for spam protection */}
                        <input
                            type="text"
                            name="extra_field"
                            value={honeypot}
                            onChange={(e) => setHoneypot(e.target.value)}
                            style={{ position: 'absolute', left: '-5000px' }}
                            aria-hidden="true"
                            tabIndex={-1}
                        />
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </Button>
                    </form>
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Já tem uma conta?{' '}
                        <Link to="/login" className="font-medium text-brand-gold hover:underline">
                            Acesse aqui
                        </Link>
                    </p>
                </Card>
            </div>
        </div>
    );
};