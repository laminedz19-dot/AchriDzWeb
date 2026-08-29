/* AchriDZ design: warm editorial marketplace with a focused public storefront and tactile interactions. */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ListingDetail from "./pages/ListingDetail";
import Favorites from "./pages/Favorites";
import Admin from "@/pages/Admin";
import AdminLogin from "@/pages/AdminLogin";
import Sell from "./pages/Sell";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return <Switch><Route path="/" component={Home} /><Route path="/listing/:id" component={ListingDetail} /><Route path="/favorites" component={Favorites} /><Route path="/admin/login" component={AdminLogin} /><Route path="/admin" component={Admin} /><Route path="/sell" component={Sell} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster position="bottom-left" /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
