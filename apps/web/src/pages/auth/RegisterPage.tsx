// RegisterPage.tsx - Redirect Otomatis ke Menu Pricing di Landing Page
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/#pricing', { replace: true });
  }, [navigate]);

  return null;
};
