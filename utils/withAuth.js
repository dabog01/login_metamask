import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

const withAuth = (WrappedComponent) => {
  return function AuthComponent(props) {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          if (typeof window.ethereum === 'undefined') {
            throw new Error('No se detectó una billetera compatible');
          }

          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const currentAddress = await signer.getAddress();
          
          const token = localStorage.getItem('authToken');
          const storedAddress = localStorage.getItem('userAddress');

          if (!token || !storedAddress || storedAddress.toLowerCase() !== currentAddress.toLowerCase()) {
            throw new Error('No autenticado o dirección no coincide');
          }

          setIsAuthenticated(true);
        } catch (error) {
          console.error('Error de autenticación:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userAddress');
          router.push('/');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [router]);

    if (isLoading) {
      return <div>Cargando...</div>; // O cualquier componente de carga que prefieras
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;