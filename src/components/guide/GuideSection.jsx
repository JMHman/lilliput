// src/components/guide/GuideSection.jsx
function GuideSection({ title, items }) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <h2 style={{ color: '#b35c38', fontSize: '1.2rem', marginBottom: '0.5rem' }}>{title}</h2>
        <ul style={{ paddingLeft: '1rem' }}>
          {items.map((item, index) => (
            <li key={index} style={{ marginBottom: '0.4rem' }}>{item}</li>
          ))}
        </ul>
      </div>
    );
  }
  
  export default GuideSection;
  