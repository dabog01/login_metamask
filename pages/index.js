import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/styles.module.css';

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

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      if (!accounts || accounts.length === 0) {
        throw new Error('No se pudo obtener la cuenta de la billetera');
      }

      const address = accounts[0];
      console.log('Dirección de usuario:', address);

      // Simular obtención de nonce del backend
      const nonce = "Nonce de ejemplo: " + Math.random().toString(36).substring(7);

      const signedMessage = await window.ethereum.request({
        method: 'personal_sign',
        params: [nonce, address],
      });

      console.log('Mensaje firmado:', signedMessage);

      // Simular autenticación en el backend
      const token = "token_de_ejemplo_" + Math.random().toString(36).substring(7);

      localStorage.setItem('authToken', token);
      localStorage.setItem('userAddress', address);

      console.log('Login exitoso! Token:', token);

      // Redirigir al usuario a una ruta protegida
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