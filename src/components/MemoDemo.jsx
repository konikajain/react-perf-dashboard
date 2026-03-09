import { useState, useMemo } from 'react'

// genuinely expensive — sieve of eratosthenes
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
  const [limit, setLimit]         = useState(300000)
  const [memoOn, setMemoOn]       = useState(true)
  const [counter, setCounter]     = useState(0)
  const [log, setLog]             = useState([])

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() }, ...prev.slice(0, 11)])
  }

  // WITH memo — only recalculates when limit changes
  const memoizedResult = useMemo(() => {
    if (!memoOn) return null
    const start = performance.now()
    const primes = getPrimes(limit)
    const ms = (performance.now() - start).toFixed(2)
    return { primes, ms }
  }, [limit, memoOn])

  // WITHOUT memo — recalculates on every render
  let liveResult = null
  if (!memoOn) {
    const start = performance.now()
    const primes = getPrimes(limit)
    const ms = (performance.now() - start).toFixed(2)
    liveResult = { primes, ms }
  }

  const result = memoOn ? memoizedResult : liveResult
  const isFromCache = memoOn

  // unrelated button — just triggers a re-render
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
    const val = Number(e.target.value)
    setLimit(val)
    setLog([])
    addLog(`Limit changed to ${val.toLocaleString()} → recalculating...`, 'amber')
  }

  function handleToggle() {
    setMemoOn(v => !v)
    setLog([])
    setCounter(0)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.4rem' }}>useMemo — Real Computation Test</h2>
      <p style={{ marginBottom: '2rem' }}>
        Finding all prime numbers is expensive. Toggle memo off and click the unrelated
        button — the browser recalculates every prime from scratch on each click,
        even though the limit never changed.
      </p>

      {/* controls */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button
          className={memoOn ? 'active-green' : 'active-red'}
          onClick={handleToggle}
        >
          {memoOn ? '✓ useMemo ON' : '✗ useMemo OFF'}
        </button>

        <button onClick={handleUnrelatedClick}>
          Trigger re-render #{counter}
        </button>
      </div>

      {/* slider */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          <span style={{ color: '#999', fontSize: '0.85rem' }}>Find all primes up to:</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{limit.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min={50000}
          max={1000000}
          step={50000}
          value={limit}
          onChange={handleLimitChange}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
          <span style={{ fontSize: '0.72rem', color: '#555' }}>50k</span>
          <span style={{ fontSize: '0.72rem', color: '#555' }}>1,000k</span>
        </div>
      </div>

      {/* result */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>PRIMES FOUND</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#34d399' }}>
              {result?.primes.length.toLocaleString() ?? '—'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>LAST CALC TIME</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#fbbf24' }}>
              {result?.ms ?? '—'}ms
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '6px' }}>ON RE-RENDER</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '6px' }}>
              {isFromCache
                ? <span style={{ color: '#34d399' }}>reads cache ✓</span>
                : <span style={{ color: '#f87171' }}>recalculates ✗</span>
              }
            </div>
          </div>

        </div>
      </div>

      {/* explanation box */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        border: `1px solid ${memoOn ? '#34d399' : '#f87171'}`,
        background: memoOn ? '#0d2b1a' : '#2b0d0d',
        marginBottom: '1.25rem',
        fontSize: '0.88rem',
        lineHeight: '1.7',
        color: '#ccc',
      }}>
        {memoOn ? (
          <>
            <strong style={{ color: '#34d399' }}>useMemo is ON.</strong> getPrimes() ran once
            when you moved the slider. Now clicking "Trigger re-render" causes a re-render
            but React returns the <strong style={{ color: '#34d399' }}>cached result</strong> —
            getPrimes() is never called again unless the limit changes.
          </>
        ) : (
          <>
            <strong style={{ color: '#f87171' }}>useMemo is OFF.</strong> Every time anything
            causes a re-render — even the unrelated counter button —
            getPrimes() runs <strong style={{ color: '#f87171' }}>from scratch</strong>.
            Watch the log. The browser is doing {result?.ms}ms of work it doesn't need to.
          </>
        )}
      </div>

      {/* log */}
      <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.4rem' }}>
        RE-RENDER LOG
      </div>
      <div className='log-box'>
        {log.length === 0 && (
          <div className='log-line log-gray'>// click "Trigger re-render" to see what happens...</div>
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

export default MemoDemo