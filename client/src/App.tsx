import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Analysis from "./pages/Analysis";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/analysis"} component={Analysis} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                background: 'oklch(0.14 0.015 260)',
                border: '1px solid oklch(0.25 0.02 260 / 0.5)',
                color: 'oklch(0.98 0 0)',
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
