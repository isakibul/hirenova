import AuthProvider from "./_components/auth/AuthProvider";
import Footer from "./_components/Footer";
import Nav from "./_components/Nav";
import ThemeProvider from "./_components/theme/ThemeProvider";
import "./globals.css";

const themeScript = `
  (() => {
    try {
      const storedTheme = localStorage.getItem("hirenova-theme");
      const theme =
        storedTheme === "light" || storedTheme === "dark"
          ? storedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

      document.documentElement.dataset.theme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
      document.documentElement.style.colorScheme = "light";
    }
  })();
`;
export const metadata = {
  title: "HireNova - Find Your Opportunity",
  description:
    "HireNova is an AI-powered job suggestion platform that matches you with the best opportunities based on your skills and experience. Get personalized job recommendations and take your career to the next level with HireNova.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <ThemeProvider>
          <AuthProvider>
            <div className="site-shell flex min-h-screen flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
