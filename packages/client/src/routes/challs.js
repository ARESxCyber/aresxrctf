import { useCallback, useState, useEffect, useMemo } from 'preact/hooks'

import config from '../config'
import withStyles from '../components/jss'
import Problem from '../components/problem'
import NotStarted from '../components/not-started'
import { useToast } from '../components/toast'

import { getChallenges, getPrivateSolves } from '../api/challenges'

const loadStates = {
  pending: 0,
  notStarted: 1,
  loaded: 2,
}

const Challenges = ({ classes }) => {
  const challPageState = useMemo(
    () => JSON.parse(localStorage.getItem('challPageState') || '{}'),
    []
  )
  const [problems, setProblems] = useState(null)
  const [categories, setCategories] = useState(challPageState.categories || {})
  const [showSolved, setShowSolved] = useState(
    challPageState.showSolved || false
  )
  const [solveIDs, setSolveIDs] = useState([])
  const [loadState, setLoadState] = useState(loadStates.pending)
  const { toast } = useToast()

  const setSolved = useCallback(id => {
    setSolveIDs(solveIDs => {
      if (!solveIDs.includes(id)) {
        return [...solveIDs, id]
      }
      return solveIDs
    })
  }, [])

  const handleShowSolvedChange = useCallback(e => {
    setShowSolved(e.target.checked)
  }, [])

  const handleCategoryCheckedChange = useCallback(e => {
    setCategories(categories => ({
      ...categories,
      [e.target.dataset.category]: e.target.checked,
    }))
  }, [])

  useEffect(() => {
    document.title = `Challenges | ${config.ctfName}`
  }, [])

  useEffect(() => {
    const action = async () => {
      if (problems !== null) {
        return
      }
      const { data, error, notStarted } = await getChallenges()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      setLoadState(notStarted ? loadStates.notStarted : loadStates.loaded)
      if (notStarted) {
        return
      }

      const newCategories = { ...categories }
      data.forEach(problem => {
        if (newCategories[problem.category] === undefined) {
          newCategories[problem.category] = false
        }
      })

      setProblems(data)
      setCategories(newCategories)
    }
    action()
  }, [toast, categories, problems])

  useEffect(() => {
    const action = async () => {
      const { data, error } = await getPrivateSolves()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      setSolveIDs(data.map(solve => solve.id))
    }
    action()
  }, [toast])

  useEffect(() => {
    localStorage.challPageState = JSON.stringify({ categories, showSolved })
  }, [categories, showSolved])

  const problemsToDisplay = useMemo(() => {
    if (problems === null) {
      return []
    }
    let filtered = problems
    if (!showSolved) {
      filtered = filtered.filter(problem => !solveIDs.includes(problem.id))
    }
    let filterCategories = false
    Object.values(categories).forEach(displayCategory => {
      if (displayCategory) filterCategories = true
    })
    if (filterCategories) {
      Object.keys(categories).forEach(category => {
        if (categories[category] === false) {
          filtered = filtered.filter(problem => problem.category !== category)
        }
      })
    }

    filtered.sort((a, b) => {
      if (a.points === b.points) {
        if (a.solves === b.solves) {
          const aWeight = a.sortWeight || 0
          const bWeight = b.sortWeight || 0

          return bWeight - aWeight
        }
        return b.solves - a.solves
      }
      return a.points - b.points
    })

    return filtered
  }, [problems, categories, showSolved, solveIDs])

  const { categoryCounts, solvedCount } = useMemo(() => {
    const categoryCounts = new Map()
    let solvedCount = 0
    if (problems !== null) {
      for (const problem of problems) {
        if (!categoryCounts.has(problem.category)) {
          categoryCounts.set(problem.category, {
            total: 0,
            solved: 0,
          })
        }

        const solved = solveIDs.includes(problem.id)
        categoryCounts.get(problem.category).total += 1
        if (solved) {
          categoryCounts.get(problem.category).solved += 1
        }

        if (solved) {
          solvedCount += 1
        }
      }
    }
    return { categoryCounts, solvedCount }
  }, [problems, solveIDs])

  // Generate fire effects
  const embers = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, i) => (
        <div
          key={`ember-${i}`}
          className={classes.ember}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      )),
    [classes.ember]
  )

  const fireParticles = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => {
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
      }),
    [classes.fireParticle]
  )

  if (loadState === loadStates.pending) {
    return null
  }

  if (loadState === loadStates.notStarted) {
    return (
      <div className={classes.wrapper}>
        <div className={classes.backgroundPulse} />
        <div className={classes.dragonScales} />
        <div className={classes.heatWave} />
        {fireParticles}
        {embers}
        <NotStarted />
      </div>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.backgroundPulse} />
      <div className={classes.dragonScales} />
      <div className={classes.heatWave} />
      {fireParticles}
      {embers}

      <h1 className={classes.pageTitle}>🐉 CHALLENGES 🐉</h1>

      <div className={`row ${classes.row}`}>
        <div className='col-3'>
          <div className={`frame ${classes.frame} ${classes.filterFrame}`}>
            <div className='frame__body'>
              <div className={`frame__title title ${classes.frameTitle}`}>
                🔥 Filters
              </div>
              <div className={classes.showSolved}>
                <div className='form-ext-control form-ext-checkbox'>
                  <input
                    id='show-solved'
                    className={`form-ext-input ${classes.checkbox}`}
                    type='checkbox'
                    checked={showSolved}
                    onChange={handleShowSolvedChange}
                  />
                  <label
                    htmlFor='show-solved'
                    className={`form-ext-label ${classes.checkboxLabel}`}
                  >
                    Show Solved ({solvedCount}/{problems.length} solved)
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className={`frame ${classes.frame} ${classes.categoryFrame}`}>
            <div className='frame__body'>
              <div className={`frame__title title ${classes.frameTitle}`}>
                📂 Categories
              </div>
              {Array.from(categoryCounts.entries())
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([category, { solved, total }]) => {
                  return (
                    <div
                      key={category}
                      className={`form-ext-control form-ext-checkbox ${classes.categoryItem}`}
                    >
                      <input
                        id={`category-${category}`}
                        data-category={category}
                        className={`form-ext-input ${classes.checkbox}`}
                        type='checkbox'
                        checked={categories[category]}
                        onChange={handleCategoryCheckedChange}
                      />
                      <label
                        htmlFor={`category-${category}`}
                        className={`form-ext-label ${classes.checkboxLabel}`}
                      >
                        {category} ({solved}/{total} solved)
                      </label>
                    </div>
                  )
                })}
            </div>
          </div>
        </div>
        <div className='col-6'>
          <div className={classes.problemsContainer}>
            {problemsToDisplay.map((problem, index) => {
              return (
                <div
                  key={problem.id}
                  className={classes.problemWrapper}
                  style={{
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  <Problem
                    problem={problem}
                    solved={solveIDs.includes(problem.id)}
                    setSolved={setSolved}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default withStyles(
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
    '@keyframes scaleMove': {
      '0%': { backgroundPosition: '0 0' },
      '100%': { backgroundPosition: '70px 70px' },
    },
    '@keyframes borderGlow': {
      '0%, 100%': { opacity: 0.5 },
      '50%': { opacity: 1 },
    },
    '@keyframes titlePulse': {
      '0%, 100%': {
        textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.5)',
      },
      '50%': {
        textShadow: '4px 4px 0 #991b1b, 8px 8px 40px rgba(220, 38, 38, 0.9)',
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
    '@keyframes slideInUp': {
      '0%': {
        opacity: 0,
        transform: 'translateY(30px)',
      },
      '100%': {
        opacity: 1,
        transform: 'translateY(0)',
      },
    },
    '@keyframes checkboxGlow': {
      '0%, 100%': {
        boxShadow: '0 0 5px rgba(220, 38, 38, 0.3)',
      },
      '50%': {
        boxShadow: '0 0 15px rgba(220, 38, 38, 0.6)',
      },
    },
    wrapper: {
      position: 'relative',
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, #000000, #450a0a, #000000)',
      paddingTop: '2rem',
      paddingBottom: '3rem',
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
    heatWave: {
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      zIndex: 1,
      background:
        'linear-gradient(to top, rgba(220, 38, 38, 0.5) 0%, rgba(255, 69, 0, 0.2) 30%, transparent 100%)',
      pointerEvents: 'none',
      animation: '$heatWave 3s ease-in-out infinite',
    },
    ember: {
      position: 'fixed',
      bottom: 0,
      width: '6px',
      height: '6px',
      borderRadius: '50%',
      background:
        'radial-gradient(circle, #ffaa00 0%, #ff4500 70%, transparent 100%)',
      boxShadow:
        '0 0 20px rgba(255, 165, 0, 1), 0 0 30px rgba(255, 69, 0, 0.8)',
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
    pageTitle: {
      textAlign: 'center',
      fontSize: '3.5rem',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.3em',
      marginBottom: '2rem',
      marginTop: '1rem',
      textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.8)',
      animation: '$titlePulse 2s ease-in-out infinite',
      position: 'relative',
      zIndex: 10,
    },
    showSolved: {
      marginBottom: '0.625em',
    },
    frame: {
      marginBottom: '1em',
      paddingBottom: '0.625em',
      position: 'relative',
      zIndex: 10,
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.6)',
      borderRadius: '12px',
      boxShadow:
        '0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 40px rgba(153, 27, 27, 0.15)',
      transition: 'all 0.3s ease',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background:
          'linear-gradient(45deg, transparent, rgba(220, 38, 38, 0.3), transparent)',
        animation: '$borderGlow 3s linear infinite',
        zIndex: -1,
        pointerEvents: 'none',
        borderRadius: '12px',
      },
    },
    filterFrame: {
      animation: '$slideInUp 0.5s ease-out',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow:
          '0 0 60px rgba(220, 38, 38, 0.5), inset 0 0 50px rgba(153, 27, 27, 0.2)',
      },
    },
    categoryFrame: {
      animation: '$slideInUp 0.5s ease-out 0.1s',
      animationFillMode: 'backwards',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow:
          '0 0 60px rgba(220, 38, 38, 0.5), inset 0 0 50px rgba(153, 27, 27, 0.2)',
      },
    },
    row: {
      justifyContent: 'center',
      position: 'relative',
      zIndex: 10,
      '& .title, & .frame__subtitle': {
        color: '#fff',
      },
    },
    frameTitle: {
      color: '#ff6b6b',
      fontSize: '1.3rem',
      fontWeight: 900,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      textShadow:
        '0 0 15px rgba(220, 38, 38, 0.8), 0 0 25px rgba(220, 38, 38, 0.4)',
      marginBottom: '1em',
    },
    checkbox: {
      accentColor: '#dc2626',
      cursor: 'pointer',
      width: '20px',
      height: '20px',
      '&:checked': {
        animation: '$checkboxGlow 1.5s ease-in-out infinite',
      },
    },
    checkboxLabel: {
      color: '#e5e5e5',
      fontWeight: 'bold',
      fontSize: '1rem',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textShadow: '0 0 5px rgba(220, 38, 38, 0.3)',
      '&:hover': {
        color: '#ff8888',
        textShadow: '0 0 15px rgba(220, 38, 38, 0.6)',
        transform: 'translateX(5px)',
      },
    },
    categoryItem: {
      marginBottom: '0.5em',
      transition: 'all 0.3s ease',
      padding: '0.3em',
      borderRadius: '6px',
      '&:hover': {
        background: 'rgba(220, 38, 38, 0.1)',
      },
    },
    problemsContainer: {
      position: 'relative',
      zIndex: 10,
    },
    problemWrapper: {
      animation: '$slideInUp 0.5s ease-out',
      animationFillMode: 'backwards',
    },
  },
  Challenges
)
