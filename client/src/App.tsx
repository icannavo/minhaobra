import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import NewProject from "@/pages/NewProject";
import ScheduleSetup from "@/pages/ScheduleSetup";
import ProjectsList from "@/pages/ProjectsList";
import DailyDashboard from "@/pages/DailyDashboard";
import NextDayPlanning from "@/pages/NextDayPlanning";
import Catalog from "@/pages/Catalog";
import SpecializedTasks from "@/pages/SpecializedTasks";
import Navigation from "@/components/Navigation";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/new-project"} component={NewProject} />
      <Route path={"/schedule-setup"} component={ScheduleSetup} />
      <Route path={"/projects"} component={ProjectsList} />
      <Route path={"/daily"} component={DailyDashboard} />
      <Route path={"/next-day"} component={NextDayPlanning} />
      <Route path={"/catalog"} component={Catalog} />
      <Route path={"/tasks"} component={SpecializedTasks} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Navigation />
          <div className="pt-16">
            <Router />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
