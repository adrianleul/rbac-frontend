import { useEffect, ReactNode, useState } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import { fetchUserInfo } from '../features/user/userSlice';
import { fetchMenuRoutes } from '../features/menu/menuSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface AppInitializerProps {
  children: ReactNode;
}

const AppInitializer = ({ children }: AppInitializerProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.pathname === '/login') {
      setLoading(false);
      return;
    }
    const initApp = async () => {
      const userInfoAction = await dispatch(fetchUserInfo());

      if (fetchUserInfo.fulfilled.match(userInfoAction)) {
        await dispatch(fetchMenuRoutes());
        setLoading(false);
      } else {
        navigate('/login');
        setLoading(false);
      }
    };

    initApp();
  }, [dispatch, navigate, location.pathname]);

  if (loading) {
    return <div style={{textAlign: 'center', marginTop: '3rem'}}>Loading...</div>;
  }

  return <>{children}</>;
};

export default AppInitializer;
