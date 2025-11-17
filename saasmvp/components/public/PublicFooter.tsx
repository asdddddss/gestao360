
import React from 'react';

export const PublicFooter: React.FC = () => {
    return (
        <footer className="bg-black py-8 border-t border-gray-800">
            <div className="container mx-auto px-6 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} Gestão 360. Todos os direitos reservados.</p>
                <p className="text-sm mt-2">Uma plataforma moderna para o seu negócio.</p>
            </div>
        </footer>
    );
};