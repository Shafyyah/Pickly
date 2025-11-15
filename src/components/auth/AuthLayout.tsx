import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--gradient-subtle)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Micro-Decision Helper
          </h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="bg-card p-8 rounded-2xl" style={{ boxShadow: 'var(--shadow-card)' }}>
          <h2 className="text-2xl font-semibold mb-6 text-card-foreground">{title}</h2>
          {children}
        </div>
      </div>
    </div>
  );
};
