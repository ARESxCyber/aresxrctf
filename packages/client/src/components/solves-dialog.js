import { Fragment } from 'preact'
import { useCallback } from 'preact/hooks'
import { Link } from 'react-router-dom'
import Modal from './modal'
import Pagination from './pagination'
import withStyles from './jss'
import { formatRelativeTime } from '../util/time'
import Clock from '../icons/clock.svg'

const SolvesDialog = withStyles(
  {
    '@keyframes fadeIn': {
      '0%': { opacity: 0, transform: 'scale(0.95)' },
      '100%': { opacity: 1, transform: 'scale(1)' },
    },
    '@keyframes slideInUp': {
      '0%': { opacity: 0, transform: 'translateY(20px)' },
      '100%': { opacity: 1, transform: 'translateY(0)' },
    },
    '@keyframes glowPulse': {
      '0%, 100%': {
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.4)',
      },
      '50%': {
        boxShadow: '0 0 35px rgba(220, 38, 38, 0.8)',
      },
    },
    '@keyframes clockRotate': {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    button: {
      fontFamily: 'inherit',
      background:
        'linear-gradient(135deg, #dc2626, #991b1b, #dc2626) !important',
      color: '#fff !important',
      border: '2px solid rgba(220, 38, 38, 0.8) !important',
      fontWeight: '900 !important',
      textTransform: 'uppercase !important',
      letterSpacing: '0.1em !important',
      padding: '0.8em 2em !important',
      borderRadius: '8px !important',
      transition: 'all 0.3s ease !important',
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.4) !important',
      '&:hover': {
        transform: 'translateY(-3px) scale(1.05) !important',
        boxShadow: '0 5px 30px rgba(220, 38, 38, 0.7) !important',
        background:
          'linear-gradient(135deg, #ef4444, #dc2626, #ef4444) !important',
      },
    },
    table: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, max-content)',
      gap: '0.5rem',
      animation: '$fadeIn 0.5s ease-out',
      '& div': {
        margin: 'auto',
        padding: '12px 20px',
        textAlign: 'center',
        whiteSpace: 'nowrap',
        color: '#e5e5e5',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
      },
    },
    label: {
      borderBottom: '3px solid rgba(220, 38, 38, 0.6)',
      width: '100%',
      textAlign: 'center',
      color: '#ff6b6b !important',
      fontSize: '1.1rem',
      fontWeight: '900 !important',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
      padding: '1rem 1.5rem !important',
      background: 'rgba(220, 38, 38, 0.1)',
      borderRadius: '8px 8px 0 0',
    },
    row: {
      display: 'contents',
      '& > div': {
        animation: '$slideInUp 0.3s ease-out',
        animationFillMode: 'backwards',
      },
    },
    number: {
      color: '#ff8888 !important',
      fontSize: '1.1rem',
      fontWeight: '900 !important',
      textShadow: '0 0 5px rgba(220, 38, 38, 0.5)',
      background: 'rgba(220, 38, 38, 0.1)',
      borderRadius: '6px',
      '&:hover': {
        background: 'rgba(220, 38, 38, 0.2)',
        transform: 'scale(1.05)',
      },
    },
    name: {
      overflow: 'hidden',
      width: '300px',
      background: 'rgba(220, 38, 38, 0.05)',
      borderRadius: '6px',
      '&:hover': {
        background: 'rgba(220, 38, 38, 0.15)',
        transform: 'translateX(5px)',
      },
      '& a': {
        color: '#ff6b6b !important',
        fontWeight: 'bold !important',
        textDecoration: 'none',
        textShadow: '0 0 5px rgba(220, 38, 38, 0.5)',
        '&:hover': {
          color: '#ff4444 !important',
          textShadow: '0 0 15px rgba(220, 38, 38, 0.8)',
        },
      },
    },
    time: {
      color: '#ffaaaa !important',
      fontWeight: 'bold',
      background: 'rgba(220, 38, 38, 0.05)',
      borderRadius: '6px',
      '&:hover': {
        background: 'rgba(220, 38, 38, 0.15)',
        transform: 'scale(1.02)',
      },
    },
    inlineLabel: {
      display: 'none',
    },
    icon: {
      width: '80px',
      margin: 'auto',
      marginBottom: '1.5rem',
      animation: '$clockRotate 20s linear infinite',
      '& svg': {
        fill: '#ff6b6b',
        filter: 'drop-shadow(0 0 20px rgba(220, 38, 38, 0.8))',
      },
    },
    empty: {
      padding: '3rem',
      textAlign: 'center',
      animation: '$fadeIn 0.5s ease-out',
      '& h5': {
        color: '#ff6b6b !important',
        fontSize: '1.8rem',
        fontWeight: '900 !important',
        textShadow: '0 0 15px rgba(220, 38, 38, 0.8)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        marginTop: '1rem',
      },
    },
    modalBody: {
      maxHeight: '60vh !important',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '8px',
      padding: '1.5rem !important',
    },
    modalHeader: {
      background:
        'linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(153, 27, 27, 0.1))',
      borderBottom: '3px solid rgba(220, 38, 38, 0.6)',
      padding: '1.5rem 2rem !important',
      '& .modal-title': {
        color: '#ff6b6b !important',
        fontSize: '2rem !important',
        fontWeight: '900 !important',
        textShadow:
          '0 0 15px rgba(220, 38, 38, 0.8), 4px 4px 0 #991b1b !important',
        letterSpacing: '0.05em !important',
        textTransform: 'uppercase !important',
        animation: '$glowPulse 2s ease-in-out infinite',
      },
    },
    modalFooter: {
      background: 'rgba(0, 0, 0, 0.3)',
      borderTop: '3px solid rgba(220, 38, 38, 0.6)',
      padding: '1.5rem 2rem !important',
      display: 'flex',
      justifyContent: 'center',
    },
    '@media (max-width: 768px)': {
      inlineLabel: {
        display: 'initial',
        borderRight: '2px solid rgba(220, 38, 38, 0.4)',
        color: '#ff8888 !important',
        fontWeight: 'bold !important',
        fontSize: '0.9rem',
        background: 'rgba(220, 38, 38, 0.15)',
      },
      table: {
        gridTemplateColumns: 'repeat(2, minmax(max-content, 1fr))',
        '& div': {
          margin: '0',
        },
      },
      label: {
        display: 'none',
      },
      number: {
        borderTop: '2px solid rgba(220, 38, 38, 0.4)',
      },
      name: {
        width: 'initial',
        maxWidth: '300px',
      },
    },
  },
  ({
    onClose,
    classes,
    challName,
    solveCount,
    solves,
    page,
    setPage,
    pageSize,
    modalBodyRef,
    ...props
  }) => {
    const wrappedOnClose = useCallback(
      e => {
        e.preventDefault()
        onClose()
      },
      [onClose]
    )

    return (
      <Modal {...props} open={solves !== null} onClose={onClose}>
        {solves !== null && (
          <Fragment>
            {solves.length === 0 ? (
              <div className={classes.empty}>
                <div className={classes.icon}>
                  <Clock />
                </div>
                <h5>🐉 {challName} has no solves yet 🐉</h5>
              </div>
            ) : (
              <Fragment>
                <div className={`modal-header ${classes.modalHeader}`}>
                  <div className='modal-title'>
                    🏆 Solves for {challName} 🏆
                  </div>
                </div>
                <div
                  className={`modal-body ${classes.modalBody}`}
                  ref={modalBodyRef}
                >
                  <div className={classes.table}>
                    <div className={classes.label}>#</div>
                    <div className={classes.label}>Team</div>
                    <div className={classes.label}>Solve Time</div>
                    {solves.map((solve, i) => (
                      <div className={classes.row} key={solve.userId}>
                        <div
                          className={`${classes.inlineLabel} ${classes.number}`}
                        >
                          #
                        </div>
                        <div
                          className={classes.number}
                          style={{
                            animationDelay: `${i * 0.05}s`,
                          }}
                        >
                          {(page - 1) * pageSize + i + 1}
                        </div>
                        <div className={classes.inlineLabel}>Team</div>
                        <div
                          className={classes.name}
                          style={{
                            animationDelay: `${i * 0.05}s`,
                          }}
                        >
                          <Link to={`/profile/${solve.userId}`}>
                            {solve.userName}
                          </Link>
                        </div>
                        <div className={classes.inlineLabel}>Time</div>
                        <div
                          className={classes.time}
                          style={{
                            animationDelay: `${i * 0.05}s`,
                          }}
                        >
                          {formatRelativeTime(solve.createdAt)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    {...{ totalItems: solveCount, pageSize, page, setPage }}
                    numVisiblePages={9}
                  />
                </div>
              </Fragment>
            )}
            <div className={`modal-footer ${classes.modalFooter}`}>
              <div className='btn-container u-inline-block'>
                <button
                  className={`btn-small outline ${classes.button}`}
                  onClick={wrappedOnClose}
                >
                  Close
                </button>
              </div>
            </div>
          </Fragment>
        )}
      </Modal>
    )
  }
)

export default SolvesDialog
