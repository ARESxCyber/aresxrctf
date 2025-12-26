import withStyles from '../components/jss'
import { useState, useCallback, useRef } from 'preact/hooks'

import { submitFlag, getSolves } from '../api/challenges'
import { useToast } from './toast'
import SolvesDialog from './solves-dialog'
import Markdown from './markdown'

const ExternalLink = props => <a {...props} target='_blank' />

const markdownComponents = {
  A: ExternalLink,
}

const solvesPageSize = 10

const Problem = ({ classes, problem, solved, setSolved }) => {
  const { toast } = useToast()

  const hasDownloads = problem.files.length !== 0

  const [error, setError] = useState(undefined)
  const hasError = error !== undefined

  const [value, setValue] = useState('')
  const handleInputChange = useCallback(e => setValue(e.target.value), [])

  const handleSubmit = useCallback(
    e => {
      e.preventDefault()

      submitFlag(problem.id, value.trim()).then(({ error }) => {
        if (error === undefined) {
          toast({ body: 'Flag successfully submitted!' })

          setSolved(problem.id)
        } else {
          toast({ body: error, type: 'error' })
          setError(error)
        }
      })
    },
    [toast, setSolved, problem, value]
  )

  const [solves, setSolves] = useState(null)
  const [solvesPending, setSolvesPending] = useState(false)
  const [solvesPage, setSolvesPage] = useState(1)
  const modalBodyRef = useRef(null)
  const handleSetSolvesPage = useCallback(
    async newPage => {
      const { kind, message, data } = await getSolves({
        challId: problem.id,
        limit: solvesPageSize,
        offset: (newPage - 1) * solvesPageSize,
      })
      if (kind !== 'goodChallengeSolves') {
        toast({ body: message, type: 'error' })
        return
      }
      setSolves(data.solves)
      setSolvesPage(newPage)
      modalBodyRef.current.scrollTop = 0
    },
    [problem.id, toast]
  )
  const onSolvesClick = useCallback(
    async e => {
      e.preventDefault()
      if (solvesPending) {
        return
      }
      setSolvesPending(true)
      const { kind, message, data } = await getSolves({
        challId: problem.id,
        limit: solvesPageSize,
        offset: 0,
      })
      setSolvesPending(false)
      if (kind !== 'goodChallengeSolves') {
        toast({ body: message, type: 'error' })
        return
      }
      setSolves(data.solves)
      setSolvesPage(1)
    },
    [problem.id, toast, solvesPending]
  )
  const onSolvesClose = useCallback(() => setSolves(null), [])

  return (
    <div
      className={`frame ${classes.frame} ${solved ? classes.solvedFrame : ''}`}
    >
      <div className='frame__body'>
        <div className='row u-no-padding'>
          <div className='col-6 u-no-padding'>
            <div className={`frame__title title ${classes.title}`}>
              {solved && <span className={classes.solvedBadge}>✓ </span>}
              {problem.category}/{problem.name}
            </div>
            <div className={`frame__subtitle u-no-margin ${classes.author}`}>
              {problem.author}
            </div>
          </div>
          <div className='col-6 u-no-padding u-text-right'>
            <a
              className={`${classes.points} ${
                solvesPending ? classes.solvesPending : ''
              }`}
              onClick={onSolvesClick}
            >
              <span className={classes.solvesText}>
                {problem.solves}
                {problem.solves === 1 ? ' solve' : ' solves'}
              </span>
              <span className={classes.separator}> • </span>
              <span className={classes.pointsText}>
                {problem.points}
                {problem.points === 1 ? ' pt' : ' pts'}
              </span>
            </a>
          </div>
        </div>

        <div className='content-no-padding u-center'>
          <div className={`divider ${classes.divider}`} />
        </div>

        <div className={`${classes.description} frame__subtitle`}>
          <Markdown
            content={problem.description}
            components={markdownComponents}
          />
        </div>
        <form className='form-section' onSubmit={handleSubmit}>
          <div className='form-group'>
            <input
              autoComplete='off'
              autoCorrect='off'
              className={`form-group-input input-small ${classes.input} ${
                hasError ? classes.inputError : ''
              } ${solved ? classes.inputSuccess : ''}`}
              placeholder={`Flag${solved ? ' (solved)' : ''}`}
              value={value}
              onChange={handleInputChange}
            />
            <button className={`form-group-btn btn-small ${classes.submit}`}>
              Submit
            </button>
          </div>
        </form>

        {hasDownloads && (
          <div className={classes.downloadsSection}>
            <p
              className={`frame__subtitle u-no-margin ${classes.downloadsTitle}`}
            >
              📥 Downloads
            </p>
            <div className='tag-container'>
              {problem.files.map(file => {
                return (
                  <div className={`tag ${classes.tag}`} key={file.url}>
                    <a download href={`${file.url}`}>
                      {file.name}
                    </a>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
      <SolvesDialog
        solves={solves}
        challName={problem.name}
        solveCount={problem.solves}
        pageSize={solvesPageSize}
        page={solvesPage}
        setPage={handleSetSolvesPage}
        onClose={onSolvesClose}
        modalBodyRef={modalBodyRef}
      />
    </div>
  )
}

export default withStyles(
  {
    '@keyframes borderGlow': {
      '0%, 100%': { opacity: 0.5 },
      '50%': { opacity: 1 },
    },
    '@keyframes solvedPulse': {
      '0%, 100%': {
        boxShadow:
          '0 0 30px rgba(34, 197, 94, 0.4), inset 0 0 30px rgba(34, 197, 94, 0.1)',
      },
      '50%': {
        boxShadow:
          '0 0 50px rgba(34, 197, 94, 0.6), inset 0 0 50px rgba(34, 197, 94, 0.2)',
      },
    },
    '@keyframes successGlow': {
      '0%, 100%': {
        boxShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
      },
      '50%': {
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)',
      },
    },
    '@keyframes errorShake': {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
    },
    '@keyframes pointsHover': {
      '0%, 100%': {
        textShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
      },
      '50%': {
        textShadow:
          '0 0 20px rgba(220, 38, 38, 1), 0 0 30px rgba(220, 38, 38, 0.6)',
      },
    },
    frame: {
      marginBottom: '1.5em',
      paddingBottom: '1.25em',
      position: 'relative',
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.5)',
      borderRadius: '12px',
      boxShadow:
        '0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 40px rgba(153, 27, 27, 0.15)',
      transition: 'all 0.4s ease',
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
      '&:hover': {
        transform: 'translateY(-5px) scale(1.01)',
        boxShadow:
          '0 10px 60px rgba(220, 38, 38, 0.5), inset 0 0 50px rgba(153, 27, 27, 0.2)',
        borderColor: 'rgba(220, 38, 38, 0.8)',
      },
    },
    solvedFrame: {
      border: '3px solid rgba(34, 197, 94, 0.6)',
      animation: '$solvedPulse 3s ease-in-out infinite',
      '&::before': {
        background:
          'linear-gradient(45deg, transparent, rgba(34, 197, 94, 0.3), transparent)',
      },
      '&:hover': {
        borderColor: 'rgba(34, 197, 94, 0.9)',
        boxShadow:
          '0 10px 60px rgba(34, 197, 94, 0.5), inset 0 0 50px rgba(34, 197, 94, 0.2)',
      },
    },
    title: {
      color: '#ff6b6b',
      fontSize: '1.4rem',
      fontWeight: 900,
      letterSpacing: '0.05em',
      textShadow:
        '0 0 15px rgba(220, 38, 38, 0.8), 0 0 25px rgba(220, 38, 38, 0.4)',
      transition: 'all 0.3s ease',
    },
    solvedBadge: {
      color: '#22c55e',
      textShadow: '0 0 15px rgba(34, 197, 94, 0.8)',
      marginRight: '0.3em',
      animation: '$successGlow 2s ease-in-out infinite',
    },
    author: {
      color: '#fca5a5',
      fontWeight: 'bold',
      fontSize: '0.95rem',
      textShadow: '0 0 10px rgba(220, 38, 38, 0.4)',
      marginTop: '0.3em',
    },
    description: {
      color: '#e5e5e5',
      '& a': {
        display: 'inline',
        padding: 0,
        color: '#ff6b6b',
        fontWeight: 'bold',
        textDecoration: 'none',
        transition: 'all 0.3s ease',
        textShadow: '0 0 5px rgba(220, 38, 38, 0.5)',
        '&:hover': {
          color: '#ff4444',
          textShadow: '0 0 15px rgba(220, 38, 38, 0.8)',
        },
      },
      '& p': {
        lineHeight: '1.6em',
        fontSize: '1.05em',
        marginTop: 0,
      },
      '& pre': {
        whiteSpace: 'pre-wrap',
        background: 'rgba(0, 0, 0, 0.5)',
        padding: '1em',
        borderRadius: '8px',
        border: '2px solid rgba(220, 38, 38, 0.3)',
        color: '#ff8888',
      },
      '& code': {
        background: 'rgba(220, 38, 38, 0.2)',
        padding: '0.2em 0.5em',
        borderRadius: '4px',
        color: '#ff8888',
        fontSize: '0.95em',
        border: '1px solid rgba(220, 38, 38, 0.3)',
      },
      '& blockquote': {
        background: 'rgba(220, 38, 38, 0.1) !important',
        borderLeft: '4px solid rgba(220, 38, 38, 0.6)',
        padding: '0.5em 1em',
        margin: '1em 0',
        fontStyle: 'italic',
        color: '#ffaaaa',
      },
    },
    divider: {
      margin: '1em',
      width: '90%',
      height: '3px',
      background:
        'linear-gradient(to right, transparent, #dc2626, transparent)',
      boxShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
      border: 'none',
    },
    points: {
      marginTop: '0.75rem !important',
      marginBottom: '0 !important',
      cursor: 'pointer',
      display: 'inline-block',
      transition: 'all 0.3s ease',
      color: '#ff8888',
      fontWeight: 'bold',
      fontSize: '1.1rem',
      padding: '0.5em 1em',
      borderRadius: '8px',
      background: 'rgba(220, 38, 38, 0.2)',
      border: '2px solid rgba(220, 38, 38, 0.4)',
      textShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
      '&:hover': {
        background: 'rgba(220, 38, 38, 0.3)',
        borderColor: 'rgba(220, 38, 38, 0.7)',
        transform: 'translateY(-2px) scale(1.05)',
        boxShadow: '0 5px 20px rgba(220, 38, 38, 0.4)',
        animation: '$pointsHover 1s ease-in-out infinite',
      },
    },
    solvesText: {
      color: '#ffaaaa',
    },
    separator: {
      color: '#dc2626',
      fontWeight: 'bold',
    },
    pointsText: {
      color: '#ff6b6b',
      fontWeight: 900,
    },
    solvesPending: {
      opacity: '0.5',
      pointerEvents: 'none',
      cursor: 'default',
    },
    tag: {
      background: 'linear-gradient(135deg, #1a0000, #330000)',
      border: '2px solid rgba(220, 38, 38, 0.4)',
      borderRadius: '6px',
      transition: 'all 0.3s ease',
      padding: '0.5em 1em',
      margin: '0.3em',
      '& a': {
        color: '#ff8888',
        fontWeight: 'bold',
        textDecoration: 'none',
        textShadow: '0 0 5px rgba(220, 38, 38, 0.5)',
      },
      '&:hover': {
        background: 'linear-gradient(135deg, #2a0000, #440000)',
        borderColor: 'rgba(220, 38, 38, 0.7)',
        transform: 'translateY(-3px) scale(1.05)',
        boxShadow: '0 5px 20px rgba(220, 38, 38, 0.4)',
        '& a': {
          color: '#ffaaaa',
          textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
        },
      },
    },
    input: {
      background: 'linear-gradient(135deg, #1a0000, #330000) !important',
      color: '#ff8888 !important',
      border: '2px solid rgba(220, 38, 38, 0.4) !important',
      borderRadius: '8px !important',
      fontSize: '1rem !important',
      fontWeight: 'bold !important',
      textShadow: '0 0 5px rgba(220, 38, 38, 0.3) !important',
      transition: 'all 0.3s ease !important',
      '&:focus': {
        borderColor: 'rgba(220, 38, 38, 0.8) !important',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.5) !important',
        background: 'linear-gradient(135deg, #2a0000, #440000) !important',
        outline: 'none !important',
      },
      '&::placeholder': {
        color: '#995555 !important',
      },
    },
    inputError: {
      borderColor: 'rgba(239, 68, 68, 0.8) !important',
      animation: '$errorShake 0.5s ease-in-out',
      boxShadow: '0 0 20px rgba(239, 68, 68, 0.6) !important',
    },
    inputSuccess: {
      borderColor: 'rgba(34, 197, 94, 0.8) !important',
      boxShadow: '0 0 20px rgba(34, 197, 94, 0.5) !important',
      animation: '$successGlow 2s ease-in-out infinite',
      background: 'linear-gradient(135deg, #001a00, #003300) !important',
      color: '#88ff88 !important',
    },
    submit: {
      background:
        'linear-gradient(135deg, #dc2626, #991b1b, #dc2626) !important',
      color: '#fff !important',
      border: '2px solid rgba(220, 38, 38, 0.8) !important',
      borderRadius: '8px !important',
      fontSize: '1rem !important',
      fontWeight: '900 !important',
      textTransform: 'uppercase !important',
      letterSpacing: '0.1em !important',
      textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5) !important',
      boxShadow:
        '0 0 20px rgba(220, 38, 38, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1) !important',
      transition: 'all 0.3s ease !important',
      cursor: 'pointer !important',
      '&:hover': {
        background:
          'linear-gradient(135deg, #ef4444, #dc2626, #ef4444) !important',
        transform: 'translateY(-2px) scale(1.05) !important',
        boxShadow:
          '0 5px 30px rgba(220, 38, 38, 0.8), inset 0 0 15px rgba(255, 255, 255, 0.2) !important',
      },
      '&:active': {
        transform: 'translateY(0) scale(0.98) !important',
      },
    },
    downloadsSection: {
      marginTop: '1.5em',
      padding: '1em',
      background: 'rgba(220, 38, 38, 0.05)',
      borderRadius: '8px',
      border: '2px solid rgba(220, 38, 38, 0.2)',
    },
    downloadsTitle: {
      color: '#ff8888',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(220, 38, 38, 0.6)',
      marginBottom: '0.75em',
    },
  },
  Problem
)
