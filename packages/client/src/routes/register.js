import { Fragment, Component } from 'preact'
import Form from '../components/form'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { register, login, setAuthToken } from '../api/auth'
import CtftimeButton from '../components/ctftime-button'
import CtftimeAdditional from '../components/ctftime-additional'
import AuthOr from '../components/or'

import {
  loadRecaptcha,
  requestRecaptchaCode,
  RecaptchaLegalNotice,
} from '../components/recaptcha'

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
    '@keyframes inputGlow': {
      '0%, 100%': {
        boxShadow: '0 0 10px rgba(220, 38, 38, 0.3)',
      },
      '50%': {
        boxShadow: '0 0 20px rgba(220, 38, 38, 0.6)',
      },
    },
    wrapper: {
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(to bottom, #000000, #450a0a, #000000)',
      padding: '2rem 0',
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
    root: {
      flexDirection: 'column',
      position: 'relative',
      zIndex: 10,
    },
    title: {
      marginBottom: '20px',
      fontSize: '3rem',
      fontWeight: 900,
      color: '#fff',
      textTransform: 'uppercase',
      letterSpacing: '0.2em',
      textAlign: 'center',
      textShadow: '4px 4px 0 #991b1b, 8px 8px 20px rgba(220, 38, 38, 0.8)',
      animation: '$titlePulse 2s ease-in-out infinite',
    },
    subtitle: {
      textAlign: 'center',
      color: '#fca5a5',
      fontSize: '1.1rem',
      fontWeight: 'bold',
      letterSpacing: '0.1em',
      marginBottom: '2rem',
      textShadow: '0 0 10px rgba(220, 38, 38, 0.5)',
    },
    form: {
      padding: '2.5em',
      maxWidth: '600px',
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
      '& input': {
        background: 'linear-gradient(135deg, #1a0000, #330000) !important',
        color: '#ff8888 !important',
        border: '2px solid rgba(220, 38, 38, 0.4) !important',
        borderRadius: '8px !important',
        fontSize: '1rem !important',
        padding: '0.8em 1em !important',
        transition: 'all 0.3s ease !important',
        fontWeight: 'bold !important',
        textShadow: '0 0 5px rgba(220, 38, 38, 0.3) !important',
        '&:focus': {
          borderColor: 'rgba(220, 38, 38, 0.8) !important',
          boxShadow: '0 0 20px rgba(220, 38, 38, 0.5) !important',
          background: 'linear-gradient(135deg, #2a0000, #440000) !important',
          color: '#ffaaaa !important',
          outline: 'none !important',
        },
        '&::placeholder': {
          color: '#995555 !important',
        },
      },
      '& button[type="submit"]': {
        background:
          'linear-gradient(135deg, #dc2626, #991b1b, #dc2626) !important',
        color: '#fff !important',
        border: '2px solid rgba(220, 38, 38, 0.8) !important',
        borderRadius: '10px !important',
        fontSize: '1.2rem !important',
        fontWeight: '900 !important',
        padding: '0.8em 2em !important',
        textTransform: 'uppercase !important',
        letterSpacing: '0.15em !important',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5) !important',
        boxShadow:
          '0 0 30px rgba(220, 38, 38, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.1) !important',
        transition: 'all 0.3s ease !important',
        cursor: 'pointer !important',
        '&:hover:not(:disabled)': {
          background:
            'linear-gradient(135deg, #ef4444, #dc2626, #ef4444) !important',
          transform: 'translateY(-3px) scale(1.05) !important',
          boxShadow:
            '0 0 50px rgba(220, 38, 38, 0.9), inset 0 0 30px rgba(255, 255, 255, 0.2) !important',
        },
        '&:disabled': {
          opacity: '0.5 !important',
          cursor: 'not-allowed !important',
          transform: 'none !important',
        },
      },
    },
    submit: {
      marginTop: '1.5em',
    },
    or: {
      textAlign: 'center',
      position: 'relative',
      zIndex: 10,
    },
    recaptchaLegalNotice: {
      marginTop: '50px',
      position: 'relative',
      zIndex: 10,
      color: '#d1d5db',
      textAlign: 'center',
    },
    successMessage: {
      position: 'relative',
      zIndex: 10,
      padding: '3em',
      background:
        'linear-gradient(135deg, rgba(0,0,0,0.98), rgba(69,10,10,0.9), rgba(0,0,0,0.98))',
      backdropFilter: 'blur(15px)',
      border: '3px solid rgba(220, 38, 38, 0.6)',
      borderRadius: '16px',
      boxShadow:
        '0 0 60px rgba(220, 38, 38, 0.4), inset 0 0 60px rgba(153, 27, 27, 0.2)',
      maxWidth: '600px',
      '& h3': {
        color: '#ff6b6b',
        fontSize: '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
        textShadow: '0 0 20px rgba(220, 38, 38, 0.8)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
      },
    },
  },
  class Register extends Component {
    recaptchaEnabled = () =>
      config.recaptcha?.protectedActions?.includes('register')

    state = {
      name: '',
      email: '',
      ctftimeToken: undefined,
      ctftimeName: undefined,
      disabledButton: false,
      errors: {},
      verifySent: false,
    }

    componentDidMount() {
      document.title = `Registration | ${config.ctfName}`
      if (this.recaptchaEnabled()) {
        loadRecaptcha()
      }
    }

    render(
      { classes },
      {
        name,
        email,
        disabledButton,
        errors,
        ctftimeToken,
        ctftimeName,
        verifySent,
      }
    ) {
      const recaptchaEnabled = this.recaptchaEnabled()

      // Generate fire effects
      const embers = Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`ember-${i}`}
          className={classes.ember}
          style={{
            left: `${Math.random() * 100}%`,
            animationDuration: `${8 + Math.random() * 6}s`,
            animationDelay: `${Math.random() * 8}s`,
          }}
        />
      ))

      const fireParticles = Array.from({ length: 80 }).map((_, i) => {
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
      })

      if (ctftimeToken) {
        return (
          <div className={classes.wrapper}>
            <div className={classes.backgroundPulse} />
            <div className={classes.dragonScales} />
            <div className={classes.heatWave} />
            {fireParticles}
            {embers}
            <CtftimeAdditional
              ctftimeToken={ctftimeToken}
              ctftimeName={ctftimeName}
            />
          </div>
        )
      }

      if (verifySent) {
        return (
          <div className={classes.wrapper}>
            <div className={classes.backgroundPulse} />
            <div className={classes.dragonScales} />
            <div className={classes.heatWave} />
            {fireParticles}
            {embers}
            <div className='row u-center'>
              <div className={classes.successMessage}>
                <h3>🐉 Verification Email Sent! 🐉</h3>
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
          {fireParticles}
          {embers}

          <div className={`row u-center ${classes.root}`}>
            <h4 className={classes.title}>🐉 Register 🐉</h4>
            <p className={classes.subtitle}>
              Join {config.ctfName} - One account per team
            </p>
            <Form
              class={`${classes.form} col-6`}
              onSubmit={this.handleSubmit}
              disabled={disabledButton}
              errors={errors}
              buttonText='Register'
            >
              <input
                autoFocus
                required
                autoComplete='username'
                autoCorrect='off'
                name='name'
                maxLength='64'
                minLength='2'
                placeholder='Username'
                type='text'
                value={name}
                onChange={this.linkState('name')}
              />
              <input
                required
                autoComplete='email'
                autoCorrect='off'
                name='email'
                placeholder='Email'
                type='email'
                value={email}
                onChange={this.linkState('email')}
              />
            </Form>
            {config.ctftime && (
              <Fragment>
                <AuthOr />
                <CtftimeButton
                  class='col-6'
                  onCtftimeDone={this.handleCtftimeDone}
                />
              </Fragment>
            )}
            {recaptchaEnabled && (
              <div className={classes.recaptchaLegalNotice}>
                <RecaptchaLegalNotice />
              </div>
            )}
          </div>
        </div>
      )
    }

    handleCtftimeDone = async ({ ctftimeToken, ctftimeName }) => {
      this.setState({
        disabledButton: true,
      })
      const loginRes = await login({
        ctftimeToken,
      })
      if (loginRes.authToken) {
        setAuthToken({ authToken: loginRes.authToken })
      }
      if (loginRes.badUnknownUser) {
        this.setState({
          ctftimeToken,
          ctftimeName,
        })
      }
    }

    handleSubmit = async e => {
      e.preventDefault()

      const recaptchaCode = this.recaptchaEnabled()
        ? await requestRecaptchaCode()
        : undefined

      this.setState({
        disabledButton: true,
      })

      const { errors, verifySent } = await register({
        ...this.state,
        recaptchaCode,
      })
      if (verifySent) {
        this.setState({
          verifySent: true,
        })
      }
      if (!errors) {
        return
      }

      this.setState({
        errors,
        disabledButton: false,
      })
    }
  }
)
