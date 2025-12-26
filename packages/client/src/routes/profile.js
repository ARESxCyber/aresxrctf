import { useState, useCallback, useEffect } from 'preact/hooks'
import { memo } from 'preact/compat'
import config from '../config'
import withStyles from '../components/jss'
import { useParams } from 'react-router-dom'

import {
  privateProfile,
  publicProfile,
  updateAccount,
  updateEmail,
  deleteEmail,
} from '../api/profile'
import { useToast } from '../components/toast'
import Form from '../components/form'
import MembersCard from '../components/profile/members-card'
import CtftimeCard from '../components/profile/ctftime-card'
import {
  PublicSolvesCard,
  PrivateSolvesCard,
} from '../components/profile/solves-card'
import TokenPreview from '../components/token-preview'
import * as util from '../util'
import Trophy from '../icons/trophy.svg'
import AddressBook from '../icons/address-book.svg'
import UserCircle from '../icons/user-circle.svg'
import EnvelopeOpen from '../icons/envelope-open.svg'
import Rank from '../icons/rank.svg'
import Ctftime from '../icons/ctftime.svg'
import useRecaptcha, { RecaptchaLegalNotice } from '../components/recaptcha'

const SummaryCard = memo(
  withStyles(
    {
      icon: {
        '& svg': {
          verticalAlign: 'middle',
          height: '1.25em',
          fill: '#ff6b6b',
          filter: 'drop-shadow(0 0 5px rgba(220, 38, 38, 0.6))',
        },
        marginRight: '1.5em',
      },
      publicHeader: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        margin: '0 !important',
        maxWidth: '75vw',
        color: '#ff6b6b',
        fontSize: '2.5rem',
        fontWeight: 900,
        textShadow: '0 0 15px rgba(220, 38, 38, 0.8), 4px 4px 0 #991b1b',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
      privateHeader: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        margin: '0 !important',
        maxWidth: '30vw',
        color: '#ff6b6b',
        fontSize: '2.5rem',
        fontWeight: 900,
        textShadow: '0 0 15px rgba(220, 38, 38, 0.8), 4px 4px 0 #991b1b',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      },
      '@media (max-width: 804px)': {
        privateHeader: {
          maxWidth: '75vw',
        },
      },
      wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '15px',
        paddingBottom: '15px',
        borderBottom: '3px solid rgba(220, 38, 38, 0.3)',
        marginBottom: '1.5rem',
      },
      actionBar: {
        '& p': {
          color: '#e5e5e5',
          fontSize: '1.1rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textShadow: '0 0 5px rgba(220, 38, 38, 0.3)',
          transition: 'all 0.3s ease',
          padding: '0.5rem',
          borderRadius: '6px',
          '&:hover': {
            background: 'rgba(220, 38, 38, 0.1)',
            transform: 'translateX(5px)',
          },
        },
      },
      ctftimeLink: {
        transition: 'all 0.3s ease',
        filter: 'drop-shadow(0 0 5px rgba(220, 38, 38, 0.6))',
        '&:hover': {
          filter: 'drop-shadow(0 0 15px rgba(220, 38, 38, 1))',
          transform: 'scale(1.2) rotate(5deg)',
        },
      },
    },
    ({
      name,
      score,
      division,
      divisionPlace,
      globalPlace,
      ctftimeId,
      classes,
      isPrivate,
    }) => (
      <div className='card'>
        <div className='content'>
          <div className={classes.wrapper}>
            <h5
              className={`title ${
                isPrivate ? classes.privateHeader : classes.publicHeader
              }`}
              title={name}
            >
              🐉 {name}
            </h5>
            {ctftimeId && (
              <a
                href={`https://ctftime.org/team/${ctftimeId}`}
                target='_blank'
                rel='noopener noreferrer'
                className={classes.ctftimeLink}
              >
                <Ctftime style='height: 24px;' />
              </a>
            )}
          </div>
          <div className={`action-bar ${classes.actionBar}`}>
            <p>
              <span className={`icon ${classes.icon}`}>
                <Trophy />
              </span>
              {score === 0 ? 'No points earned' : `${score} total points`}
            </p>
            <p>
              <span className={`icon ${classes.icon}`}>
                <Rank />
              </span>
              {score === 0
                ? 'Unranked'
                : `${divisionPlace} in the ${division} division`}
            </p>
            <p>
              <span className={`icon ${classes.icon}`}>
                <Rank />
              </span>
              {score === 0 ? 'Unranked' : `${globalPlace} across all teams`}
            </p>
            <p>
              <span className={`icon ${classes.icon}`}>
                <AddressBook />
              </span>
              {division} division
            </p>
          </div>
        </div>
      </div>
    )
  )
)

