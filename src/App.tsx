import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import LanguagePicker from "@/components/LanguagePicker";
import ServerTimeBar from "@/components/ServerTimeBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Index from "./pages/Index.tsx";
import Donatur from "./pages/Donatur.tsx";
import Register from "./pages/Register.tsx";
import Voucher from "./pages/Voucher.tsx";
import Clans from "./pages/Clans.tsx";
import Statistik from "./pages/Statistik.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <Toaster />
        <Sonner />
        <LanguagePicker />
        <BrowserRouter>
          <ServerTimeBar />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/donatur" element={<Donatur />} />
            <Route path="/register" element={<Register />} />
            <Route path="/voucher" element={<Voucher />} />
            <Route path="/clans" element={<Clans />} />
            <Route path="/statistik" element={<Statistik />} />
            <Route path="/auth/:sesi" element={<Auth />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
