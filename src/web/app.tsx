import { Route, Switch } from "wouter";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "./components/provider";
import { AgentFeedback } from "@runablehq/website-runtime";
import { I18nProvider } from "./lib/i18n";
import { ThemeProvider } from "./lib/theme";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CookieBanner } from "./components/CookieBanner";
import { WunschengelChat } from "./components/WunschengelChat";
import { Toaster } from "./components/ui/sonner";
import LandingPage from "./pages/index";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import Dashboard from "./pages/dashboard";
import ListDetail from "./pages/list-detail";
import SharedList from "./pages/shared";
import Explore from "./pages/explore";
import Impressum from "./pages/impressum";
import Datenschutz from "./pages/datenschutz";
import AGBPage from "./pages/agb";
import Profile from "./pages/profile";
import Feed from "./pages/feed";
import Admin from "./pages/admin";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import ShareTarget from "./pages/share-target";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <Provider>
          <I18nProvider>
            <ThemeProvider>
              <Navbar />
              <Switch>
                <Route path="/" component={LandingPage} />
                <Route path="/sign-in" component={SignIn} />
                <Route path="/sign-up" component={SignUp} />
                <Route path="/dashboard" component={Dashboard} />
                <Route path="/list/:id" component={ListDetail} />
                <Route path="/shared/:token" component={SharedList} />
                <Route path="/explore" component={Explore} />
                <Route path="/impressum" component={Impressum} />
                <Route path="/datenschutz" component={Datenschutz} />
                <Route path="/agb" component={AGBPage} />
                <Route path="/profile" component={Profile} />
                <Route path="/feed" component={Feed} />
                <Route path="/admin" component={Admin} />
                <Route path="/forgot-password" component={ForgotPassword} />
                <Route path="/reset-password" component={ResetPassword} />
                <Route path="/share-target" component={ShareTarget} />
                <Route component={NotFoundPage} />
              </Switch>
              <Footer />
              <CookieBanner />
              <WunschengelChat />
              <Toaster richColors position="bottom-center" />
              {import.meta.env.DEV && <AgentFeedback />}
            </ThemeProvider>
          </I18nProvider>
        </Provider>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
