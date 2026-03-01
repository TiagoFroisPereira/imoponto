import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Search from "./pages/Search";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Services from "./pages/Services";
import PropertyDetail from "./pages/PropertyDetail";
import MyProfile from "./pages/MyProfile";
import MyProperties from "./pages/MyProperties";
import SemComissoes from "./pages/SemComissoes";
import BecomeProfessional from "./pages/BecomeProfessional";
import ListingOptions from "./pages/ListingOptions";
import Favorites from "./pages/Favorites";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import PublishProperty from "./pages/PublishProperty";
import CompleteProfessionalProfile from "./pages/CompleteProfessionalProfile";
import ProfessionalProfile from "./pages/ProfessionalProfile";
import ProfessionalPanel from "./pages/ProfessionalPanel";
import MyDocuments from "./pages/MyDocuments";
import Messages from "./pages/Messages";
import Agenda from "./pages/Agenda";
import SellerPlans from "./pages/SellerPlans";
import ProfessionalPlans from "./pages/ProfessionalPlans";
import PropertyPowerups from "./pages/PropertyPowerups";
import Checkout from "./pages/Checkout";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import AboutUs from "./pages/AboutUs";
import TermsConditions from "./pages/TermsConditions";
import RGPD from "./pages/RGPD";
import Cookies from "./pages/Cookies";
import PropertyManagement from "./pages/PropertyManagement";
import PropertyDocuments from "./pages/PropertyDocuments";
import Contact from "./pages/Contact";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LegalAcceptanceWrapper } from "./components/auth/LegalAcceptanceWrapper";
import { AdminProtectedRoute } from "./components/admin/AdminProtectedRoute";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminListings from "./pages/admin/AdminListings";
import AdminProfessionals from "./pages/admin/AdminProfessionals";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLogs from "./pages/admin/AdminLogs";

import { MessagingProvider } from "./contexts/MessagingContext";
import { AuthModalProvider } from "./contexts/AuthModalContext";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <AuthModalProvider>
            <MessagingProvider>
              <LegalAcceptanceWrapper>
                <ScrollToTop />
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Admin routes - no Header/Footer */}
                  <Route path="/admin" element={<AdminProtectedRoute><AdminLayout /></AdminProtectedRoute>}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="utilizadores" element={<AdminUsers />} />
                    <Route path="anuncios" element={<AdminListings />} />
                    <Route path="profissionais" element={<AdminProfessionals />} />
                    <Route path="planos" element={<AdminPlans />} />
                    <Route path="definicoes" element={<AdminSettings />} />
                    <Route path="logs" element={<AdminLogs />} />
                    <Route index element={<Navigate to="/admin/dashboard" replace />} />
                  </Route>

                  {/* Public/User routes with Header/Footer */}
                  <Route path="/*" element={
                    <div className="flex flex-col min-h-screen">
                      <Header />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/auth" element={<Auth />} />
                          <Route path="/imoveis" element={<Search />} />
                          <Route path="/pesquisar" element={<Navigate to="/imoveis" replace />} />
                          <Route path="/publicar" element={<ProtectedRoute><ListingOptions /></ProtectedRoute>} />
                          <Route path="/publicar-imovel/:id" element={<ProtectedRoute><PublishProperty /></ProtectedRoute>} />
                          <Route path="/criar-anuncio" element={<ProtectedRoute><CreateListing /></ProtectedRoute>} />
                          <Route path="/editar-anuncio/:id" element={<ProtectedRoute><EditListing /></ProtectedRoute>} />
                          <Route path="/servicos" element={<Services />} />
                          <Route path="/sem-comissoes" element={<SemComissoes />} />
                          <Route path="/imovel/:id" element={<PropertyDetail />} />
                          <Route path="/imovel/:id/gestao" element={<ProtectedRoute><PropertyManagement /></ProtectedRoute>} />
                          <Route path="/imovel/:id/documentos" element={<ProtectedRoute><PropertyDocuments /></ProtectedRoute>} />
                          <Route path="/meu-perfil" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />
                          <Route path="/meus-imoveis" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
                          <Route path="/painel-profissional" element={<ProtectedRoute><ProfessionalPanel /></ProtectedRoute>} />
                          <Route path="/favoritos" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                          <Route path="/tornar-profissional" element={<ProtectedRoute><BecomeProfessional /></ProtectedRoute>} />
                          <Route path="/definicoes" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                          <Route path="/completar-perfil-profissional" element={<ProtectedRoute><CompleteProfessionalProfile /></ProtectedRoute>} />
                          <Route path="/documentos" element={<ProtectedRoute><MyDocuments /></ProtectedRoute>} />
                          <Route path="/mensagens" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                          <Route path="/agenda" element={<ProtectedRoute><Agenda /></ProtectedRoute>} />
                          <Route path="/planos" element={<ProtectedRoute><SellerPlans /></ProtectedRoute>} />
                          <Route path="/planos-profissionais" element={<ProfessionalPlans />} />
                          <Route path="/propriedade/:id/powerups" element={<ProtectedRoute><PropertyPowerups /></ProtectedRoute>} />
                          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                          <Route path="/profissional/:id" element={<ProfessionalProfile />} />
                          <Route path="/sobre-nos" element={<AboutUs />} />
                          <Route path="/contactos" element={<Contact />} />
                          <Route path="/politica-privacidade" element={<PrivacyPolicy />} />
                          <Route path="/termos-servico" element={<TermsConditions />} />
                          <Route path="/rgpd" element={<RGPD />} />
                          <Route path="/cookies" element={<Cookies />} />
                          <Route path="/dashboard/*" element={<Navigate to="/meu-perfil" replace />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                      <Footer />
                    </div>
                  } />
                </Routes>
              </LegalAcceptanceWrapper>
            </MessagingProvider>
          </AuthModalProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
