import { useState, useMemo, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { COMPONENT_ITEMS } from '../data/mockData'

function DebounceDemo() {
  const [search, setSearch]       = useState('')
  const [debounceOn, setDebounceOn] = useState(true)
  const [log, setLog]             = useState([])
  const callCount                 = useRef(0)

  // debounced value — only updates 350ms after user stops typing
  const debouncedSearch = useDebounce(search, 350)

  // when debounce is ON  → filter runs on debouncedSearch (delayed)
  // when debounce is OFF → filter runs on search (every keystroke)
  const searchTerm = debounceOn ? debouncedSearch : search

  function addLog(msg, type) {
    callCount.current += 1
    setLog(prev => [
      { msg, type, id: Date.now(), count: callCount.current },
      ...prev.slice(0, 14),
    ])
  }

  // this simulates an API call
  // with debounce ON  → fires once after typing stops
  // with debounce OFF → fires on every single keystroke
  useMemo(() => {
    if (searchTerm === '' && callCount.current === 0) return
    addLog(
      `API call #${callCount.current + 1} → search("${searchTerm}") fired`,
      debounceOn ? 'green' : 'red'
    )
  }, [searchTerm])

  const results = useMemo(() => {
    return COMPONENT_ITEMS.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6)
  }, [searchTerm])

  function handleToggle() {
    setDebounceOn(v => !v)
    setLog([])
    callCount.current = 0
  }

  function handleSearch(e) {
    setSearch(e.target.value)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '0.4rem' }}>useDebounce — API Call Control</h2>
      <p style={{ marginBottom: '2rem' }}>
        Without debounce, every keystroke fires an API call. Type "Button" slowly
        with debounce off — watch 6 separate calls fire. Turn it on and type again —
        only 1 call fires after you stop typing.
      </p>

      {/* toggle */}
      <div style={{ marginBottom: '2rem' }}>
        <button
          className={debounceOn ? 'active-green' : 'active-red'}
          onClick={handleToggle}
        >
          {debounceOn ? '✓ Debounce ON (350ms)' : '✗ Debounce OFF'}
        </button>
      </div>

      {/* explanation */}
      <div style={{
        padding: '1rem 1.25rem',
        borderRadius: '8px',
        border: `1px solid ${debounceOn ? '#34d399' : '#f87171'}`,
        background: debounceOn ? '#0d2b1a' : '#2b0d0d',
        marginBottom: '1.5rem',
        fontSize: '0.88rem',
        lineHeight: '1.7',
        color: '#ccc',
      }}>
        {debounceOn ? (
          <>
            <strong style={{ color: '#34d399' }}>Debounce is ON.</strong> The API call waits
            350ms after you stop typing. If you type fast, all intermediate keystrokes are
            ignored — only the final value is sent. This is how real search bars work.
          </>
        ) : (
          <>
            <strong style={{ color: '#f87171' }}>Debounce is OFF.</strong> Every single
            keystroke fires an API call immediately. Type a 6 letter word and you'll
            see 6 separate calls in the log — most of them completely wasted.
          </>
        )}
      </div>

      {/* search input */}
      <div className='card' style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder='Type to search components... (try "Button" or "Modal")'
          value={search}
          onChange={handleSearch}
          style={{
            width: '100%',
            background: '#0f0f0f',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '0.6rem 1rem',
            color: '#fff',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
            outline: 'none',
          }}
        />

        {/* stats row */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '4px' }}>TOTAL API CALLS</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: debounceOn ? '#34d399' : '#f87171' }}>
              {callCount.current}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '4px' }}>RESULTS FOUND</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#60a5fa' }}>
              {results.length}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '4px' }}>ACTIVE SEARCH</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff' }}>
              "{searchTerm || '—'}"
            </div>
          </div>
        </div>
      </div>

      {/* results */}
      {results.length > 0 && (
        <div className='card' style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', color: '#555', marginBottom: '0.75rem' }}>
            SEARCH RESULTS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {results.map(item => (
              <div key={item.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                background: '#0f0f0f',
                borderRadius: '5px',
                border: '1px solid #222',
                fontSize: '0.85rem',
              }}>
                <span style={{ color: '#e0e0e0' }}>{item.name}</span>
                <span style={{ color: '#555', fontFamily: 'monospace' }}>{item.size}kb</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* api call log */}
      <div style={{ fontSize: '0.78rem', color: '#555', marginBottom: '0.4rem' }}>
        API CALL LOG
      </div>
      <div className='log-box'>
        {log.length === 0 && (
          <div className='log-line log-gray'>// start typing to see API calls fire...</div>
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

export default DebounceDemo