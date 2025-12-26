import { Fragment } from 'preact'
import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  useRef,
} from 'preact/hooks'
import withStyles from './jss'
import config from '../config'
import { memo } from 'preact/compat'

const height = 400
const stroke = 3
const axis = 20
const axisGap = 20
const day = 24 * 60 * 60 * 1000

const strokeHoverWidth = 12

const timeToX = ({ minX, maxX, time, width }) => {
  return ((time - minX) / (maxX - minX)) * width
}

const uuidToColor = uuid => {
  const uuidInt = parseInt(uuid.slice(-12), 16) + 1
  // Generate vibrant red-orange gradient colors for dragon theme
  const r = 200 + ((uuidInt * 37) % 56) // 200-255
  const g = 30 + ((uuidInt * 89) % 80) // 30-110
  const b = 10 + ((uuidInt * 53) % 40) // 10-50
  return `rgba(${r}, ${g}, ${b}, 0.9)`
}

const pointsToPolyline = ({
  id,
  name,
  currentScore,
  points,
  maxX,
  minX,
  maxY,
  width,
}) => {
  const commands = points.map(point => {
    return `${timeToX({ minX, maxX, time: point.time, width })} ${
      (1 - point.score / maxY) * height
    }`
  })
  return {
    color: uuidToColor(id),
    name,
    currentScore,
    points: commands.join(','),
  }
}

const getXLabels = ({ minX, maxX, width }) => {
  const labels = []
  const step = Math.ceil((((maxX - minX) / width) * 200) / day) * day
  let labelStart = new Date(minX).setHours(0, 0, 0, 0)
  if (labelStart % step !== 0) {
    labelStart += step
  }

  for (let label = labelStart; label <= maxX; label += step) {
    labels.push({
      label: new Date(label).toLocaleDateString(),
      x: timeToX({ minX, maxX, time: label, width }),
    })
  }
  return labels
}

const GraphLine = memo(
  ({
    points,
    onTooltipIn,
    onMouseMove,
    onMouseOut,
    name,
    currentScore,
    ...rest
  }) => (
    <Fragment>
      <polyline
        {...rest}
        points={points}
        strokeWidth={stroke}
        strokeLinecap='round'
        fill='transparent'
        pointerEvents='none'
        filter='url(#glow)'
      />
      <polyline
        strokeWidth={strokeHoverWidth}
        points={points}
        strokeLinecap='round'
        fill='transparent'
        stroke='transparent'
        pointerEvents='stroke'
        onMouseOver={onTooltipIn(`${name} - ${currentScore} points`)}
        onMouseMove={onMouseMove}
        onMouseOut={onMouseOut}
      />
    </Fragment>
  )
)

function Graph({ graphData, classes }) {
  const svgRef = useRef(null)
  const [width, setWidth] = useState(window.innerWidth)
  const updateWidth = useCallback(() => {
    if (svgRef.current === null) return
    setWidth(svgRef.current.getBoundingClientRect().width)
  }, [])

  const [tooltipData, setTooltipData] = useState({
    x: 0,
    y: 0,
    content: '',
  })

  useLayoutEffect(() => {
    updateWidth()
  }, [updateWidth])
  useEffect(() => {
    function handleResize() {
      updateWidth()
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [updateWidth])

  const { polylines, labels } = useMemo(() => {
    if (!graphData || graphData.length === 0) {
      return {
        polylines: [],
        labels: [],
      }
    }
    const minX = config.startTime
    const maxX = Math.min(Date.now(), config.endTime)
    let maxY = 0
    graphData.graph.forEach(user => {
      user.points.forEach(point => {
        if (point.score > maxY) {
          maxY = point.score
        }
      })
    })
    const labels = getXLabels({ minX, maxX, width })
    const polylines = graphData.graph.map(user =>
      pointsToPolyline({
        points: user.points,
        id: user.id,
        name: user.name,
        currentScore: user.points[0].score,
        maxX,
        minX,
        maxY,
        width,
      })
    )
    return { polylines, labels }
  }, [graphData, width])

  const handleTooltipIn = useCallback(
    content => () => {
      setTooltipData(d => ({
        ...d,
        content,
      }))
    },
    []
  )

  const handleTooltipMove = useCallback(evt => {
    setTooltipData(d => ({
      ...d,
      x: evt.pageX,
      y: evt.pageY,
    }))
  }, [])

  const handleTooltipOut = useCallback(() => {
    setTooltipData(d => ({
      ...d,
      content: '',
    }))
  }, [])

  if (graphData === null) {
    return null
  }

  return (
    <div className={`frame ${classes.root}`}>
      <div className='frame__body'>
        <div className={classes.graphTitle}>🐉 Score Progress Over Time 🐉</div>
        <svg
          ref={svgRef}
          viewBox={`${-stroke - axis} ${-stroke} ${width + stroke * 2 + axis} ${
            height + stroke * 2 + axis + axisGap
          }`}
        >
          <defs>
            <filter id='glow' x='-50%' y='-50%' width='200%' height='200%'>
              <feGaussianBlur stdDeviation='2' result='coloredBlur' />
              <feMerge>
                <feMergeNode in='coloredBlur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
            <linearGradient id='gridGradient' x1='0%' y1='0%' x2='0%' y2='100%'>
              <stop offset='0%' stopColor='rgba(220, 38, 38, 0.3)' />
              <stop offset='100%' stopColor='rgba(220, 38, 38, 0)' />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <g className={classes.gridLines}>
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
              <line
                key={`grid-${i}`}
                x1={0}
                y1={height * fraction}
                x2={width}
                y2={height * fraction}
                stroke='rgba(220, 38, 38, 0.15)'
                strokeWidth='1'
                strokeDasharray='5,5'
              />
            ))}
          </g>

          {/* Graph lines */}
          <Fragment>
            {polylines.map(({ points, color, name, currentScore }, i) => (
              <GraphLine
                key={i}
                stroke={color}
                points={points}
                name={name}
                currentScore={currentScore}
                onMouseMove={handleTooltipMove}
                onMouseOut={handleTooltipOut}
                onTooltipIn={handleTooltipIn}
              />
            ))}
          </Fragment>

          {/* X-axis labels */}
          <Fragment>
            {labels.map((label, i) => (
              <text
                x={label.x}
                y={height + axis + axisGap}
                key={i}
                fill='#ff8888'
                fontSize='14'
                fontWeight='bold'
                textAnchor='middle'
                className={classes.axisLabel}
              >
                {label.label}
              </text>
            ))}
          </Fragment>

          {/* Axes */}
          <line
            x1={-axisGap}
            y1={height + axisGap}
            x2={width}
            y2={height + axisGap}
            stroke='rgba(220, 38, 38, 0.6)'
            strokeLinecap='round'
            strokeWidth={stroke}
          />
          <line
            x1={-axisGap}
            y1='0'
            x2={-axisGap}
            y2={height + axisGap}
            stroke='rgba(220, 38, 38, 0.6)'
            strokeLinecap='round'
            strokeWidth={stroke}
          />
        </svg>
      </div>
      {tooltipData.content && (
        <div
          className={classes.tooltip}
          style={{
            transform: `translate(${tooltipData.x + 10}px, ${
              tooltipData.y - 50
            }px)`,
          }}
        >
          <div className={classes.tooltipContent}>
            <div className={classes.tooltipGlow} />
            {tooltipData.content}
          </div>
        </div>
      )}
    </div>
  )
}

