import { useState } from 'react'
import { BUNDLES } from '../data/mockData'

function BundleDemo() {
  const [splitOn, setSplitOn]       = useState(true)
  const [loadedChunks, setLoaded]   = useState(['main.js'])
  const [log, setLog]               = useState([])
  const [activeRoute, setActiveRoute] = useState('Home')

  const routes = [
    { name: 'Home',      chunk: 'main.js',          size: 210 },
    { name: 'Dashboard', chunk: 'recharts.js',       size: 90  },
    { name: 'Animation', chunk: 'framer-motion.js',  size: 68  },
    { name: 'Vendors',   chunk: 'vendor.js',         size: 480 },
  ]

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() }, ...prev.slice(0, 14)])
  }

  function handleRouteClick(route) {
    setActiveRoute(route.name)
    if (!splitOn) {
      addLog(`Navigated to ${route.name} → no new load (everything was loaded upfront)`, 'amber')
      return
    }
    if (loadedChunks.includes(route.chunk)) {
      addLog(`Navigated to ${route.name} → ${route.chunk} already cached, instant ✓`, 'green')
    } else {
      setLoaded(prev => [...prev, route.chunk])
      addLog(`Navigated to ${route.name} → lazy loaded ${route.chunk} (${route.size}kb)`, 'green')
    }
  }

  function handleToggle() {
    setSplitOn(v => !v)
    setLog([])
    setActiveRoute('Home')
    if (splitOn) {
      setLoaded(BUNDLES.map(b => b.name))
      addLog('Code splitting OFF → all chunks loaded upfront on initial visit', 'red')
    } else {
      setLoaded(['main.js'])
      addLog('Code splitting ON → only main.js loads on initial visit', 'green')
    }
  }

  const totalRaw       = BUNDLES.reduce((s, b) => s + b.raw, 0)
  const initialLoad    = splitOn ? BUNDLES.find(b => b.name === 'main.js').optimized : totalRaw
  const sessionLoad    = splitOn
    ? BUNDLES.filter(b => loadedChunks.includes(b.name)).reduce((s, b) => s + b.optimized, 0)
    : totalRaw

  return (
    <div>
      <div className="demo-header">
        <h2>Code Splitting — Load Only What You Need</h2>
        <p>
          Without code splitting the browser downloads your entire app on first visit.
          With splitting only the current route loads — the rest load on demand.
        </p>
      </div>

      <div className="demo-controls">
        <button className={splitOn ? 'active-green' : 'active-red'} onClick={handleToggle}>
          {splitOn ? '✓ Code Splitting ON' : '✗ Code Splitting OFF'}
        </button>
      </div>

      <div className={`explanation-box ${splitOn ? 'green' : 'red'}`}>
        {splitOn ? (
          <>
            <strong className="green">Code Splitting is ON.</strong> On first visit only{' '}
            <strong>main.js (210kb)</strong> loads. Each route's chunk loads lazily
            when the user navigates there.
          </>
        ) : (
          <>
            <strong className="red">Code Splitting is OFF.</strong> The browser downloads
            all <strong>{totalRaw}kb</strong> on the very first visit — including code
            for pages the user may never visit.
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="stats-grid stats-grid-3">
          <div className="stat-item">
            <div className="stat-label">Initial Load</div>
            <div className={`stat-value ${splitOn ? 'green' : 'red'}`}>{initialLoad}kb</div>
            <div className="stat-sublabel">{splitOn ? 'only main chunk' : 'entire app'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Loaded This Session</div>
            <div className="stat-value blue">{sessionLoad}kb</div>
            <div className="stat-sublabel">{loadedChunks.length} of {BUNDLES.length} chunks</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Saved on First Visit</div>
            <div className="stat-value amber">{totalRaw - initialLoad}kb</div>
            <div className="stat-sublabel">
              {splitOn ? `${Math.round((1 - initialLoad / totalRaw) * 100)}% reduction` : 'no savings'}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="log-section-label" style={{ marginBottom: '1rem' }}>
          SIMULATE NAVIGATION — click a route to see what loads
        </div>

        <div className="route-buttons">
          {routes.map(route => (
            <button
              key={route.name}
              onClick={() => handleRouteClick(route)}
              className={`route-btn ${activeRoute === route.name ? 'route-active' : ''}`}
            >
              {route.name}
            </button>
          ))}
        </div>

        <div>
          {BUNDLES.map(bundle => {
            const isLoaded    = loadedChunks.includes(bundle.name)
            const displaySize = splitOn ? bundle.optimized : bundle.raw
            const barWidth    = splitOn
              ? (bundle.optimized / totalRaw) * 100
              : (bundle.raw / totalRaw) * 100

            return (
              <div key={bundle.name} className="bundle-row">
                <div className="bundle-meta">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className={`bundle-name ${isLoaded ? 'loaded' : 'unloaded'}`}>
                      {bundle.name}
                    </span>
                    <span className={isLoaded ? 'tag tag-green' : 'tag tag-inactive'}>
                      {isLoaded ? 'loaded' : 'not loaded'}
                    </span>
                  </div>
                  <span className="bundle-size-label">
                    {displaySize}kb
                    {splitOn && (
                      <span className="bundle-size-saved">
                        ↓{Math.round((1 - bundle.optimized / bundle.raw) * 100)}%
                      </span>
                    )}
                  </span>
                </div>
                <div className="bundle-bar-track">
                  <div
                    className="bundle-bar-fill"
                    style={{
                      width: isLoaded ? `${barWidth}%` : '0%',
                      background: isLoaded ? '#34d399' : '#333',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="log-section-label">NAVIGATION LOG</div>
      <div className="log-box">
        {log.length === 0 && (
          <div className="log-line log-gray">// click a route above to simulate navigation...</div>
        )}
        {log.map(l => (
          <div key={l.id} className={`log-line log-${l.type}`}>{l.msg}</div>
        ))}
      </div>
    </div>
  )
}

export default BundleDemo