import { useState, useMemo } from 'react'

function getPrimes(n) {
  const sieve = Array(n + 1).fill(true)
  sieve[0] = false
  sieve[1] = false
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (sieve[i]) {
      for (let j = i * i; j <= n; j += i) {
        sieve[j] = false
      }
    }
  }
  return sieve.reduce((acc, val, idx) => (val ? [...acc, idx] : acc), [])
}

function MemoDemo() {
  const [limit, setLimit]     = useState(300000)
  const [memoOn, setMemoOn]   = useState(true)
  const [counter, setCounter] = useState(0)
  const [log, setLog]         = useState([])

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() }, ...prev.slice(0, 11)])
  }

  const memoizedResult = useMemo(() => {
    if (!memoOn) return null
    const start = performance.now()
    const primes = getPrimes(limit)
    const ms = (performance.now() - start).toFixed(2)
    return { primes, ms }
  }, [limit, memoOn])

  let liveResult = null
  if (!memoOn) {
    const start = performance.now()
    const primes = getPrimes(limit)
    const ms = (performance.now() - start).toFixed(2)
    liveResult = { primes, ms }
  }

  const result = memoOn ? memoizedResult : liveResult

  function handleUnrelatedClick() {
    setCounter(c => c + 1)
    if (memoOn) {
      addLog(`Re-render #${counter + 1} → cache hit, getPrimes() skipped (~0ms)`, 'green')
    } else {
      const start = performance.now()
      getPrimes(limit)
      const ms = (performance.now() - start).toFixed(2)
      addLog(`Re-render #${counter + 1} → getPrimes() ran again! (${ms}ms wasted)`, 'red')
    }
  }

  function handleLimitChange(e) {
    setLimit(Number(e.target.value))
    setLog([])
    addLog(`Limit changed to ${Number(e.target.value).toLocaleString()} → recalculating...`, 'amber')
  }

  function handleToggle() {
    setMemoOn(v => !v)
    setLog([])
    setCounter(0)
  }

  return (
    <div>
      <div className="demo-header">
        <h2>useMemo — Real Computation Test</h2>
        <p>
          Finding all prime numbers is expensive. Toggle memo off and click the unrelated
          button — the browser recalculates every prime from scratch on each click,
          even though the limit never changed.
        </p>
      </div>

      <div className="demo-controls">
        <button className={memoOn ? 'active-green' : 'active-red'} onClick={handleToggle}>
          {memoOn ? '✓ useMemo ON' : '✗ useMemo OFF'}
        </button>
        <button onClick={handleUnrelatedClick} style={{ marginLeft: '0.75rem' }}>
          Trigger re-render #{counter}
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="memo-slider-row">
          <span>Find all primes up to:</span>
          <span>{limit.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={1000000}
          step={50000}
          value={limit}
          onChange={handleLimitChange}
        />
        <div className="slider-ticks">
          <span>50k</span>
          <span>1,000k</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="stats-grid stats-grid-3">
          <div className="stat-item">
            <div className="stat-label">Primes Found</div>
            <div className="stat-value green">{result?.primes.length.toLocaleString() ?? '—'}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Last Calc Time</div>
            <div className="stat-value amber">{result?.ms ?? '—'}ms</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">On Re-render</div>
            <div className={`stat-value ${memoOn ? 'green' : 'red'}`} style={{ fontSize: '1.1rem', marginTop: '6px' }}>
              {memoOn ? 'reads cache ✓' : 'recalculates ✗'}
            </div>
          </div>
        </div>
      </div>

      <div className={`explanation-box ${memoOn ? 'green' : 'red'}`}>
        {memoOn ? (
          <>
            <strong className="green">useMemo is ON.</strong> getPrimes() ran once when
            you moved the slider. Clicking "Trigger re-render" causes a re-render but
            React returns the cached result — getPrimes() does not run again unless
            the limit changes.
          </>
        ) : (
          <>
            <strong className="red">useMemo is OFF.</strong> Every re-render —
            including unrelated button clicks — runs getPrimes() from scratch.
            Watch the log. The browser is doing {result?.ms}ms of work it doesn't need to.
          </>
        )}
      </div>

      <div className="log-section-label">RE-RENDER LOG</div>
      <div className="log-box">
        {log.length === 0 && (
          <div className="log-line log-gray">// click "Trigger re-render" to see what happens...</div>
        )}
        {log.map(l => (
          <div key={l.id} className={`log-line log-${l.type}`}>{l.msg}</div>
        ))}
      </div>
    </div>
  )
}

export default MemoDemo