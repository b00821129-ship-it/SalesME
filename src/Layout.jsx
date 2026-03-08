import Sidebar from './components/nav/Sidebar';
import { ThemeProvider } from './components/ThemeProvider';

export default function Layout({ children, currentPageName }) {
  if (currentPageName === 'Home') {
    return <ThemeProvider>{children}</ThemeProvider>;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Sidebar currentPageName={currentPageName} />
        <main className="ml-[240px] min-h-screen p-6 transition-all duration-200" style={{ color: 'var(--text-primary)' }}>
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
