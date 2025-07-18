import { useState } from 'react';
import GuideSection from '../components/guide/GuideSection';
import { guideData } from '../data/guideData';

const fallbackLang = navigator.language.startsWith('ko')
  ? 'ko'
  : navigator.language.startsWith('ja')
  ? 'ja'
  : navigator.language.startsWith('zh')
  ? 'zh'
  : 'en';

const LANG_LABELS = {
  ko: '한국어',
  en: 'English',
  ja: '日本語',
  zh: '中文',
};

function GuidePage() {
  const [lang, setLang] = useState(fallbackLang);
  const { title, sections } = guideData[lang];

  return (
    <div
      style={{
        width: '100vw',       // 화면 너비만큼
        minHeight: '100vh',   // 화면 높이만큼
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f9f5ee',
        padding: '2rem 1rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: '1000px',
          width: '100%',
          fontFamily: 'sans-serif',
        }}
      >
          {/* 언어 선택 버튼 */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            {Object.keys(LANG_LABELS).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  margin: '0 0.3rem',
                  padding: '0.4rem 0.8rem',
                  border: lang === code ? '2px solid #b35c38' : '1px solid #ccc',
                  backgroundColor: lang === code ? '#fff5ef' : '#fff',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: lang === code ? 'bold' : 'normal',
                }}
              >
                {LANG_LABELS[code]}
              </button>
            ))}
          </div>

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
