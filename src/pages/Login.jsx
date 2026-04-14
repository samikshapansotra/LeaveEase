import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset, checkPasswordRequestStatus, submitNewPassword } from '../services/authService';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // email, pending, new_password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const quotes = [
    { text: "Teaching is the greatest act of optimism.", author: "Colleen Wilcox" },
    { text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.", author: "Brad Henry" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" }
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      if (profile.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (!profile.profileSetup) {
        navigate('/setup');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    setForgotLoading(true);
    try {
      if (forgotStep === 'email') {
        const req = await checkPasswordRequestStatus(forgotEmail);
        if (req && req.status === 'approved') {
          setForgotStep('new_password');
        } else if (req && req.status === 'pending') {
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "A request has already been sent to the admin. Please wait for them to allow it."});
        } else {
          await requestPasswordReset(forgotEmail);
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "Request sent to Admin! Once allowed, you can set a new password here."});
        }
      } else if (forgotStep === 'new_password') {
        if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        await submitNewPassword(forgotEmail, newPassword);
        setForgotMsg({ type: 'success', text: "Password reset correctly! You can now log in."});
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep('email');
          setForgotEmail('');
          setNewPassword('');
          setForgotMsg({ type: '', text: '' });
        }, 2500);
      }
    } catch(err) {
      setForgotMsg({ type: 'error', text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Visual Sidebar */}
      <div className="auth-sidebar" style={{ padding: '3rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: '3rem', left: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>✦</div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>LeaveFlow</span>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 2, width: '100%', maxWidth: '480px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            Manage your <br/> schedule with <br/> <span style={{ opacity: 0.9 }}>elegance</span>.
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem', maxWidth: '400px' }}>
            A seamless bridge between faculty leave requests and effortless class substitutions.
          </p>

          {/* Rotating Quote Container */}
          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', padding: '2rem 2.5rem', borderRadius: '1.5rem', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '4rem', opacity: 0.15, position: 'absolute', top: '0.5rem', left: '1.5rem', fontFamily: 'serif', lineHeight: 1 }}>"</div>
            
            <div style={{ transition: 'opacity 0.6s ease-in-out', opacity: 1, position: 'relative', zIndex: 2 }} key={quoteIndex} className="animate-in">
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6, margin: '0 0 1rem 0' }}>
                {quotes[quoteIndex].text}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                — {quotes[quoteIndex].author}
              </p>
            </div>
          </div>
          
          {/* Quote indicators */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '2rem', marginLeft: '1.5rem' }}>
            {quotes.map((_, i) => (
              <div 
                key={i} 
                onClick={() => setQuoteIndex(i)}
                style={{ cursor: 'pointer', width: i === quoteIndex ? '28px' : '8px', height: '8px', borderRadius: '4px', background: 'white', opacity: i === quoteIndex ? 1 : 0.4, transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)' }} 
              />
            ))}
          </div>
        </div>

        {/* Decorative elements */}
        <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', zIndex: 1 }}></div>
      </div>

      {/* Form */}
      <div className="auth-form-container">
        <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }} className="animate-in">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>✦</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Sign In</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to access your account</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input id="login-email" type="email" className="form-input" placeholder="e.g. t01@college.edu"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input id="login-password" type="password" className="form-input" placeholder="Enter your password"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? <span className="spinner"></span> : 'Sign In →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button 
              type="button" 
              onClick={() => {
                setShowForgot(true);
                setForgotStep('email');
                setForgotMsg({type: '', text: ''});
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Demo Credentials */}
          <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>🔑 Demo Credentials</p>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Admin:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>admin@college.edu / admin123</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Teacher:</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>t01@college.edu / password123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card-flat animate-in" style={{ width: '90%', maxWidth: '400px', background: 'white', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Forgot Password</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {forgotStep === 'new_password' ? 'Your request was approved. Set a new password.' : 'Enter your email to check or send a reset request to the Admin.'}
            </p>

            {forgotMsg.text && (
              <div className={`alert alert-${forgotMsg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              {forgotStep !== 'new_password' && (
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-input" placeholder="e.g. t01@college.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required disabled={forgotStep === 'pending'} />
                </div>
              )}
              {forgotStep === 'new_password' && (
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-input" placeholder="Must be at least 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForgot(false)}>Close</button>
                {forgotStep !== 'pending' && (
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? 'Processing...' : (forgotStep === 'new_password' ? 'Save Password' : 'Check / Send')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
