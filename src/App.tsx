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
import Panel from "./pages/Panel.tsx";
import TopRank from "./pages/TopRank.tsx";
import Donatur from "./pages/Donatur.tsx";
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
            <Route path="/panel" element={<Panel />} />
            <Route path="/toprank" element={<TopRank />} />
            <Route path="/donatur" element={<Donatur />} />
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
