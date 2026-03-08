import { base44 } from '@/api/base44Client';

export default function Home() {
  const handleSignIn = () => {
    base44.auth.redirectToLogin();
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: '#E4E4E4', fontFamily: "'Lufga', system-ui, sans-serif" }}
    >
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        src="https://res.cloudinary.com/doruzffij/video/upload/v1772587092/Screen_Recording_2026-03-04_at_02.17.02_ol2pzf.mov"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 1,
          pointerEvents: 'none',
        }}
      />

      {/* Login Card */}
      <div className="relative w-full max-w-md mx-4" style={{ zIndex: 10 }}>
        <div
          className="rounded-2xl p-10"
          style={{
            backgroundColor: 'rgba(255,255,255,0.75)',
            border: '1px solid rgba(255,255,255,0.55)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          }}
        >
          {/* Logo */}
          <div className="mb-8 text-center">
            <span className="text-3xl font-bold tracking-tight" style={{ color: '#10141A' }}>
              Sales<span style={{ color: '#CE6969' }}>ME</span>
            </span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1" style={{ color: '#10141A' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              Sign in to your account to continue
            </p>
          </div>

          {/* Inputs (visual only — actual auth handled by platform) */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#6B7280' }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                readOnly
                onFocus={handleSignIn}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  color: '#10141A',
                }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: '#6B7280' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                readOnly
                onFocus={handleSignIn}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none cursor-pointer"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.5)',
                  border: '1px solid rgba(0,0,0,0.12)',
                  color: '#10141A',
                }}
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            onClick={handleSignIn}
            className="w-full py-3.5 rounded-xl text-white font-semibold text-sm transition-all"
            style={{
              backgroundColor: '#CE6969',
              letterSpacing: '0.02em',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#B85555';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(206,105,105,0.35)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = '#CE6969';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Sign In
          </button>

          {/* Forgot Password */}
          <div className="text-center mt-4">
            <button
              onClick={handleSignIn}
              className="text-sm transition-opacity hover:opacity-70 bg-transparent border-none"
              style={{ color: '#83A2DB' }}
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(16,20,26,0.45)' }}>
          © 2026 SalesME · Enterprise Sales Intelligence
        </p>
      </div>
    </div>
  );
}
