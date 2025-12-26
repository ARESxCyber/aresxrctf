import { Component } from 'react'

const config = {
  ctfName: 'Dragon CTF',
  homeContent:
    '# Welcome to ARESx\n\nPrepare yourself for the ultimate challenge. The winter arc begins now.',
}

const Markdown = ({ content }) => {
  const lines = content.split('\n')
  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i}>{line.slice(2)}</h1>
        if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
        if (line.trim() === '') return <br key={i} />
        return <p key={i}>{line}</p>
      })}
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'relative',
    minHeight: '100vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(to bottom, #0a0000, #450a0a, #0a0000)',
  },
  backgroundPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 0,
    opacity: 0.3,
    background: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.4) 0%, transparent 50%),
                  radial-gradient(circle at 80% 80%, rgba(153, 27, 27, 0.4) 0%, transparent 50%),
                  radial-gradient(circle at 40% 20%, rgba(185, 28, 28, 0.3) 0%, transparent 50%)`,
    animation: 'pulse 4s ease-in-out infinite',
  },
  dragonScales: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
    opacity: 0.5,
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px),
      repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px),
      repeating-linear-gradient(120deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px)
    `,
    backgroundSize: '70px 70px',
    animation: 'scaleMove 30s linear infinite',
  },
  dragonSilhouette: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '1000px',
    height: '1000px',
    transform: 'translate(-50%, -50%) scale(1)',
    zIndex: 2,
    opacity: 0.32,
    pointerEvents: 'none',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundImage: 'url("/dragon.svg")',
    animation: 'breathe 6s ease-in-out infinite',
  },
  heatWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    zIndex: 3,
    background:
      'linear-gradient(to top, rgba(220, 38, 38, 0.5) 0%, rgba(255, 69, 0, 0.2) 30%, transparent 100%)',
    pointerEvents: 'none',
    animation: 'heatWave 3s ease-in-out infinite',
  },
  fireParticle: {
    position: 'absolute',
    bottom: '-20px',
    borderRadius: '50%',
    filter: 'blur(3px)',
    animation: 'riseAndFade 4s ease-in infinite',
    zIndex: 4,
    pointerEvents: 'none',
  },
  ember: {
    position: 'absolute',
    bottom: 0,
    width: '4px',
    height: '4px',
    borderRadius: '50%',
    background:
      'radial-gradient(circle, #ffaa00 0%, #ff4500 70%, transparent 100%)',
    boxShadow: '0 0 15px rgba(255, 165, 0, 1), 0 0 25px rgba(255, 69, 0, 0.6)',
    filter: 'blur(1px)',
    animation: 'floatEmber 10s ease-in-out infinite',
    zIndex: 4,
    pointerEvents: 'none',
  },
  contentCard: {
    position: 'relative',
    zIndex: 10,
    width: '90%',
    maxWidth: '1000px',
    padding: '3rem',
    background:
      'linear-gradient(135deg, rgba(0,0,0,0.45), rgba(69,10,10,0.25), rgba(0,0,0,0.95))',
    backdropFilter: 'blur(10px)',
    borderRadius: '24px',
    border: '2px solid rgba(220, 38, 38, 0.5)',
    boxShadow:
      '0 0 80px rgba(220, 38, 38, 0.3), inset 0 0 60px rgba(153, 27, 27, 0.2)',
    animation: 'cardFloat 6s ease-in-out infinite',
    overflow: 'hidden',
  },
  titleContainer: {
    position: 'relative',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '6rem',
    margin: 0,
    textAlign: 'center',
    fontWeight: 900,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.5)',
    animation: 'titlePulse 2s ease-in-out infinite',
  },
  titleGlitch: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    fontSize: '6rem',
    margin: 0,
    textAlign: 'center',
    fontWeight: 900,
    color: '#dc2626',
    textTransform: 'uppercase',
    letterSpacing: '0.3em',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    opacity: 0.7,
    animation: 'glitchEffect 3s infinite',
    pointerEvents: 'none',
  },
  subtitle: {
    textAlign: 'center',
    color: '#fca5a5',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
    marginBottom: '2rem',
    animation: 'pulse 3s ease-in-out infinite',
  },
  dividerContainer: {
    position: 'relative',
    height: '4px',
    width: '100%',
    marginBottom: '2.5rem',
    overflow: 'hidden',
    borderRadius: '9999px',
  },
  divider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to right, transparent, #dc2626, transparent)',
    animation: 'dividerSlide 2s ease-in-out infinite',
    boxShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
  },
  markdownArea: {
    color: '#d1d5db',
  },
}

