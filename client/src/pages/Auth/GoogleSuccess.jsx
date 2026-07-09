import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { PageSpinner } from '@/components/ui/Spinner';
import toast from 'react-hot-toast';

const GoogleSuccess = () => {
  const [params] = useSearchParams();
  const { handleGoogleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    if (token) {
      handleGoogleCallback(token)
        .then(() => {
          toast.success('Signed in with Google! Welcome 🎨');
          navigate('/choose');
        })
        .catch(() => {
          toast.error('Google sign-in failed. Please try again.');
          navigate('/auth/login');
        });
    } else {
      navigate('/auth/login');
    }
  }, []);

  return <PageSpinner />;
};

export default GoogleSuccess;
