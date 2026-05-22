"use client";

import React, { useState } from 'react';

export default function Home() {
  const [subject, setSubject] = useState('Mathématiques');
  
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#4f46e5' }}>révise. 🎓</h1>
      <p>Bienvenue sur ton application de révision scolaire !</p>
      
      <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
        <h3>Matière sélectionnée : {subject}</h3>
        <button 
          onClick={() => setSubject('Mathématiques')}
          style={{ marginRight: '10px', padding: '8px 12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Maths
        </button>
        <button 
          onClick={() => setSubject('Histoire-Géo')}
          style={{ padding: '8px 12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Histoire
        </button>
      </div>
    </div>
  );
}
