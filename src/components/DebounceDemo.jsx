import { useState, useMemo, useRef } from 'react'
import { useDebounce } from '../hooks/useDebounce'
import { COMPONENT_ITEMS } from '../data/mockData'

function DebounceDemo() {
  const [search, setSearch]         = useState('')
  const [debounceOn, setDebounceOn] = useState(true)
  const [log, setLog]               = useState([])
  const callCount                   = useRef(0)

  const debouncedSearch = useDebounce(search, 350)
  const searchTerm = debounceOn ? debouncedSearch : search

  function addLog(msg, type) {
    callCount.current += 1
    setLog(prev => [{ msg, type, id: Date.now(), count: callCount.current }, ...prev.slice(0, 14)])
  }

  useMemo(() => {
    if (searchTerm === '' && callCount.current === 0) return
    addLog(`API call #${callCount.current + 1} → search("${searchTerm}") fired`, debounceOn ? 'green' : 'red')
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

  return (
    <div>
      <div className="demo-header">
        <h2>useDebounce — API Call Control</h2>
        <p>
          Without debounce every keystroke fires an API call. Type "Button" slowly
          with debounce off — watch 6 separate calls fire. Turn it on and type again —
          only 1 call fires after you stop typing.
        </p>
      </div>

      <div className="demo-controls">
        <button className={debounceOn ? 'active-green' : 'active-red'} onClick={handleToggle}>
          {debounceOn ? '✓ Debounce ON (350ms)' : '✗ Debounce OFF'}
        </button>
      </div>

      <div className={`explanation-box ${debounceOn ? 'green' : 'red'}`}>
        {debounceOn ? (
          <>
            <strong className="green">Debounce is ON.</strong> The API call waits 350ms
            after you stop typing. If you type fast, all intermediate keystrokes are
            ignored — only the final value is sent.
          </>
        ) : (
          <>
            <strong className="red">Debounce is OFF.</strong> Every single keystroke fires
            an API call immediately. Type a 6 letter word and you'll see 6 separate
            calls in the log — most of them completely wasted.
          </>
        )}
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <input
          type="text"
          placeholder='Type to search... (try "Button" or "Modal")'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <div className="stats-grid stats-grid-3" style={{ marginTop: '1rem' }}>
          <div className="stat-item">
            <div className="stat-label">Total API Calls</div>
            <div className={`stat-value ${debounceOn ? 'green' : 'red'}`}>{callCount.current}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Results Found</div>
            <div className="stat-value blue">{results.length}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Active Search</div>
            <div className="stat-value white" style={{ fontSize: '1rem', marginTop: '6px' }}>
              "{searchTerm || '—'}"
            </div>
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="log-section-label" style={{ marginBottom: '0.75rem' }}>SEARCH RESULTS</div>
          <div className="search-results-list">
            {results.map(item => (
              <div key={item.id} className="search-result-item">
                <span>{item.name}</span>
                <span>{item.size}kb</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="log-section-label">API CALL LOG</div>
      <div className="log-box">
        {log.length === 0 && (
          <div className="log-line log-gray">// start typing to see API calls fire...</div>
        )}
        {log.map(l => (
          <div key={l.id} className={`log-line log-${l.type}`}>{l.msg}</div>
        ))}
      </div>
    </div>
  )
}

export default DebounceDemo