class Home extends Component {
  componentDidMount() {
    document.title = `ARESx | ${config.ctfName}`
    const styleSheet = document.createElement('style')
    styleSheet.textContent = `
      @keyframes pulse {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.5; }
      }
      @keyframes scaleMove {
        0% { background-position: 0 0, 0 0, 0 0; }
        100% { background-position: 140px 140px, 140px 140px, 140px 140px; }
      }
      @keyframes breathe {
        0% { transform: translate(-50%, -50%) scale(1); }
        25% { transform: translate(-50%, -50%) scale(1.03); }
        50% { transform: translate(-50%, -50%) scale(1); }
        75% { transform: translate(-50%, -50%) scale(1.03); }
        100% { transform: translate(-50%, -50%) scale(1); }
      }
      @keyframes riseAndFade {
        0% {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        50% {
          transform: translateY(-300px) scale(1.5);
          opacity: 0.8;
        }
        100% {
          transform: translateY(-600px) scale(0.5);
          opacity: 0;
        }
      }
      @keyframes floatEmber {
        0% {
          transform: translate(0, 0) rotate(0deg);
          opacity: 0;
        }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% {
          transform: translate(50px, -100vh) rotate(360deg);
          opacity: 0;
        }
      }
      @keyframes cardFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
      @keyframes glitchEffect {
        0%, 100% { transform: translate(0); }
        20% { transform: translate(-3px, 3px); }
        40% { transform: translate(3px, -3px); }
        60% { transform: translate(-3px, -3px); }
        80% { transform: translate(3px, 3px); }
      }
      @keyframes titlePulse {
        0%, 100% {
          text-shadow: 4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.5);
        }
        50% {
          text-shadow: 4px 4px 0 #991b1b, 8px 8px 40px rgba(220, 38, 38, 0.9);
        }
      }
      @keyframes dividerSlide {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      @keyframes scaleMove {
        0% { background-position: 0 0; }
        100% { background-position: 70px 70px; }
      }
      @keyframes heatWave {
        0%, 100% {
          transform: scaleY(1);
          opacity: 0.5;
        }
        50% {
          transform: scaleY(1.1);
          opacity: 0.7;
        }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      @keyframes dragonClawScratch {
        0%, 100% {
          transform: rotate(-20deg) translateY(0);
          opacity: 0.08;
        }
        50% {
          transform: rotate(-20deg) translateY(-30px);
          opacity: 0.12;
        }
      }
      @keyframes dragonWingFlap {
        0%, 100% {
          transform: rotate(15deg) scale(1);
          opacity: 0.06;
        }
        50% {
          transform: rotate(15deg) scale(1.1);
          opacity: 0.1;
        }
      }
      @keyframes dragonEyeGlow {
        0%, 100% {
          opacity: 0.5;
          box-shadow: 0 0 40px rgba(220, 38, 38, 0.8), 0 0 60px rgba(153, 27, 27, 0.5);
        }
        50% {
          opacity: 0.8;
          box-shadow: 0 0 60px rgba(220, 38, 38, 1), 0 0 90px rgba(153, 27, 27, 0.8);
        }
      }
      body {
        margin: 0;
        padding: 0;
        background-color: #000000;
        overflow-x: hidden;
      }
      h1 {
        color: #f87171;
        font-size: 2rem;
        font-weight: bold;
        border-bottom: 2px solid #7f1d1d;
        padding-bottom: 0.75rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
      }
      h2 {
        color: #f87171;
        font-size: 1.5rem;
        font-weight: bold;
        border-bottom: 2px solid #7f1d1d;
        padding-bottom: 0.75rem;
        margin-top: 2rem;
        margin-bottom: 1rem;
      }
      p {
        font-size: 1.125rem;
        line-height: 1.75;
        margin-bottom: 1.5rem;
      }
    `
    document.head.appendChild(styleSheet)
  }

  render() {
    const fireParticles = Array.from({ length: 20 }).map((_, i) => {
      const size = 8 + Math.random() * 18
      const hue = 5 + Math.random() * 35
      const saturation = 95 + Math.random() * 5
      const lightness = 55 + Math.random() * 25
      return (
        <div
          key={`fire-${i}`}
          style={{
            ...styles.fireParticle,
            left: `${Math.random() * 100}%`,
            width: `${size}px`,
            height: `${size}px`,
            background: `radial-gradient(circle at 30% 30%, 
              hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1) 0%, 
              hsla(${hue}, ${saturation}%, ${lightness}%, 0.9) 30%, 
              hsla(${hue - 10}, ${saturation}%, ${lightness - 10}%, 0.6) 60%, 
              transparent 100%)`,
            boxShadow: `0 0 ${
              size * 2
            }px hsla(${hue}, ${saturation}%, ${lightness}%, 0.8),
                        0 0 ${size * 4}px hsla(${hue}, ${saturation}%, ${
              lightness - 20
            }%, 0.4)`,
            animationDuration: `${2 + Math.random() * 2.5}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      )
    })

    const embers = Array.from({ length: 80 }).map((_, i) => (
      <div
        key={`ember-${i}`}
        style={{
          ...styles.ember,
          left: `${Math.random() * 100}%`,
          animationDuration: `${6 + Math.random() * 4}s`,
          animationDelay: `${Math.random() * 5}s`,
        }}
      />
    ))

    return (
      <div style={styles.wrapper}>
        <div style={styles.backgroundPulse} />
        <div style={styles.dragonScales} />
        <div style={styles.dragonSilhouette} />
        <div style={styles.dragonClaw1} />
        <div style={styles.dragonClaw2} />
        <div style={styles.dragonWing1} />
        <div style={styles.dragonWing2} />
        <div style={styles.dragonEye1} />
        <div style={styles.dragonEye2} />
        <div style={styles.heatWave} />
        {fireParticles}
        {embers}

        <div style={styles.contentCard}>
          <div style={styles.titleContainer}>
            <h1 style={styles.title}>ARESx</h1>
            <div style={styles.titleGlitch}>ARESx</div>
          </div>
          <p style={styles.subtitle}>The Winter Arc 2026</p>
          <div style={styles.dividerContainer}>
            <div style={styles.divider} />
          </div>
          <div style={styles.markdownArea}>
            <Markdown content={config.homeContent} />
          </div>
        </div>
      </div>
    )
  }
}

export default Home
