import { useState, useRef } from 'react'

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

  const rawCallCount   = useRef(0)
  const throttledCount = useRef(0)
  const scrollRef      = useRef(null)
  const throttleOnRef  = useRef(throttleOn)

  function addLog(msg, type) {
    setLog(prev => [{ msg, type, id: Date.now() + Math.random() }, ...prev.slice(0, 18)])
  }

  const throttledHandler = useRef(
    throttle(() => {
      if (!throttleOnRef.current) return
      const el = scrollRef.current
      if (!el) return
      const y   = Math.round(el.scrollTop)
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      throttledCount.current += 1
      setCallCount(c => c + 1)
      setScrollY(y)
      setProgressWidth(pct)
      addLog(`scroll → y=${y}px  (handler ran, 200ms gap enforced)`, 'green')
    }, 200)
  ).current

  function onScroll(e) {
    rawCallCount.current += 1
    throttleOnRef.current = throttleOn

    if (throttleOn) {
      throttledHandler(e)
      setSavedCalls(rawCallCount.current - throttledCount.current)
    } else {
      const el = e.target
      const y   = Math.round(el.scrollTop)
      const pct = Math.round((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      throttledCount.current += 1
      setCallCount(c => c + 1)
      setScrollY(y)
      setProgressWidth(pct)
      addLog(`scroll → y=${y}px  (handler ran)`, 'red')
    }
  }

  function handleToggle() {
    setThrottleOn(v => !v)
    throttleOnRef.current = !throttleOn
    setLog([])
    setCallCount(0)
    setSavedCalls(0)
    rawCallCount.current   = 0
    throttledCount.current = 0
    setProgressWidth(0)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }

  const fakeRows = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    label: `List item ${i + 1}`,
    width: 30 + ((i * 37) % 60),
  }))

  return (
    <div>
      <div className="demo-header">
        <h2>Throttling — Scroll Event Control</h2>
        <p>
          Scroll events fire dozens of times per second. Without throttling every single
          one runs your handler. Throttling limits execution to once every 200ms no
          matter how fast you scroll.
        </p>
      </div>

      <div className="demo-controls">
        <button className={throttleOn ? 'active-green' : 'active-red'} onClick={handleToggle}>
          {throttleOn ? '✓ Throttle ON (200ms)' : '✗ Throttle OFF'}
        </button>
      </div>

      <div className={`explanation-box ${throttleOn ? 'green' : 'red'}`}>
        {throttleOn ? (
          <>
            <strong className="green">Throttle is ON.</strong> No matter how fast you scroll,
            the handler runs at most once every 200ms. All intermediate events are
            intentionally ignored — saving CPU and keeping the UI smooth.
          </>
        ) : (
          <>
            <strong className="red">Throttle is OFF.</strong> Every scroll event calls the
            handler immediately. Scroll quickly and you'll see dozens of calls per
            second — each one updating state and triggering re-renders.
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="stats-grid stats-grid-4">
          <div className="stat-item">
            <div className="stat-label">Handler Calls</div>
            <div className={`stat-value ${throttleOn ? 'green' : 'red'}`}>{callCount}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Calls Skipped</div>
            <div className="stat-value amber">{throttleOn ? savedCalls : 0}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Scroll Y</div>
            <div className="stat-value blue">{scrollY}px</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Progress</div>
            <div className="stat-value white">{progressWidth}%</div>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <div className="progress-bar-label">SCROLL PROGRESS</div>
          <div className="progress-bar-track">
            <div
              className={`progress-bar-fill ${throttleOn ? 'green' : 'red'}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
        </div>
      </div>

      <div className="throttle-grid">
        <div>
          <div className="scroll-box-label">SCROLL THIS BOX ↓</div>
          <div ref={scrollRef} onScroll={onScroll} className="scroll-box">
            {fakeRows.map(row => (
              <div key={row.id} className="scroll-item">
                <span>{row.label}</span>
                <div className="scroll-item-bar" style={{ width: `${row.width}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="scroll-box-label">HANDLER EXECUTION LOG</div>
          <div className="log-box" style={{ height: '300px' }}>
            {log.length === 0 && (
              <div className="log-line log-gray">// scroll the box to see events fire...</div>
            )}
            {log.map(l => (
              <div key={l.id} className={`log-line log-${l.type}`}>{l.msg}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThrottleDemo