import { BrowserRouter, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import { PageTransitionProvider } from "./components/PageTransition";
import Home from "./pages/Home";
import KnowledgeCenter from "./pages/KnowledgeCenter";
import Opportunities from "./pages/Opportunities";
import ProcessesTemplates from "./pages/ProcessesTemplates";

const App = () => (
  <BrowserRouter>
    {/* Above Routes so the shell inside can read which way the last move travelled. */}
    <PageTransitionProvider>
      <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="knowledge" element={<KnowledgeCenter />} />
        <Route path="processes" element={<ProcessesTemplates />} />
        <Route path="opportunities" element={<Opportunities />} />
      </Route>
      </Routes>
    </PageTransitionProvider>
  </BrowserRouter>
);

export default App;
