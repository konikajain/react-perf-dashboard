import { useState } from 'react'
import MemoDemo     from './components/MemoDemo'
import DebounceDemo from './components/DebounceDemo'
import BundleDemo   from './components/BundleDemo'
import ThrottleDemo from './components/ThrottleDemo'

const TABS = ['useMemo', 'useDebounce', 'Code Splitting', 'Throttling']

function App() {
  const [tab, setTab] = useState(0)

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* header */}
      <div style={{ borderBottom: '1px solid #222', padding: '1.25rem 2rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>React Performance Lab</h1>
          <p style={{ fontSize: '0.78rem', marginTop: '2px' }}>Real optimization techniques — not simulated</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              style={{
                background:  tab === i ? '#fff' : '#1a1a1a',
                color:       tab === i ? '#000' : '#888',
                border:      '1px solid',
                borderColor: tab === i ? '#fff' : '#2a2a2a',
                borderRadius: '6px',
                padding: '0.4rem 1rem',
                fontSize: '0.82rem',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* content */}
      <div style={{ padding: '2.5rem 2rem', maxWidth: '860px', margin: '0 auto' }}>
        {tab === 0 && <MemoDemo />}
        {tab === 1 && <DebounceDemo />}
        {tab === 2 && <BundleDemo />}
        {tab === 3 && <ThrottleDemo />}
      </div>

    </div>
  )
}

export default App