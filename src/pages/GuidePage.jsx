import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuideSection from '../components/guide/GuideSection';
import { guideData } from '../data/guide/guideData';

const FALLBACK_LANG = (() => {
  if (typeof navigator === 'undefined') {
    return 'en';
  }
  if (navigator.language.startsWith('ko')) return 'ko';
  if (navigator.language.startsWith('ja')) return 'ja';
  if (navigator.language.startsWith('zh')) return 'zh';
  return 'en';
})();

const LANG_LABELS = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

function GuidePage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState(FALLBACK_LANG);
  const { title, sections } = guideData[lang];

  const langButtons = useMemo(
    () =>
      Object.keys(LANG_LABELS).map((code) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          style={{
            margin: '0 0.25rem',
            padding: '0.4rem 0.8rem',
            border: lang === code ? '2px solid #b35c38' : '1px solid #d9d4cf',
            backgroundColor: lang === code ? '#fff8f2' : '#fff',
            borderRadius: '999px',
            cursor: 'pointer',
            fontWeight: lang === code ? 'bold' : 'normal',
            transition: 'all 0.2s ease',
          }}
        >
          {LANG_LABELS[code]}
        </button>
      )),
    [lang],
  );

  return (
    <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#f9f5ee' }}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          backgroundColor: 'rgba(249, 245, 238, 0.95)',
          backdropFilter: 'blur(6px)',
          borderBottom: '1px solid rgba(179, 92, 56, 0.15)',
          zIndex: 1000,
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>{langButtons}</div>
          <button
            onClick={() => navigate('/menu')}
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: '#b35c38',
              color: '#fff',
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
              fontWeight: 'bold',
              boxShadow: '0 2px 6px rgba(179, 92, 56, 0.25)',
            }}
          >
            메뉴판 보기
          </button>
        </div>
      </div>
      <div
        style={{
          padding: '6.5rem 1rem 2rem',
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          fontFamily: 'sans-serif',
        }}
      >
          {/* 제목 */}
          <h1
            style={{
              textAlign: 'center',
              color: '#3c2a1e',
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
            }}
          >
            {title}
          </h1>

          {/* 섹션들 */}
          {sections.map((section, idx) => (
            <GuideSection key={idx} title={section.title} items={section.items} />
          ))}

          <div style={{ textAlign: 'center', color: '#aaa', marginTop: '2rem' }}>Lilliput</div>
      </div>
    </div>
  );
}

export default GuidePage;
