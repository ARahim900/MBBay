import React from 'react';

export default function SimpleApp() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f3f4f6',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: '1rem'
        }}>
          🎉 App is Working!
        </h1>
        <p style={{
          color: '#6b7280',
          marginBottom: '1.5rem'
        }}>
          React is successfully rendering. The issue was with the complex modules.
        </p>
        <div style={{
          padding: '1rem',
          backgroundColor: '#dcfce7',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ color: '#166534', margin: 0 }}>
            ✅ React is loaded and working<br/>
            ✅ Styles are rendering<br/>
            ✅ JavaScript is executing
          </p>
        </div>
        <button 
          onClick={() => {
            alert('Button works! JavaScript is functional.');
            console.log('SimpleApp: Button clicked successfully');
          }}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#3b82f6';
          }}
        >
          Test JavaScript
        </button>
      </div>
    </div>
  );
}