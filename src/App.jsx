import { useState } from 'react'
import MemoDemo     from './components/MemoDemo'
import DebounceDemo from './components/DebounceDemo'
import BundleDemo   from './components/BundleDemo'
import ThrottleDemo from './components/ThrottleDemo'

const TABS = ['useMemo', 'useDebounce', 'Code Splitting', 'Throttling']

function App() {
  const [tab, setTab] = useState(0)

  return (
    <div>
      <div className="app-header">
        <div className="app-header-title">
          <h1>React Performance Lab</h1>
          <p>Real optimization techniques — not simulated</p>
        </div>
        <div className="app-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`tab-btn ${tab === i ? 'tab-active' : ''}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="app-content">
        {tab === 0 && <MemoDemo />}
        {tab === 1 && <DebounceDemo />}
        {tab === 2 && <BundleDemo />}
        {tab === 3 && <ThrottleDemo />}
      </div>
    </div>
  )
}

export default App