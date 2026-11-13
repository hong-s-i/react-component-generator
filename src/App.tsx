import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useLocalStorage('component-studio.api-key', '', (value) => typeof value === 'string' ? value : '');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useLocalStorage<Provider>('component-studio.provider', 'google', (value) => value === 'anthropic' ? value : 'google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, promptHistory, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;

  return (
    <div className="app">
      <header className="app-header">
        <a className="brand" href="./" aria-label="Component Studio 홈">
          <span className="brand-mark" aria-hidden="true">rc<span>✳</span></span>
          <span>Component Studio<span className="brand-subtitle">React로 만드는 작은 아이디어</span></span>
        </a>
        <div className="header-meta" aria-label="현재 작업 상태">
          <span className="connection-dot" aria-hidden="true" />
          <span>{activeProvider}</span><span className="meta-divider" />
          <span>컴포넌트 <strong>{components.length}</strong>개</span>
        </div>
      </header>
      <section className="studio-intro" aria-labelledby="intro-title">
        <div className="intro-copy">
          <span className="intro-note">아이디어가 UI가 되는 작업실</span>
          <h1 id="intro-title">머릿속 그 컴포넌트,<br />이제 화면으로.</h1>
          <p>필요한 UI를 말로 적어보세요.<br />React 컴포넌트를 만들고, 미리보고, 코드로 가져가세요.</p>
          <div className="intro-footnote"><span aria-hidden="true">✳</span> 작은 아이디어도, 쓸모 있는 컴포넌트로.</div>
        </div>
        <div className="desktop-scene" aria-hidden="true">
          <div className="scene-orbit" />
          <div className="retro-window code-window">
            <div className="window-bar">▤ idea.tsx <span className="window-controls">− □</span></div>
            <div className="demo-code"><span>const</span> YourIdea = () =&gt; (<br />&nbsp; &lt;<b>SomethingGood</b><br />&nbsp;&nbsp;&nbsp; madeWith="React"<br />&nbsp; /&gt;<br />);<i>▌</i></div>
          </div>
          <div className="retro-window demo-window">
            <div className="window-bar">◈ preview <span className="window-controls">□</span></div>
            <div className="demo-body"><span className="demo-flower">✳</span><strong>Hello, idea!</strong><p>상상이 제법 그럴듯해졌죠?</p><span className="demo-button">만들어볼까요? ↗</span></div>
          </div>
          <span className="scene-cursor">➤</span>
          <span className="scene-sticker">생각을<br />실행으로!</span>
        </div>
      </section>

      <main className="workspace">
        <section className="composer-panel" aria-label="컴포넌트 생성">
          <PromptInput onGenerate={handleGenerate} isLoading={isLoading} promptHistory={promptHistory} />
        </section>

        <aside className="settings-panel" aria-label="실행 설정">
          <div className="settings-header">
            <span className="panel-kicker">연결 설정</span>
            <h2>함께 만들 AI</h2>
          </div>
          <div className="provider-select">
            <label htmlFor="provider">AI 제공자</label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as Provider)}
            >
              {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div className="api-key-input">
            <label htmlFor="api-key">
              API 키
            </label>
            <div className="api-key-field">
              <input
                id="api-key"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={
                  hasEnvKey
                    ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                    : PROVIDER_CONFIG[provider].placeholder
                }
              />
              <button
                className="btn-toggle-key"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? '숨기기' : '보기'}
              </button>
            </div>
            <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
              {hasEnvKey ? '.env 키가 연결되어 있습니다.' : '직접 입력하거나 서버 환경변수를 설정하세요.'}
            </p>
          </div>
        </aside>
      </main>

      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
        </div>
      )}

      <section className="results-section">
        <div className="results-header">
            <div>
              
              <h2>작업한 컴포넌트 <span className="result-count">{components.length}</span></h2>
            </div>
            {components.length > 0 ? <button className="btn-clear" onClick={clearAll}>전체 삭제</button> : <span className="results-hint">아이디어를 기다리는 중</span>}
          </div>

        {components.length === 0 && !isLoading && (
          <div className="empty-state">
            <div className="empty-symbol" aria-hidden="true"><span>＋</span><i>✳</i></div>
            <div className="empty-copy">
              <h2>첫 번째 아이디어를 기다리고 있어요.</h2>
              <p>위에 만들고 싶은 UI를 적거나, 예시를 골라 시작하세요.<br />완성된 컴포넌트는 이곳에 차곡차곡 모입니다.</p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="loading-card">
            <div className="loading-pulse" />
            <p>컴포넌트를 생성하고 있습니다...</p>
          </div>
        )}

        <div className="results-grid">
          {components.map((component) => (
            <ComponentCard
              key={component.id}
              component={component}
              onRemove={removeComponent}
              onRegenerate={handleGenerate}
              isLoading={isLoading}
            />
          ))}
        </div>
      </section>
      <footer className="app-footer"><span>Component Studio</span><span>생각은 자유롭게. 만드는 건 가볍게.</span><span>Built with React ♡</span></footer>
    </div>
  );
}

export default App;
