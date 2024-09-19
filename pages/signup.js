// pages/signup.js
import { useState } from 'react';
import styles from '../styles/signup.module.css';

function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email }),
    });
    console.log(response)
    const data = await response.json();
    console.log(data);
  };

  return (
    <div className={styles.container}>
      <h1>Registro</h1>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>
          <span className={styles.label}>Nombre:</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={styles.input}
          />
        </label>
        <label>
          <span className={styles.label}>Email:</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className={styles.input}
          />
        </label>
        <button type="submit" className={styles.btn}>
          Guardar
        </button>
      </form>
    </div>
  );
}

export default SignupPage;
