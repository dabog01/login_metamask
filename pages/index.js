// pages/index.js

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/styles.module.css';
import { ethers } from 'ethers';

function HomePage() {
  const [isWalletAvailable, setIsWalletAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkWallet = () => {
      setIsWalletAvailable(typeof window.ethereum !== 'undefined');
    };

    checkWallet();

    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        alert('Por favor, conecta una cuenta a MetaMask.');
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userAddress');
        alert('Has cambiado de usuario. Por favor inicia sesión nuevamente.');
        router.push('/'); // Redirigir a inicio
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [router]);

  async function handleWalletLogin() {
    setIsLoading(true);

    try {
      if (!isWalletAvailable) {
        throw new Error('No se detectó una billetera compatible. Por favor, instala MetaMask o usa Brave con su billetera integrada.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log('Iniciando sesión con la dirección:', address);

      // Obtener nonce
      const nonceResponse = await fetch('/api/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        console.error('Error fetching nonce:', errorData);
        throw new Error(errorData.message || 'Error al obtener el nonce');
      }

      const { nonce } = await nonceResponse.json();
      console.log('Nonce obtenido:', nonce);

      // Firmar mensaje
      const signedMessage = await signer.signMessage(nonce);

      // Enviar solicitud de login al backend
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signedMessage, nonce }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        console.error('Error en el proceso de login:', errorData);
        throw new Error(errorData.error || 'Error en el proceso de login');
      }

      const { token } = await loginResponse.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userAddress', address);

      console.log('Login exitoso, redirigiendo...');
      router.push('/protected');

    } catch (error) {
      console.error('Error en el proceso de login:', error);
      alert(error.message || 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>¡Bienvenido!</h1>

      <p>Por favor, selecciona una opción para continuar:</p>

      <button className={styles.btn} onClick={handleWalletLogin} disabled={isLoading}>
        {isLoading ? 'Cargando...' : 'Iniciar sesión con MetaMask'}
      </button>

      <Link href="/signup" className={styles.link}>
        ¿Aun no tienes cuenta?
      </Link>
    </div>
  );
}

export default HomePage;