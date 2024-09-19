// pages/protected.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';

const ProtectedRoute = () => {
  const router = useRouter();
  const [userAddress, setUserAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyTokenAndAddress = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        alert("Acceso denegado. Por favor inicia sesión.");
        router.push('/');
        return;
      }

      // Verificar el token en el backend
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userAddress');
        alert('El token ha sido invalidado. Por favor inicia sesión nuevamente.');
        router.push('/');
        return;
      }

      // Obtener la dirección del usuario desde la respuesta
      const { address } = await response.json();

      // Obtener la dirección actual de MetaMask
      const provider = new ethers.BrowserProvider(window.ethereum);

      try {
        const signer = await provider.getSigner();
        const currentAddress = await signer.getAddress();

        // Comparar las direcciones
        if (address !== currentAddress) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userAddress');
          alert('Has cambiado de usuario. Por favor inicia sesión nuevamente.');
          router.push('/');
          return;
        }

        // Si todo es válido, establecer la dirección del usuario
        setUserAddress(address);
      } catch (err) {
        console.error("Error al obtener la dirección actual:", err);
        alert("No se pudo verificar la dirección actual.");
        router.push('/');
      } finally {
        setLoading(false); // Cambiar el estado de carga al final
      }
    };

    verifyTokenAndAddress();
  }, [router]);

  if (loading) {
    return <div>Cargando...</div>; // Mensaje o spinner mientras se verifica
  }

  return (
    <div>
      <h1>Contenido Protegido</h1>
      <p>¡Hola, {userAddress}!</p>
    </div>
  );
};

export default ProtectedRoute;