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
  }, []);

  async function handleWalletLogin() {
    setIsLoading(true);
    try {
      if (!isWalletAvailable) {
        throw new Error('No se detectó una billetera compatible. Por favor, instala MetaMask o usa Brave con su billetera integrada.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      console.log('Obteniendo nonce para la dirección:', address);
      const nonceResponse = await fetch('/api/nonce', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      });

      if (!nonceResponse.ok) {
        const errorData = await nonceResponse.json();
        throw new Error(errorData.message || 'Error al obtener el nonce');
      }

      const { nonce } = await nonceResponse.json();
      console.log('Nonce obtenido:', nonce);

      console.log('Firmando mensaje...');
      const signedMessage = await signer.signMessage(nonce);
      console.log('Mensaje firmado:', signedMessage);

      console.log('Enviando solicitud de login...');
      const loginResponse = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, signedMessage, nonce }),
      });

      if (!loginResponse.ok) {
        const errorData = await loginResponse.json();
        throw new Error(errorData.error || 'Error en el proceso de login');
      }

      const { token } = await loginResponse.json();
      localStorage.setItem('authToken', token);
      localStorage.setItem('userAddress', address);

      console.log('Login exitoso, redirigiendo...');
      router.push('/protected-route');
    } catch (error) {
      console.error('Error en el proceso de login:', error);
      alert(error.message || 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>¡Bienvenido a mi sitio!</h1>
      <p>Por favor, selecciona una opción para continuar:</p>
      <div>
        <button
          className={styles.btn}
          onClick={handleWalletLogin}
          disabled={isLoading || !isWalletAvailable}
        >
          {isLoading ? 'Cargando...' : 'Iniciar sesión con Metamask'}
        </button>
        <br />
        <br />
      </div>
      <Link href="/signup">
        <button className={styles.btn}>Registrarse</button>
      </Link>
    </div>
  );
}

export default HomePage;