import { useState } from 'react'
import { BUNDLES } from '../data/mockData'

// simulates what code splitting actually does
// without splitting → entire app loads upfront
// with splitting    → only current route's chunk loads, rest load on demand
function BundleDemo() {
  const [splitOn, setSplitOn] = useState(true)
  const [loadedChunks, setLoadedChunks] = useState(['main.js'])
  const [log, setLog] = useState([])
  const [activeRoute, setActiveRoute] = useState('Home')

  const routes = [
    { name: 'Home',      chunk: 'main.js',           size: 210 },
    { name: 'Dashboard', chunk: 'recharts.js',        size: 90  },
    { name: 'Animation', chunk: 'framer-motion.js',   size: 68  },
    { name: 'Vendors',   chunk: 'vendor.js',          size: 480 },
  ]

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() }, ...prev.slice(0, 14)])
  }

  function handleRouteClick(route) {
    setActiveRoute(route.name)

    if (!splitOn) {
      // without splitting — everything already loaded upfront, no new network request
      // but initial load was massive
      addLog(`Navigated to ${route.name} → no new load (everything was loaded upfront)`, 'amber')
      return
    }

    // with splitting — load only this route's chunk on demand
    if (loadedChunks.includes(route.chunk)) {
      addLog(`Navigated to ${route.name} → ${route.chunk} already cached, instant load ✓`, 'green')
    } else {
      setLoadedChunks(prev => [...prev, route.chunk])
      addLog(`Navigated to ${route.name} → lazy loaded ${route.chunk} (${route.size}kb) on demand`, 'green')
    }
  }

  function handleToggle() {
    setSplitOn(v => !v)
    setLog([])
    setActiveRoute('Home')

    if (splitOn) {
      // turning OFF — simulate everything loading upfront
      setLoadedChunks(BUNDLES.map(b => b.name))
      addLog('Code splitting OFF → all chunks loaded upfront on initial visit', 'red')
    } else {
      // turning ON — reset to only main loaded
      setLoadedChunks(['main.js'])
      addLog('Code splitting ON → only main.js loads on initial visit', 'green')
    }
  }

  // what user downloads on first visit
  const initialLoad = splitOn
    ? BUNDLES.find(b => b.name === 'main.js').optimized
    : BUNDLES.reduce((sum, b) => sum + b.raw, 0)

  // what's loaded so far in this session
  const sessionLoad = splitOn
    ? BUNDLES
        .filter(b => loadedChunks.includes(b.name))
        .reduce((sum, b) => sum + b.optimized, 0)
    : BUNDLES.reduce((sum, b) => sum + b.raw, 0)

  return (
    <div>
      <h2 style={{ marginBottom: '0.4rem' }}>Code Splitting — Load Only What You Need</h2>
      <p style={{ marginBottom: '2rem' }}>
        Without code splitting the browser downloads your entire app on the first visit.
        With splitting, only the current route loads. The rest load on demand when the
        user navigates there — making the initial page load significantly faster.
      </p>

      {/* toggle */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className={splitOn ? 'active-green' : 'active-red'}
          onClick={handleToggle}
        >
          {splitOn ? '✓ Code Splitting ON' : '✗ Code Splitting OFF'}
        </button>
      </div>

      {/* explanation */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        border: `1px solid ${splitOn ? '#34d399' : '#f87171'}`,
        background: splitOn ? '#0d2b1a' : '#2b0d0d',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        lineHeight: '1.7',
        color: '#ccc',
      }}>
        {splitOn ? (
          <>
            <strong style={{ color: '#34d399' }}>Code Splitting is ON.</strong> On first visit
            only <strong style={{ color: '#34d399' }}>main.js (210kb)</strong> loads.
            Each route's chunk loads lazily when the user navigates there.
            Once cached, subsequent visits are instant.
          </>
        ) : (
          <>
            <strong style={{ color: '#f87171' }}>Code Splitting is OFF.</strong> The browser
            downloads <strong style={{ color: '#f87171' }}>all {BUNDLES.reduce((s, b) => s + b.raw, 0)}kb</strong> on
            the very first visit — including code for pages the user may never even visit.
          </>
        )}
      </div>

      {/* stats */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>
              INITIAL LOAD
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: splitOn ? '#34d399' : '#f87171' }}>
              {initialLoad}kb
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
              {splitOn ? 'only main chunk' : 'entire app'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>
              LOADED THIS SESSION
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#60a5fa' }}>
              {sessionLoad}kb
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
              {loadedChunks.length} of {BUNDLES.length} chunks
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>
              SAVED ON FIRST VISIT
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24' }}>
              {BUNDLES.reduce((s, b) => s + b.raw, 0) - initialLoad}kb
            </div>
            <div style={{ fontSize: '0.75rem', color: '#555', marginTop: '4px' }}>
              {splitOn ? `${Math.round((1 - initialLoad / BUNDLES.reduce((s,b)=>s+b.raw,0)) * 100)}% reduction` : 'no savings'}
            </div>
          </div>
        </div>
      </div>

      {/* simulate navigation */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '1rem' }}>
          SIMULATE NAVIGATION — click a route to see what loads
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {routes.map(route => (
            <button
              key={route.name}
              onClick={() => handleRouteClick(route)}
              style={{
                background: activeRoute === route.name ? '#fff' : '#0f0f0f',
                color:      activeRoute === route.name ? '#000' : '#888',
                border: '1px solid',
                borderColor: activeRoute === route.name ? '#fff' : '#333',
                borderRadius: '6px',
                padding: '0.4rem 1rem',
                fontSize: '0.82rem',
              }}
            >
              {route.name}
            </button>
          ))}
        </div>

        {/* bundle breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {BUNDLES.map(bundle => {
            const isLoaded = loadedChunks.includes(bundle.name)
            const displaySize = splitOn ? bundle.optimized : bundle.raw

            return (
              <div key={bundle.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: isLoaded ? '#e0e0e0' : '#444' }}>
                      {bundle.name}
                    </span>
                    {isLoaded
                      ? <span className='tag tag-green'>loaded</span>
                      : <span className='tag' style={{ background: '#1a1a1a', color: '#444', border: '1px solid #2a2a2a' }}>not loaded</span>
                    }
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#555' }}>
                    {displaySize}kb
                    {splitOn && (
                      <span style={{ color: '#34d399', marginLeft: '6px' }}>
                        ↓{Math.round((1 - bundle.optimized / bundle.raw) * 100)}%
                      </span>
                    )}
                  </span>
                </div>

                {/* progress bar */}
                <div style={{ height: '5px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    borderRadius: '3px',
                    width: isLoaded ? `${(displaySize / BUNDLES.reduce((s,b)=>s+b.raw,0)) * 100 * (splitOn ? 1 : 2.5)}%` : '0%',
                    background: isLoaded ? '#34d399' : '#333',
                    transition: 'width 0.6s ease',
                    opacity: isLoaded ? 1 : 0.3,
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* log */}
      <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.4rem' }}>
        NAVIGATION LOG
      </div>
      <div className='log-box'>
        {log.length === 0 && (
          <div className='log-line log-gray'>// click a route above to simulate navigation...</div>
        )}
        {log.map(l => (
          <div key={l.id} className={`log-line log-${l.type}`}>
            {l.msg}
          </div>
        ))}
      </div>

    </div>
  )
}

export default BundleDemo