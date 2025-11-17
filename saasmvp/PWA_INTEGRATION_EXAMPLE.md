/**
 * Exemplo de como integrar o PWA Update Prompt no App.tsx
 * 
 * Copie as linhas abaixo para seu App.tsx para adicionar notificação de atualização
 */

// ============================================
// NO TOPO DO ARQUIVO, ADICIONE:
// ============================================

// import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';

// ============================================
// DENTRO DO COMPONENTE APP, ADICIONE:
// ============================================

/*
export function App() {
  return (
    <>
      {/* Seu conteúdo normal * /}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        {/* ... outras rotas ... * /}
      </Routes>

      {/* Adicione o PWAUpdatePrompt aqui * /}
      <PWAUpdatePrompt />
    </>
  );
}
*/

// ============================================
// EXEMPLO COMPLETO DO APP.TSX:
// ============================================

/*
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PWAUpdatePrompt } from './components/PWAUpdatePrompt';
import LandingPage from './pages/LandingPage';
import PricingPage from './pages/PricingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import PendingApprovalPage from './pages/auth/PendingApprovalPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import DashboardHomePage from './pages/dashboard/DashboardHomePage';
// ... imports das outras páginas

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/dashboard" element={<DashboardHomePage />} />
        {/* ... outras rotas ... * /}
      </Routes>

      {/* Prompt de atualização da PWA * /}
      <PWAUpdatePrompt />
    </Router>
  );
}

export default App;
*/

// ============================================
// USAR NOTIFICAÇÕES NO CÓDIGO
// ============================================

/*
import NotificationManager from './lib/NotificationManager';

// Em qualquer componente ou função:

// Novo agendamento
await NotificationManager.notifyNewAppointment({
  client: 'João Silva',
  date: '15/11/2025',
  time: '14:00'
});

// Transação financeira
await NotificationManager.notifyTransaction({
  type: 'income',
  amount: 150.00,
  description: 'Serviço de barbering'
});

// Atualização disponível
await NotificationManager.notifyAppUpdate();

// Sincronização
await NotificationManager.notifySyncStatus('completed', 'Dados sincronizados');

// Genérica
await NotificationManager.notifyGeneric('Titulo', 'Descrição');

// Agendar para depois
NotificationManager.scheduleNotification(
  15 * 60 * 1000, // 15 minutos
  'Lembrete de agendamento'
);

// Solicitar permissão
const hasPermission = await NotificationManager.checkAndRequestPermission();
if (hasPermission) {
  // Enviar notificações
}
*/

// ============================================
// INTEGRAR NO CONTEXTO DO APLICATIVO
// ============================================

/*
// Em AppDataContext.tsx ou similar:

import NotificationManager from '../lib/NotificationManager';

export const AppDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Solicitar permissão ao iniciar
    NotificationManager.checkAndRequestPermission();
  }, []);

  // Quando criar um novo agendamento:
  const createAppointment = async (appointmentData) => {
    // ... criar agendamento na API
    
    // Notificar usuário
    await NotificationManager.notifyNewAppointment({
      client: appointmentData.clientName,
      date: formatDate(appointmentData.date),
      time: appointmentData.time
    });
  };

  // Quando registrar transação:
  const recordTransaction = async (transaction) => {
    // ... registrar na API
    
    // Notificar
    await NotificationManager.notifyTransaction({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description
    });
  };

  return (
    <AppDataContext.Provider value={{ createAppointment, recordTransaction, ... }}>
      {children}
    </AppDataContext.Provider>
  );
};
*/

// ============================================
// USAR SERVICE WORKER HOOK
// ============================================

/*
import { useServiceWorker } from './hooks/useServiceWorker';

export function MyComponent() {
  const { 
    hasUpdate, 
    updateApp, 
    clearCache, 
    requestBackgroundSync 
  } = useServiceWorker();

  return (
    <div>
      {hasUpdate && (
        <button onClick={updateApp}>
          Nova versão disponível! Atualizar agora
        </button>
      )}

      <button onClick={clearCache}>
        Limpar Cache
      </button>

      <button onClick={() => requestBackgroundSync('sync-appointments')}>
        Sincronizar Agendamentos
      </button>
    </div>
  );
}
*/

// ============================================
// ESTRUTURA RECOMENDADA DE COMPONENTES
// ============================================

/*
App.tsx
├── PWAUpdatePrompt (notificação de update)
├── Router
│   ├── LandingPage
│   ├── LoginPage
│   ├── DashboardLayout
│   │   ├── Sidebar (com atalhos do PWA)
│   │   ├── DashboardHomePage
│   │   ├── AppointmentsPage (usa NotificationManager)
│   │   ├── FinancePage (usa NotificationManager)
│   │   └── ...
│   └── ...
└── AppDataProvider (oferece dados e notificações)
*/

// ============================================
// TESTE LOCAL
// ============================================

/*
1. npm run dev
2. Abra DevTools (F12)
3. Aba "Application"
4. Seção "Service Workers" - verifique se está "activated and running"
5. Teste modo offline: Network → Offline
6. Tente navegar na app - deve funcionar!

Troubleshooting:
- Se não aparecer SW: Recarregue (Ctrl+Shift+R)
- Se não funciona offline: Verifique console para erros
- Cache size: Application → Cache Storage
*/

// ============================================
// DEPLOY PARA PRODUÇÃO
// ============================================

/*
1. npm run build
2. npm run preview (teste a build)
3. Deploy:
   
   Opção A: Vercel (recomendado)
   npm i -g vercel
   vercel

   Opção B: Netlify
   npm i -g netlify-cli
   netlify deploy --prod

   Opção C: Servidor próprio
   - Configure HTTPS (obrigatório!)
   - Configure cache headers
   - Deploy pasta dist/

4. Teste em dispositivo real (Android/iOS)
*/

// ============================================
// CHECKLIST DE INTEGRAÇÃO
// ============================================

/*
[ ] PWAUpdatePrompt adicionado ao App.tsx
[ ] NotificationManager importado onde necessário
[ ] Notificações implementadas em:
    [ ] Novo agendamento
    [ ] Nova transação
    [ ] Sincronização
    [ ] Atualizações do app
[ ] Service Worker testado localmente
[ ] Build testada localmente (npm run preview)
[ ] Ícones gerados e adicionados
[ ] Manifest.json validado
[ ] Meta tags confirmadas em index.html
[ ] Todas as dependências instaladas (npm install)
[ ] HTTPS configurado em produção
[ ] Deploy realizado
[ ] Testado em Android (Chrome)
[ ] Testado em iOS (Safari)
*/

console.log('✅ PWA setup guide - Siga as instruções acima!');
