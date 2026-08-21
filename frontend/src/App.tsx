import { useEffect, useState } from 'react'
import './App.css'
import { useWebSocket } from './hooks/useWebSocket'

function App() {
  const [message, setMessage] = useState<string | null>(null)

  const { lastMessage, sendMessage } = useWebSocket()

  useEffect(() => {
    if (lastMessage) {
      setMessage(lastMessage)
    }
  }, [lastMessage])

  const checkHealth = async () => {
    try {
      const res = await fetch('http://localhost:3000/health/')
      const data = await res.json()
      setMessage(data.message)
    } catch (err) {
      console.error(err)
      setMessage('Error connecting to backend')
    }
  }

  return (
    <>
      <section id="center">
        <div className="hero">
        </div>
        <div>
          <h1>Core Functionalities</h1>
        </div>
        {message && (
          <div
            style={{
              padding: '0.8rem',
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid red',
              color: 'red',
              borderRadius: '8px',
              marginBottom: '1rem',
              marginTop: '1rem',
              width: '80%',
              minHeight: '60px',
              boxSizing: 'border-box',
              overflowWrap: 'break-word',
            }}
          >
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: 'red',
                marginRight: '0.5rem',
                animation: 'blink 2s infinite',
              }}
            />

            {message}
          </div>
        )}
      </section>
      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Periodic Polling</h2>
          <p>Structured aggregated/derived content such as averages/totals for a time window</p>
        </div>
        <div id="social">
          <h2>Live Dummy Data Generator</h2>
          <p>Realtime updates via WebSocket.</p>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
