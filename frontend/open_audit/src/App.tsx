import { useState } from 'react';
import Navbar from './components/Navbar.tsx';
import SplashScreen from './pages/SplashScreen.tsx';
import LoginScreen from './pages/LoginScreen.tsx';
import RegisterScreen from './pages/RegisterScreen.tsx';
import HomeScreen from './pages/HomeScreen.tsx';
import CalculatorScreen from './pages/TaxCalculatorPage.tsx';
import FilesScreen from './pages/FilesScreen.tsx';
import HistoryScreen from './pages/HistoryScren.tsx';
import type { Screen } from './types/index.ts';

import { AuthProvider } from './contexts/AuthContext.tsx';


// function AppContent() {
//   const { user, loading } = useAuth();

//   if (loading) {
//     return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
//   }

//   return (
//     <>
//       {user && <Navbar />}
//       <Routes>
//         <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
//         <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
//         <Route
//           path="/dashboard"
//           element={
//             <ProtectedRoute>
//               <DashboardPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/upload"
//           element={
//             <ProtectedRoute>
//               <UploadPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/tax"
//           element={
//             <ProtectedRoute>
//               <TaxCalculatorPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute adminOnly>
//               <AdminPage />
//             </ProtectedRoute>
//           }
//         />
//         <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
//       </Routes>
//     </>
//   );
// }

// function App() {
//   return (
//     <Router>
//       <AuthProvider>
//         <AppContent />
//       </AuthProvider>
//     </Router>
//   );
// }
import { globalStyles } from './styles/global.ts';
function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    return localStorage.getItem('token') ? "home" : "splash";
  });

  const isAuth = !["splash", "login", "register"].includes(screen);

  return (
    <AuthProvider>
      <div className="screen">
        <div className="mesh-bg" />
        {isAuth && <Navbar screen={screen} onNav={setScreen} />}
        {screen === "splash" && <SplashScreen onNav={setScreen} />}
        {screen === "login" && <LoginScreen onNav={setScreen} />}
        {screen === "register" && <RegisterScreen onNav={setScreen} />}
        {screen === "home" && <HomeScreen onNav={setScreen} />}
        {screen === "calculator" && <CalculatorScreen onAddHistory={() => { }} />}
        {screen === "files" && <FilesScreen />}
        {screen === "history" && <HistoryScreen />}
      </div>
    </AuthProvider>
  );
}

export default App;