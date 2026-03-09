import { useState, useEffect, useRef, useCallback } from 'react'

// the core throttle function — plain JS, no library
// allows fn to run at most once every `limit` ms
function throttle(fn, limit) {
  let lastCall = 0
  return function (...args) {
    const now = Date.now()
    if (now - lastCall >= limit) {
      lastCall = now
      fn(...args)
    }
  }
}

function ThrottleDemo() {
  const [throttleOn, setThrottleOn]       = useState(true)
  const [scrollY, setScrollY]             = useState(0)
  const [callCount, setCallCount]         = useState(0)
  const [savedCalls, setSavedCalls]       = useState(0)
  const [log, setLog]                     = useState([])
  const [progressWidth, setProgressWidth] = useState(0)

  const rawCallCount    = useRef(0)
  const throttledCount  = useRef(0)
  const scrollRef       = useRef(null)
  const throttleOnRef   = useRef(throttleOn)

  // keep ref in sync with state so throttled fn always sees latest value
  useEffect(() => { throttleOnRef.current = throttleOn }, [throttleOn])

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() + Math.random() }, ...prev.slice(0, 18)])
  }

  // raw handler — fires on every single scroll event
  function handleRawScroll(e) {
    const el = e.target
    const y  = Math.round(el.scrollTop)
    const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)

    rawCallCount.current += 1
    setScrollY(y)
    setProgressWidth(pct)

    if (!throttleOnRef.current) {
      // without throttle — every event updates state and logs
      throttledCount.current += 1
      setCallCount(c => c + 1)
      addLog(`scroll event fired → y=${y}px  (handler ran)`, 'red')
    }
  }

  // throttled handler — same work, but max once per 200ms
  const throttledScroll = useRef(
    throttle((e) => {
      if (!throttleOnRef.current) return
      const el = scrollRef.current
      if (!el) return
      const y   = Math.round(el.scrollTop)
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)

      throttledCount.current += 1
      setCallCount(c => c + 1)
      setScrollY(y)
      setProgressWidth(pct)
      addLog(`scroll event fired → y=${y}px  (handler ran, ~200ms gap enforced)`, 'green')
    }, 200)
  ).current

  // attach both listeners to the scrollable div
  function onScroll(e) {
    // always count raw events so we can show how many were skipped
    rawCallCount.current += 1

    if (throttleOnRef.current) {
      throttledScroll(e)
      // calculate skipped calls
      setSavedCalls(rawCallCount.current - throttledCount.current)
    } else {
      handleRawScroll(e)
    }
  }

  function handleToggle() {
    setThrottleOn(v => !v)
    setLog([])
    setCallCount(0)
    setSavedCalls(0)
    rawCallCount.current   = 0
    throttledCount.current = 0
    setProgressWidth(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  // fake long content inside the scroll box
  const fakeRows = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    label: `List item ${i + 1}`,
    width: 30 + ((i * 37) % 60),
  }))

  return (
    <div>
      <h2 style={{ marginBottom: '0.4rem' }}>Throttling — Scroll Event Control</h2>
      <p style={{ marginBottom: '2rem' }}>
        Scroll events fire dozens of times per second. Without throttling every single
        one runs your handler — causing layout thrashing and janky UI. Throttling limits
        execution to once every 200ms no matter how fast you scroll.
      </p>

      {/* toggle */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className={throttleOn ? 'active-green' : 'active-red'}
          onClick={handleToggle}
        >
          {throttleOn ? '✓ Throttle ON (200ms)' : '✗ Throttle OFF'}
        </button>
      </div>

      {/* explanation */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        border: `1px solid ${throttleOn ? '#34d399' : '#f87171'}`,
        background: throttleOn ? '#0d2b1a' : '#2b0d0d',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        lineHeight: '1.7',
        color: '#ccc',
      }}>
        {throttleOn ? (
          <>
            <strong style={{ color: '#34d399' }}>Throttle is ON.</strong> No matter how fast
            you scroll, the handler runs at most once every{' '}
            <strong style={{ color: '#34d399' }}>200ms</strong>. All intermediate scroll
            events are intentionally ignored — saving CPU and keeping the UI smooth.
          </>
        ) : (
          <>
            <strong style={{ color: '#f87171' }}>Throttle is OFF.</strong> Every scroll event
            calls the handler immediately. Scroll quickly and you'll see{' '}
            <strong style={{ color: '#f87171' }}>dozens of calls per second</strong> — each
            one doing work, updating state, and triggering re-renders.
          </>
        )}
      </div>

      {/* stats */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#555', marginBottom: '6px' }}>HANDLER CALLS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: throttleOn ? '#34d399' : '#f87171' }}>
              {callCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#555', marginBottom: '6px' }}>CALLS SKIPPED</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fbbf24' }}>
              {throttleOn ? savedCalls : 0}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#555', marginBottom: '6px' }}>SCROLL Y</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa' }}>
              {scrollY}px
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.68rem', color: '#555', marginBottom: '6px' }}>PROGRESS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#e0e0e0' }}>
              {progressWidth}%
            </div>
          </div>
        </div>

        {/* scroll progress bar */}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '5px' }}>SCROLL PROGRESS</div>
          <div style={{ height: '6px', background: '#222', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${progressWidth}%`,
              background: throttleOn ? '#34d399' : '#f87171',
              borderRadius: '3px',
              transition: throttleOn ? 'width 0.2s ease' : 'none',
            }} />
          </div>
        </div>
      </div>

      {/* scrollable box + log side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

        {/* scrollable content */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '0.4rem' }}>
            SCROLL THIS BOX ↓
          </div>
          <div
            ref={scrollRef}
            onScroll={onScroll}
            style={{
              height: '300px',
              overflowY: 'scroll',
              background: '#0f0f0f',
              border: '1px solid #2a2a2a',
              borderRadius: '8px',
              padding: '0.75rem',
            }}
          >
            {fakeRows.map(row => (
              <div key={row.id} style={{
                padding: '0.6rem 0.75rem',
                marginBottom: '5px',
                background: '#1a1a1a',
                borderRadius: '5px',
                border: '1px solid #222',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.82rem', color: '#999' }}>{row.label}</span>
                <div style={{
                  height: '6px',
                  width: `${row.width}%`,
                  maxWidth: '100px',
                  background: '#2a2a2a',
                  borderRadius: '3px',
                }} />
              </div>
            ))}
          </div>
        </div>

        {/* live log */}
        <div>
          <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '0.4rem' }}>
            HANDLER EXECUTION LOG
          </div>
          <div className='log-box' style={{ height: '300px' }}>
            {log.length === 0 && (
              <div className='log-line log-gray'>// scroll the box to see events fire...</div>
            )}
            {log.map(l => (
              <div key={l.id} className={`log-line log-${l.type}`}>
                {l.msg}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  )
}

export default ThrottleDemo