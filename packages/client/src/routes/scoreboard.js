import { useState, useEffect, useMemo, useCallback, useRef } from 'preact/hooks'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import config from '../config'
import withStyles from '../components/jss'
import Pagination from '../components/pagination'
import Graph from '../components/graph'
import NotStarted from '../components/not-started'
import { useToast } from '../components/toast'

import { getScoreboard, getGraph } from '../api/scoreboard'
import { privateProfile } from '../api/profile'

const PAGESIZE_OPTIONS = [25, 50, 100]

const loadStates = {
  pending: 0,
  notStarted: 1,
  loaded: 2,
}

const Scoreboard = withStyles(
  {
    '@global': {
      body: {
        backgroundColor: '#000000',
        overflowX: 'hidden',
      },
    },
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    '@keyframes borderGlow': {
      '0%, 100%': { opacity: 0.5 },
      '50%': { opacity: 1 },
    },
    '@keyframes floatEmber': {
      '0%': {
        transform: 'translate(0, 0) rotate(0deg)',
        opacity: 0,
      },
      '10%': { opacity: 1 },
      '90%': { opacity: 1 },
      '100%': {
        transform: 'translate(50px, -100vh) rotate(360deg)',
        opacity: 0,
      },
    },
    '@keyframes riseAndFade': {
      '0%': {
        transform: 'translateY(0) scale(1)',
        opacity: 1,
      },
      '50%': {
        transform: 'translateY(-300px) scale(1.5)',
        opacity: 0.8,
      },
      '100%': {
        transform: 'translateY(-600px) scale(0.5)',
        opacity: 0,
      },
    },
    '@keyframes heatWave': {
      '0%, 100%': {
        transform: 'scaleY(1)',
        opacity: 0.6,
      },
      '50%': {
        transform: 'scaleY(1.15)',
        opacity: 0.8,
      },
    },
    '@keyframes scaleMove': {
      '0%': { backgroundPosition: '0 0' },
      '100%': { backgroundPosition: '70px 70px' },
    },
    '@keyframes shimmer': {
      '0%': { backgroundPosition: '-1000px 0' },
      '100%': { backgroundPosition: '1000px 0' },
    },
    '@keyframes titleGlow': {
      '0%, 100%': {
        textShadow:
          '0 0 20px rgba(220, 38, 38, 0.8), 0 0 40px rgba(220, 38, 38, 0.4)',
      },
      '50%': {
        textShadow:
          '0 0 30px rgba(220, 38, 38, 1), 0 0 60px rgba(220, 38, 38, 0.6), 0 0 80px rgba(220, 38, 38, 0.3)',
      },
    },
    '@keyframes flameFlicker': {
      '0%, 100%': { opacity: 0.9 },
      '50%': { opacity: 1 },
    },
    '@keyframes rankPulse': {
      '0%, 100%': {
        textShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
        transform: 'scale(1)',
      },
      '50%': {
        textShadow:
          '0 0 20px rgba(220, 38, 38, 1), 0 0 30px rgba(220, 38, 38, 0.6)',
        transform: 'scale(1.05)',
      },
    },
    wrapper: {
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000000, #450a0a, #000000)',
      paddingTop: '2rem',
      paddingBottom: '2rem',
    },
    backgroundPulse: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.2,
      background: `radial-gradient(circle at 20% 50%, rgba(220, 38, 38, 0.4) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(153, 27, 27, 0.4) 0%, transparent 50%)`,
      animation: '$pulse 4s ease-in-out infinite',
      pointerEvents: 'none',
    },
    dragonScales: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      opacity: 0.08,
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px),
        repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px),
        repeating-linear-gradient(120deg, transparent, transparent 35px, rgba(139, 0, 0, 0.1) 35px, rgba(139, 0, 0, 0.1) 36px)
      `,
      backgroundSize: '70px 70px',
      animation: '$scaleMove 30s linear infinite',
      pointerEvents: 'none',
    },
    ember: {
      position: 'fixed',
      bottom: 0,
      width: '4px',
      height: '4px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle, #ffaa00 0%, #ff4500 70%, transparent 100%)',
      boxShadow:
        '0 0 15px rgba(255, 165, 0, 1), 0 0 25px rgba(255, 69, 0, 0.6)',
      filter: 'blur(1px)',
      animation: '$floatEmber 10s ease-in-out infinite',
      zIndex: 1,
      pointerEvents: 'none',
    },
    fireParticle: {
      position: 'fixed',
      bottom: '-20px',
      borderRadius: '50%',
      filter: 'blur(3px)',
      animation: '$riseAndFade 4s ease-in infinite',
      zIndex: 1,
      pointerEvents: 'none',
    },
    heatWave: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '70%',
      zIndex: 1,
      background:
        'linear-gradient(to top, rgba(220, 38, 38, 0.6) 0%, rgba(255, 69, 0, 0.3) 40%, transparent 100%)',
      pointerEvents: 'none',
      animation: '$heatWave 3s ease-in-out infinite',
    },
    scoreBoardTitle: {
      textAlign: 'center',
      fontSize: '3rem',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.3em',
      marginBottom: '2rem',
      textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.8)',
      animation: '$titleGlow 2s ease-in-out infinite',
      position: 'relative',
      zIndex: 10,
    },
    frame: {
      position: 'relative',
      zIndex: 10,
      paddingBottom: '1.5em',
      paddingTop: '2.125em',
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.6)',
      borderRadius: '16px',
      boxShadow:
        '0 0 60px rgba(220, 38, 38, 0.4), inset 0 0 60px rgba(153, 27, 27, 0.2), 0 10px 40px rgba(0, 0, 0, 0.5)',
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
      '&::after': {
        content: '""',
        position: 'absolute',
        top: '-2px',
        left: '-2px',
        right: '-2px',
        bottom: '-2px',
        background:
          'linear-gradient(45deg, #dc2626, #991b1b, #7f1d1d, #991b1b, #dc2626)',
        backgroundSize: '400% 400%',
        borderRadius: '16px',
        zIndex: -2,
        animation: '$shimmer 3s ease infinite',
        opacity: 0.3,
      },
      '& .frame__subtitle': {
        color: '#ff6b6b',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        textShadow:
          '0 0 15px rgba(220, 38, 38, 0.7), 0 0 25px rgba(220, 38, 38, 0.3)',
        marginBottom: '0.5em',
      },
      '& button, & select, & option': {
        background: 'linear-gradient(135deg, #1a0000, #330000, #1a0000)',
        color: '#ff8888',
        border: '2px solid rgba(220, 38, 38, 0.4)',
        borderRadius: '8px',
        fontWeight: 'bold',
        fontSize: '0.95rem',
        padding: '0.6em 1em',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
        textShadow: '0 0 5px rgba(220, 38, 38, 0.5)',
        '&:hover:not(:disabled)': {
          background: 'linear-gradient(135deg, #330000, #550000, #330000)',
          borderColor: 'rgba(220, 38, 38, 0.8)',
          boxShadow:
            '0 0 25px rgba(220, 38, 38, 0.5), inset 0 0 15px rgba(220, 38, 38, 0.2)',
          transform: 'translateY(-3px) scale(1.02)',
          color: '#ffaaaa',
        },
        '&:disabled': {
          opacity: 0.5,
          cursor: 'not-allowed',
        },
      },
    },
    tableFrame: {
      paddingTop: '1.5em',
    },
    selected: {
      position: 'relative',
      backgroundColor: 'rgba(220, 38, 38, 0.25)',
      animation: '$flameFlicker 2s ease-in-out infinite',
      '&::before': {
        content: '""',
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: '6px',
        background: 'linear-gradient(to bottom, #ff4444, #dc2626, #991b1b)',
        boxShadow:
          '0 0 20px rgba(220, 38, 38, 1), 2px 0 10px rgba(220, 38, 38, 0.6)',
        animation: '$pulse 1.5s ease-in-out infinite',
      },
      '&:hover': {
        backgroundColor: 'rgba(220, 38, 38, 0.35) !important',
        boxShadow: 'inset 0 0 20px rgba(220, 38, 38, 0.3)',
      },
    },
    table: {
      tableLayout: 'fixed',
      '& thead': {
        '& th': {
          color: '#ff6b6b',
          fontSize: '1.1rem',
          fontWeight: 900,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          borderBottom: '3px solid #7f1d1d',
          paddingBottom: '1em',
          textShadow:
            '0 0 15px rgba(220, 38, 38, 0.8), 0 0 25px rgba(220, 38, 38, 0.4)',
          background:
            'linear-gradient(to bottom, transparent, rgba(220, 38, 38, 0.1))',
        },
      },
      '& tbody': {
        '& tr': {
          transition: 'all 0.3s ease',
          borderBottom: '1px solid rgba(127, 29, 29, 0.4)',
          '&:hover': {
            backgroundColor: 'rgba(220, 38, 38, 0.15)',
            transform: 'translateX(8px) scale(1.01)',
            boxShadow:
              'inset 4px 0 0 rgba(220, 38, 38, 0.6), 0 0 15px rgba(220, 38, 38, 0.2)',
          },
        },
        '& td': {
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          color: '#e5e5e5',
          fontSize: '1rem',
          padding: '0.8em 0.5em',
          '&:first-child': {
            fontWeight: 900,
            color: '#ff8888',
            fontSize: '1.1rem',
            textShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
          },
        },
        '& a': {
          color: '#ff6b6b',
          fontWeight: 'bold',
          textDecoration: 'none',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            color: '#ff4444',
            textShadow:
              '0 0 15px rgba(220, 38, 38, 0.8), 0 0 25px rgba(220, 38, 38, 0.4)',
            transform: 'scale(1.05)',
            display: 'inline-block',
          },
        },
      },
    },
    rankBadge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '6px',
      fontWeight: 900,
      fontSize: '1rem',
      letterSpacing: '0.05em',
    },
    rank1: {
      background: 'linear-gradient(135deg, #ffd700, #ffed4e, #ffd700)',
      color: '#000',
      boxShadow:
        '0 0 25px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.4), inset 0 0 10px rgba(255, 255, 255, 0.3)',
      animation: '$rankPulse 2s ease-in-out infinite',
      border: '2px solid #fff5cc',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
    },
    rank2: {
      background: 'linear-gradient(135deg, #c0c0c0, #e8e8e8, #c0c0c0)',
      color: '#000',
      boxShadow:
        '0 0 20px rgba(192, 192, 192, 0.7), 0 0 35px rgba(192, 192, 192, 0.3), inset 0 0 8px rgba(255, 255, 255, 0.2)',
      border: '2px solid #f0f0f0',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    },
    rank3: {
      background: 'linear-gradient(135deg, #cd7f32, #e5a062, #cd7f32)',
      color: '#000',
      boxShadow:
        '0 0 20px rgba(205, 127, 50, 0.7), 0 0 35px rgba(205, 127, 50, 0.3), inset 0 0 8px rgba(255, 255, 255, 0.2)',
      border: '2px solid #f4d6a8',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
    },
  },
  ({ classes }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const loggedIn = useMemo(() => localStorage.getItem('token') !== null, [])
    const scoreboardPageState = useMemo(() => {
      const localStorageState = JSON.parse(
        localStorage.getItem('scoreboardPageState') || '{}'
      )

      const queryParams = new URLSearchParams(location.search)
      const queryState = {}
      if (queryParams.has('page')) {
        const page = parseInt(queryParams.get('page'))
        if (!isNaN(page)) {
          queryState.page = page
        }
      }
      if (queryParams.has('pageSize')) {
        const pageSize = parseInt(queryParams.get('pageSize'))
        if (!isNaN(pageSize)) {
          queryState.pageSize = pageSize
        }
      }
      if (queryParams.has('division')) {
        queryState.division = queryParams.get('division')
      }

      return { ...localStorageState, ...queryState }
    }, [location.search])
    const [profile, setProfile] = useState(null)
    const [pageSize, _setPageSize] = useState(
      scoreboardPageState.pageSize || 100
    )
    const [scores, setScores] = useState([])
    const [graphData, setGraphData] = useState(null)
    const [division, _setDivision] = useState(
      scoreboardPageState.division || 'all'
    )
    const [page, setPage] = useState(scoreboardPageState.page || 1)
    const [totalItems, setTotalItems] = useState(0)
    const [scoreLoadState, setScoreLoadState] = useState(loadStates.pending)
    const [graphLoadState, setGraphLoadState] = useState(loadStates.pending)
    const selfRow = useRef()
    const { toast } = useToast()

    const setDivision = useCallback(
      newDivision => {
        _setDivision(newDivision)
        setPage(1)
      },
      [_setDivision, setPage]
    )
    const setPageSize = useCallback(
      newPageSize => {
        _setPageSize(newPageSize)
        setPage(Math.floor(((page - 1) * pageSize) / newPageSize) + 1)
      },
      [pageSize, _setPageSize, page, setPage]
    )

    useEffect(() => {
      localStorage.setItem(
        'scoreboardPageState',
        JSON.stringify({ pageSize, division })
      )
    }, [pageSize, division])
    useEffect(() => {
      if (page !== 1 || location.search !== '') {
        navigate(
          `?page=${page}&division=${encodeURIComponent(
            division
          )}&pageSize=${pageSize}`,
          { replace: true }
        )
      }
    }, [pageSize, division, page, location.search, navigate])

    const divisionChangeHandler = useCallback(
      e => setDivision(e.target.value),
      [setDivision]
    )
    const pageSizeChangeHandler = useCallback(
      e => setPageSize(e.target.value),
      [setPageSize]
    )

    useEffect(() => {
      document.title = `Scoreboard | ${config.ctfName}`
    }, [])
    useEffect(() => {
      if (loggedIn) {
        privateProfile().then(({ data, error }) => {
          if (error) {
            toast({ body: error, type: 'error' })
          }
          setProfile(data)
        })
      }
    }, [loggedIn, toast])

    useEffect(() => {
      ;(async () => {
        const _division = division === 'all' ? undefined : division
        const { kind, data } = await getScoreboard({
          division: _division,
          offset: (page - 1) * pageSize,
          limit: pageSize,
        })
        setScoreLoadState(
          kind === 'badNotStarted' ? loadStates.notStarted : loadStates.loaded
        )
        if (kind !== 'goodLeaderboard') {
          return
        }
        setScores(
          data.leaderboard.map((entry, i) => ({
            ...entry,
            rank: i + 1 + (page - 1) * pageSize,
          }))
        )
        setTotalItems(data.total)
      })()
    }, [division, page, pageSize])

    useEffect(() => {
      ;(async () => {
        const _division = division === 'all' ? undefined : division
        const { kind, data } = await getGraph({ division: _division })
        setGraphLoadState(
          kind === 'badNotStarted' ? loadStates.notStarted : loadStates.loaded
        )
        if (kind !== 'goodLeaderboardGraph') {
          return
        }
        setGraphData(data)
      })()
    }, [division])

    const isUserOnCurrentScoreboard =
      loggedIn &&
      profile !== null &&
      profile.globalPlace !== null &&
      (division === 'all' || Number.parseInt(division) === profile.division)
    const isSelfVisible = useMemo(() => {
      if (profile == null) return false
      let isSelfVisible = false
      scores.forEach(({ id }) => {
        if (id === profile.id) {
          isSelfVisible = true
        }
      })
      return isSelfVisible
    }, [profile, scores])
    const scrollToSelf = useCallback(() => {
      selfRow.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }, [selfRow])
    const [needsScrollToSelf, setNeedsScrollToSelf] = useState(false)
    const goToSelfPage = useCallback(() => {
      if (!isUserOnCurrentScoreboard) return
      let place
      if (division === 'all') {
        place = profile.globalPlace
      } else {
        place = profile.divisionPlace
      }
      setPage(Math.floor((place - 1) / pageSize) + 1)

      if (isSelfVisible) {
        scrollToSelf()
      } else {
        setNeedsScrollToSelf(true)
      }
    }, [
      profile,
      setPage,
      pageSize,
      division,
      isUserOnCurrentScoreboard,
      isSelfVisible,
      scrollToSelf,
    ])
    useEffect(() => {
      if (needsScrollToSelf) {
        if (isSelfVisible) {
          scrollToSelf()
          setNeedsScrollToSelf(false)
        }
      }
    }, [isSelfVisible, needsScrollToSelf, scrollToSelf])

    // Generate embers for background
    const embers = useMemo(
      () =>
        Array.from({ length: 60 }).map((_, i) => (
          <div
            key={`ember-${i}`}
            className={classes.ember}
            style={{
              left: `${Math.random() * 100}%`,
              animationDuration: `${7 + Math.random() * 5}s`,
              animationDelay: `${Math.random() * 6}s`,
            }}
          />
        )),
      [classes.ember]
    )

    // Generate fire particles
    const fireParticles = useMemo(
      () =>
        Array.from({ length: 20 }).map((_, i) => {
          const size = 8 + Math.random() * 18
          const hue = 5 + Math.random() * 35
          const saturation = 95 + Math.random() * 5
          const lightness = 55 + Math.random() * 25

          return (
            <div
              key={`fire-${i}`}
              className={classes.fireParticle}
              style={{
                left: `${Math.random() * 100}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: `radial-gradient(circle at 30% 30%, 
                  hsla(${hue}, ${saturation}%, ${lightness + 20}%, 1) 0%, 
                  hsla(${hue}, ${saturation}%, ${lightness}%, 0.9) 30%, 
                  hsla(${hue - 10}, ${saturation}%, ${
                  lightness - 10
                }%, 0.6) 60%, 
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
        }),
      [classes.fireParticle]
    )

    if (
      scoreLoadState === loadStates.pending ||
      graphLoadState === loadStates.pending
    ) {
      return null
    }

    if (
      scoreLoadState === loadStates.notStarted ||
      graphLoadState === loadStates.notStarted
    ) {
      return <NotStarted />
    }

    return (
      <div className={classes.wrapper}>
        <div className={classes.backgroundPulse} />
        <div className={classes.dragonScales} />
        <div className={classes.heatWave} />
        {fireParticles}
        {embers}

        {/* <h1 className={classes.scoreBoardTitle}>🐉 SCOREBOARD 🐉</h1> */}

        <div className='row u-center' style='align-items: initial !important'>
          <div className='col-12 u-center'>
            <div className='col-8'>
              <Graph graphData={graphData} />
            </div>
          </div>
          <div className='col-3'>
            <div className={`frame ${classes.frame}`}>
              <div className='frame__body'>
                {Object.keys(config.divisions).length > 1 && (
                  <>
                    <div className='frame__subtitle'>Filter by division</div>
                    <div className='input-control'>
                      <select
                        required
                        className='select'
                        name='division'
                        value={division}
                        onChange={divisionChangeHandler}
                      >
                        <option value='all' selected>
                          All
                        </option>
                        {Object.entries(config.divisions).map(
                          ([code, name]) => {
                            return (
                              <option key={code} value={code}>
                                {name}
                              </option>
                            )
                          }
                        )}
                      </select>
                    </div>
                  </>
                )}
                <div className='frame__subtitle'>Teams per page</div>
                <div className='input-control'>
                  <select
                    required
                    className='select'
                    name='pagesize'
                    value={pageSize}
                    onChange={pageSizeChangeHandler}
                  >
                    {PAGESIZE_OPTIONS.map(sz => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
                {loggedIn && (
                  <div className='btn-container u-center'>
                    <button
                      disabled={!isUserOnCurrentScoreboard}
                      onClick={goToSelfPage}
                    >
                      Go to my team
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className='col-6'>
            <div className={`frame ${classes.frame} ${classes.tableFrame}`}>
              <div className='frame__body'>
                <table className={`table small ${classes.table}`}>
                  <thead>
                    <tr>
                      <th style='width: 3.5em'>#</th>
                      <th>Team</th>
                      <th style='width: 5em'>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map(({ id, name, score, rank }) => {
                      const isSelf = profile != null && profile.id === id
                      let rankClass = ''
                      if (rank === 1) rankClass = classes.rank1
                      else if (rank === 2) rankClass = classes.rank2
                      else if (rank === 3) rankClass = classes.rank3

                      return (
                        <tr
                          key={id}
                          className={isSelf ? classes.selected : ''}
                          ref={isSelf ? selfRow : null}
                        >
                          <td>
                            {rank <= 3 ? (
                              <span
                                className={`${classes.rankBadge} ${rankClass}`}
                              >
                                {rank}
                              </span>
                            ) : (
                              rank
                            )}
                          </td>
                          <td>
                            <Link to={`/profile/${id}`}>{name}</Link>
                          </td>
                          <td>{score}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              {totalItems > pageSize && (
                <Pagination
                  {...{ totalItems, pageSize, page, setPage }}
                  numVisiblePages={9}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
)

export default Scoreboard