export default withStyles(
  {
    '@keyframes borderGlow': {
      '0%, 100%': { opacity: 0.5 },
      '50%': { opacity: 1 },
    },
    '@keyframes titlePulse': {
      '0%, 100%': {
        textShadow:
          '0 0 15px rgba(220, 38, 38, 0.8), 0 0 25px rgba(220, 38, 38, 0.4)',
      },
      '50%': {
        textShadow:
          '0 0 25px rgba(220, 38, 38, 1), 0 0 40px rgba(220, 38, 38, 0.6)',
      },
    },
    '@keyframes tooltipFloat': {
      '0%, 100%': {
        transform: 'translateY(0) scale(1)',
      },
      '50%': {
        transform: 'translateY(-3px) scale(1.02)',
      },
    },
    '@keyframes glowPulse': {
      '0%, 100%': {
        opacity: 0.5,
        transform: 'scale(1)',
      },
      '50%': {
        opacity: 1,
        transform: 'scale(1.2)',
      },
    },
    root: {
      marginBottom: '20px',
      position: 'relative',
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.6)',
      borderRadius: '16px',
      boxShadow:
        '0 0 60px rgba(220, 38, 38, 0.4), inset 0 0 60px rgba(153, 27, 27, 0.2)',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(45deg, transparent, rgba(220, 38, 38, 0.4), transparent)',
        animation: '$borderGlow 3s linear infinite',
        zIndex: -1,
        pointerEvents: 'none',
        borderRadius: '16px',
      },
      '& .frame__body': {
        padding: '30px',
      },
    },
    graphTitle: {
      textAlign: 'center',
      fontSize: '2rem',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      marginBottom: '2rem',
      textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.8)',
      animation: '$titlePulse 2s ease-in-out infinite',
    },
    gridLines: {
      opacity: 0.3,
    },
    axisLabel: {
      textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
    },
    tooltip: {
      position: 'fixed',
      pointerEvents: 'none',
      top: '0',
      left: '0',
      zIndex: 10000,
    },
    tooltipContent: {
      position: 'relative',
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.95), rgba(0,0,0,0.98))',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '12px',
      border: '3px solid rgba(220, 38, 38, 0.9)',
      boxShadow:
        '0 0 40px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.4), inset 0 0 30px rgba(153, 27, 27, 0.3)',
      fontSize: '1.1rem',
      fontWeight: 900,
      letterSpacing: '0.08em',
      textShadow:
        '0 0 15px rgba(220, 38, 38, 0.9), 2px 2px 4px rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(15px)',
      whiteSpace: 'nowrap',
      animation: '$tooltipFloat 1.5s ease-in-out infinite',
      textTransform: 'uppercase',
      display: 'inline-block',
    },
    tooltipGlow: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: '100%',
      transform: 'translate(-50%, -50%)',
      background:
        'radial-gradient(circle, rgba(220, 38, 38, 0.6) 0%, transparent 70%)',
      borderRadius: '12px',
      animation: '$glowPulse 1.5s ease-in-out infinite',
      zIndex: -1,
      filter: 'blur(20px)',
    },
  },
  Graph
)