const TeamCodeCard = withStyles(
  {
    btn: {
      marginRight: '10px',
      background:
        'linear-gradient(135deg, #dc2626, #991b1b, #dc2626) !important',
      color: '#fff !important',
      border: '2px solid rgba(220, 38, 38, 0.8) !important',
      fontWeight: '900 !important',
      textTransform: 'uppercase !important',
      letterSpacing: '0.1em !important',
      transition: 'all 0.3s ease !important',
      boxShadow: '0 0 20px rgba(220, 38, 38, 0.4) !important',
      '&:hover': {
        transform: 'translateY(-3px) scale(1.05) !important',
        boxShadow: '0 5px 30px rgba(220, 38, 38, 0.7) !important',
      },
    },
    title: {
      color: '#ff6b6b',
      fontSize: '1.5rem',
      fontWeight: 900,
      textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
      marginBottom: '1rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    description: {
      color: '#e5e5e5',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
  },
  ({ teamToken, classes }) => {
    const { toast } = useToast()

    const tokenUrl = `${location.origin}/login?token=${encodeURIComponent(
      teamToken
    )}`

    const [reveal, setReveal] = useState(false)
    const toggleReveal = useCallback(() => setReveal(!reveal), [reveal])

    const onCopyClick = useCallback(() => {
      if (navigator.clipboard) {
        try {
          navigator.clipboard.writeText(tokenUrl).then(() => {
            toast({ body: 'Copied team invite URL to clipboard' })
          })
        } catch {}
      }
    }, [toast, tokenUrl])

    return (
      <div className='card'>
        <div className='content'>
          <p className={classes.title}>🔗 Team Invite</p>
          <p className={`font-thin ${classes.description}`}>
            Send this team invite URL to your teammates so they can login.
          </p>

          <button
            onClick={onCopyClick}
            className={`${classes.btn} btn-info u-center`}
            name='btn'
            value='submit'
            type='submit'
          >
            Copy
          </button>

          <button
            onClick={toggleReveal}
            className={`${classes.btn} btn-info u-center`}
            name='btn'
            value='submit'
            type='submit'
          >
            {reveal ? 'Hide' : 'Reveal'}
          </button>

          {reveal && <TokenPreview token={tokenUrl} />}
        </div>
      </div>
    )
  }
)

const UpdateCard = withStyles(
  {
    form: {
      '& button': {
        margin: 0,
        marginBottom: '0.4em',
        float: 'right',
        background:
          'linear-gradient(135deg, #dc2626, #991b1b, #dc2626) !important',
        color: '#fff !important',
        border: '2px solid rgba(220, 38, 38, 0.8) !important',
        fontWeight: '900 !important',
        textTransform: 'uppercase !important',
        letterSpacing: '0.1em !important',
        transition: 'all 0.3s ease !important',
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.4) !important',
        '&:hover:not(:disabled)': {
          transform: 'translateY(-3px) scale(1.05) !important',
          boxShadow: '0 5px 30px rgba(220, 38, 38, 0.7) !important',
        },
        '&:disabled': {
          opacity: '0.5 !important',
        },
      },
      padding: '0 !important',
      '& input, & select': {
        background: 'linear-gradient(135deg, #1a0000, #330000) !important',
        color: '#ff8888 !important',
        border: '2px solid rgba(220, 38, 38, 0.4) !important',
        borderRadius: '8px !important',
        fontWeight: 'bold !important',
        '&:focus': {
          borderColor: 'rgba(220, 38, 38, 0.8) !important',
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.5) !important',
        },
      },
    },
    divisionSelect: {
      paddingLeft: '2.75rem',
    },
    recaptchaLegalNotice: {
      marginTop: '20px',
    },
    title: {
      color: '#ff6b6b',
      fontSize: '1.5rem',
      fontWeight: 900,
      textShadow: '0 0 10px rgba(220, 38, 38, 0.8)',
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
    },
    description: {
      color: '#e5e5e5',
      fontSize: '0.95rem',
    },
  },
  ({
    name: oldName,
    email: oldEmail,
    divisionId: oldDivision,
    allowedDivisions,
    onUpdate,
    classes,
  }) => {
    const { toast } = useToast()
    const requestRecaptchaCode = useRecaptcha('setEmail')

    const [name, setName] = useState(oldName)
    const handleSetName = useCallback(e => setName(e.target.value), [])

    const [email, setEmail] = useState(oldEmail)
    const handleSetEmail = useCallback(e => setEmail(e.target.value), [])

    const [division, setDivision] = useState(oldDivision)
    const handleSetDivision = useCallback(e => setDivision(e.target.value), [])

    const [isButtonDisabled, setIsButtonDisabled] = useState(false)

    const doUpdate = useCallback(
      async e => {
        e.preventDefault()

        let updated = false

        if (name !== oldName || division !== oldDivision) {
          updated = true

          setIsButtonDisabled(true)
          const { error, data } = await updateAccount({
            name: oldName === name ? undefined : name,
            division: oldDivision === division ? undefined : division,
          })
          setIsButtonDisabled(false)

          if (error !== undefined) {
            toast({ body: error, type: 'error' })
            return
          }

          toast({ body: 'Profile updated' })

          onUpdate({
            name: data.user.name,
            divisionId: data.user.division,
          })
        }

        if (email !== oldEmail) {
          updated = true

          let error, data
          if (email === '') {
            setIsButtonDisabled(true)
            ;({ error, data } = await deleteEmail())
          } else {
            const recaptchaCode = await requestRecaptchaCode?.()
            setIsButtonDisabled(true)
            ;({ error, data } = await updateEmail({
              email,
              recaptchaCode,
            }))
          }

          setIsButtonDisabled(false)

          if (error !== undefined) {
            toast({ body: error, type: 'error' })
            return
          }

          toast({ body: data })
          onUpdate({ email })
        }

        if (!updated) {
          toast({ body: 'Nothing to update!' })
        }
      },
      [
        name,
        email,
        division,
        oldName,
        oldEmail,
        oldDivision,
        onUpdate,
        toast,
        requestRecaptchaCode,
      ]
    )

    return (
      <div className='card'>
        <div className='content'>
          <p className={classes.title}>⚙️ Update Information</p>
          <p className={`font-thin u-no-margin ${classes.description}`}>
            This will change how your team appears on the scoreboard. You may
            only change your team's name once every 10 minutes.
          </p>
          <div className='row u-center'>
            <Form
              class={`col-12 ${classes.form}`}
              onSubmit={doUpdate}
              disabled={isButtonDisabled}
              buttonText='Update'
            >
              <input
                required
                autoComplete='username'
                autoCorrect='off'
                maxLength='64'
                minLength='2'
                icon={<UserCircle />}
                name='name'
                placeholder='Team Name'
                type='text'
                value={name}
                onChange={handleSetName}
              />
              <input
                autoComplete='email'
                autoCorrect='off'
                icon={<EnvelopeOpen />}
                name='email'
                placeholder='Email'
                type='email'
                value={email}
                onChange={handleSetEmail}
              />
              <select
                icon={<AddressBook />}
                className={`select ${classes.divisionSelect}`}
                name='division'
                value={division}
                onChange={handleSetDivision}
              >
                <option value='' disabled>
                  Division
                </option>
                {allowedDivisions.map(code => {
                  return (
                    <option key={code} value={code}>
                      {config.divisions[code]}
                    </option>
                  )
                })}
              </select>
            </Form>
            {requestRecaptchaCode && (
              <div className={classes.recaptchaLegalNotice}>
                <RecaptchaLegalNotice />
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)

const Profile = ({ classes }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})
  const { toast } = useToast()

  const { uuid } = useParams()

  const {
    name,
    email,
    division: divisionId,
    score,
    solves,
    teamToken,
    ctftimeId,
    allowedDivisions,
  } = data
  const division = config.divisions[data.division]
  const divisionPlace = util.strings.placementString(data.divisionPlace)
  const globalPlace = util.strings.placementString(data.globalPlace)

  const isPrivate = uuid === undefined || uuid === 'me'

  useEffect(() => {
    setLoaded(false)
    if (isPrivate) {
      privateProfile().then(({ data, error }) => {
        if (error) {
          toast({ body: error, type: 'error' })
        } else {
          setData(data)
        }
        setLoaded(true)
      })
    } else {
      publicProfile(uuid).then(({ data, error }) => {
        if (error) {
          setError('Profile not found')
        } else {
          setData(data)
        }
        setLoaded(true)
      })
    }
  }, [uuid, isPrivate, toast])

  const onProfileUpdate = useCallback(
    ({ name, email, divisionId, ctftimeId }) => {
      setData(data => ({
        ...data,
        name: name === undefined ? data.name : name,
        email: email === undefined ? data.email : email,
        division: divisionId === undefined ? data.division : divisionId,
        ctftimeId: ctftimeId === undefined ? data.ctftimeId : ctftimeId,
      }))
    },
    []
  )

  useEffect(() => {
    document.title = `Profile | ${config.ctfName}`
  }, [])

  if (!loaded) return null

  if (error !== null) {
    return (
      <div className={classes.wrapper}>
        <div className={classes.backgroundPulse} />
        <div className={classes.dragonScales} />
        <div className='row u-center'>
          <div className='col-4'>
            <div className={`card ${classes.errorCard}`}>
              <div className='content'>
                <p className={classes.errorTitle}>⚠️ Error</p>
                <p className={classes.errorText}>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.backgroundPulse} />
      <div className={classes.dragonScales} />
      <div className={classes.heatWave} />
      <div className={classes.root}>
        {isPrivate && (
          <div className={classes.privateCol}>
            <TeamCodeCard {...{ teamToken }} />
            <UpdateCard
              {...{
                name,
                email,
                divisionId,
                allowedDivisions,
                onUpdate: onProfileUpdate,
              }}
            />
            {config.ctftime && (
              <CtftimeCard {...{ ctftimeId, onUpdate: onProfileUpdate }} />
            )}
          </div>
        )}
        <div className={classes.col}>
          <SummaryCard
            {...{
              name,
              score,
              division,
              divisionPlace,
              globalPlace,
              ctftimeId,
              isPrivate,
            }}
          />
          {isPrivate && config.userMembers && <MembersCard />}
          {isPrivate ? (
            <PrivateSolvesCard solves={solves} />
          ) : (
            <PublicSolvesCard solves={solves} />
          )}
        </div>
      </div>
    </div>
  )
}

export default withStyles(
  {
    '@keyframes pulse': {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    '@keyframes scaleMove': {
      '0%': { backgroundPosition: '0 0' },
      '100%': { backgroundPosition: '70px 70px' },
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
      height: '40%',
      zIndex: 1,
      background:
        'linear-gradient(to top, rgba(220, 38, 38, 0.3) 0%, rgba(255, 69, 0, 0.1) 30%, transparent 100%)',
      pointerEvents: 'none',
      animation: '$heatWave 3s ease-in-out infinite',
    },
    root: {
      position: 'relative',
      zIndex: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(384px, 1fr))',
      width: '100%',
      maxWidth: '1500px',
      margin: 'auto',
      gap: '20px',
      padding: '0 20px',
      '& .card': {
        background:
          'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
        backdropFilter: 'blur(15px)',
        border: '3px solid rgba(220, 38, 38, 0.6)',
        borderRadius: '12px',
        boxShadow:
          '0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 40px rgba(153, 27, 27, 0.15)',
        marginBottom: '20px',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow:
            '0 10px 60px rgba(220, 38, 38, 0.5), inset 0 0 50px rgba(153, 27, 27, 0.2)',
        },
      },
      '& input, & select, & option': {
        background: 'linear-gradient(135deg, #1a0000, #330000) !important',
        color: '#ff8888 !important',
      },
    },
    col: {
      margin: '0 auto',
      width: '100%',
    },
    privateCol: {
      width: '100%',
    },
    errorCard: {
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.8)',
      boxShadow: '0 0 60px rgba(220, 38, 38, 0.6)',
    },
    errorTitle: {
      color: '#ff6b6b',
      fontSize: '2rem',
      fontWeight: 900,
      textShadow: '0 0 15px rgba(220, 38, 38, 0.8)',
      marginBottom: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
    errorText: {
      color: '#e5e5e5',
      fontSize: '1.1rem',
      fontWeight: 'bold',
    },
  },
  Profile
)
