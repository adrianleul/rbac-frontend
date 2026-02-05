import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store'; // Import RootState and AppDispatch
import { loginUser, fetchUserInfo } from '../features/user/userSlice';
import { fetchMenuRoutes } from '../features/menu/menuSlice';
import { getCodeImg } from '../api/auth/login';
import { useToast, toast } from '../components/alert/Toast';
import Cookies from 'js-cookie';
import logo from '../../Public/app/logo.png';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [uuid, setUuid] = useState('');
  const [img, setCaptchaImg] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>(); // Use AppDispatch from the custom store
  const { showToast } = useToast();

  const validateLoginInputs = () => {
    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();
    const trimmedCode = code.trim();

    if (!trimmedUsername) {
      showToast(toast.error('Missing username', 'Please enter your username.'));
      return false;
    }
    if (!trimmedPassword) {
      showToast(toast.error('Missing password', 'Please enter your password.'));
      return false;
    }
    if (!trimmedCode) {
      showToast(toast.error('Missing captcha', 'Please enter the captcha code.'));
      return false;
    }
    if (!uuid) {
      showToast(toast.error('Captcha not ready', 'Please refresh the captcha and try again.'));
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Restore credentials if "Remember Me" was used
    const savedCredentials = Cookies.get('rememberMe');
    if (savedCredentials) {
      const { username, password } = JSON.parse(savedCredentials);
      setUsername(username);
      setPassword(password);
      setRememberMe(true);
    }

    // Fetch the captcha image
    fetchCaptcha();

    // Add spinner keyframes to the document
    if (typeof window !== 'undefined' && !document.getElementById('login-spinner-style')) {
      const style = document.createElement('style');
      style.id = 'login-spinner-style';
      style.innerHTML = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
      document.head.appendChild(style);
    }
  }, []);

  const fetchCaptcha = () => {
    getCodeImg()
      .then((data) => {
        if (!data.img) {
          showToast(toast.error('Captcha error', 'Missing captcha image.'));
          return;
        }

        const base64Image = `data:image/gif;base64,${data.img}`;
        setCaptchaImg(base64Image);
        // Save the captcha uuid so it can be sent with the login payload
        if (data.uuid) {
          setUuid(data.uuid);
        } else {
          showToast(toast.warning('Captcha warning', 'Missing captcha uuid.'));
        }
      })
      .catch(() => {
        showToast(toast.error('Captcha error', 'Failed to fetch captcha.'));
      });
  };

  const handleLogin = async () => {
    if (!validateLoginInputs()) return;
    setLoading(true);
    try {
      const loginPayload = {
        username: username.trim(),
        password: password.trim(),
        code: code.trim(),
        uuid,
      };
      const resultAction = await dispatch(loginUser(loginPayload));

      if (loginUser.fulfilled.match(resultAction)) {
        showToast(toast.success('Login successful', 'Welcome back.'));

        if (rememberMe) {
          Cookies.set('rememberMe', JSON.stringify({ username, password }), { expires: 7 });
        } else {
          Cookies.remove('rememberMe');
        }

        const userInfoAction = await dispatch(fetchUserInfo());
        if (fetchUserInfo.fulfilled.match(userInfoAction)) {
          const userMenuAction = await dispatch(fetchMenuRoutes());
          if (fetchMenuRoutes.fulfilled.match(userMenuAction)) {
            window.location.href = '/admin';
          } else {
            const msg = userMenuAction.payload as string;
            showToast(toast.error('Menu error', msg || 'Failed to fetch user menus.'));
          }

        } else {
          const msg = userInfoAction.payload as string;
          showToast(toast.error('User info error', msg || 'Failed to fetch user information.'));
        }

      } else {
        const errorMsg = resultAction.payload as string;
        showToast(toast.error('Login failed', errorMsg || 'Please check your credentials.'));
      }

    } catch (error) {
      showToast(toast.error('Login error', 'An unexpected error occurred. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Logo placeholder, replace src with your logo if available */}
        <img src={logo} alt="Logo" style={styles.logo} />
        <h1 style={styles.title}>Login</h1>
        <form style={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <div style={styles.captchaContainer}>
            <input
              type="text"
              placeholder="Captcha Code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={styles.input}
            />
            <img
              src={img}
              alt="Captcha"
              style={styles.captcha}
              onClick={fetchCaptcha}
            />
          </div>
          {/* <div style={styles.rememberMeContainer}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={styles.checkbox}
            />
            <label>Remember Me</label>
          </div> */}
          <button type="button" onClick={handleLogin} style={styles.button} disabled={loading}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={styles.spinner} />
                <span style={{ marginLeft: '0.5rem' }}>Logging in...</span>
              </span>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: `url('/Public/Images/login_pic.jpg') center/cover no-repeat`,
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
    padding: '2.5rem 2.5rem 2rem 2.5rem',
    minWidth: '350px',
    maxWidth: '90vw',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  logo: {
    width: '64px',
    height: '64px',
    marginBottom: '1.5rem',
    objectFit: 'cover' as React.CSSProperties['objectFit'],
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    color: '#2d3748',
    letterSpacing: '0.5px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100%',
    gap: '1rem',
    background: 'transparent'
  },
  input: {
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border 0.2s',
    background: '#f8fafc',
    marginBottom: 0,
  },
  captchaContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.5rem',
  },
  captcha: {
    height: '50px',
    width: '130px',
    cursor: 'pointer',
    borderRadius: '5px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    border: '1px solid #e2e8f0',
    background: '#f1f5f9',
    objectFit: 'contain' as React.CSSProperties['objectFit'],
  },
  button: {
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    background: 'linear-gradient(90deg, #6366f1 0%, #60a5fa 100%)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '1.1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
    transition: 'background 0.2s',
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #fff',
    borderTop: '3px solid #6366f1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
};

export default LoginPage;