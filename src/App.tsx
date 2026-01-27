import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import APagar from "./pages/APagar";
import NotFound from "./pages/NotFound";
import { useHeartbeat } from "./hooks/use-heartbeat";

const App = () => {
  // Mantém o projeto Supabase ativo fazendo pings periódicos
  useHeartbeat();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/a-pagar" element={<APagar />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
