import {
  BrowserRouter as Router,
  useRoutes,
  Navigate,
  useNavigate,
} from 'react-router-dom'

import 'cirrus-ui'
import withStyles from './components/jss'
import Header from './components/header'
import Footer from './components/footer'

import ErrorRoute from './routes/error'
import Home from './routes/home'
import Register from './routes/register'
import Login from './routes/login'
import Profile from './routes/profile'
import Challenges from './routes/challs'
import Scoreboard from './routes/scoreboard'
import Recover from './routes/recover'
import Verify from './routes/verify'
import CtftimeCallback from './routes/ctftime-callback'

import AdminChallenges from './routes/admin/challs'

import { ToastProvider } from './components/toast'

import { navigateRef } from './history-hack'
import { hasChallsReadPermission } from './util/permissions'
import config from './config'

const LoggedOutRedir = <Navigate to='/' />
const LoggedInRedir = <Navigate to='/profile' />

function App({ classes }) {
  const loggedOut = !localStorage.token
  const registerItems = config.registrationsEnabled
    ? [
        {
          element: <Register />,
          path: '/register',
          name: 'Register',
        },
      ]
    : []

  const loggedOutPaths = [
    ...registerItems,
    {
      element: <Login />,
      path: '/login',
      name: 'Login',
    },
    {
      element: <Recover />,
      path: '/recover',
    },
  ]

  const loggedInPaths = [
    {
      element: <Profile key='profile-private' />,
      path: '/profile',
      name: 'Profile',
    },
    {
      element: <Challenges />,
      path: '/challs',
      name: 'Challenges',
    },
  ]
  // Check if the user has admin permissions
  if (hasChallsReadPermission()) {
    loggedInPaths.push({
      element: <AdminChallenges />,
      path: '/admin/challs',
    })
  }

  const allPaths = [
    {
      element: <ErrorRoute error='404' />,
      path: '*',
    },
    {
      element: <Home />,
      path: '/',
      name: 'Home',
    },
    {
      element: <Scoreboard />,
      path: '/scores',
      name: 'Scoreboard',
    },
    {
      element: <Profile key='profile-public' />,
      path: '/profile/:uuid',
    },
    {
      element: <Verify />,
      path: '/verify',
    },
    {
      element: <CtftimeCallback />,
      path: '/integrations/ctftime/callback',
    },
  ]

  loggedInPaths.forEach(route =>
    loggedOutPaths.push({
      element: LoggedOutRedir,
      path: route.path,
    })
  )
  loggedOutPaths.forEach(route =>
    loggedInPaths.push({ element: LoggedInRedir, path: route.path })
  )
  const currentPaths = [
    ...allPaths,
    ...(loggedOut ? loggedOutPaths : loggedInPaths),
  ]
  const headerPaths = currentPaths.filter(route => route.name !== undefined)

  const element = useRoutes(currentPaths)

  return (
    <div className={classes.root}>
      <ToastProvider>
        <Header paths={headerPaths} />
        <div className={classes.contentWrapper}>{element}</div>
        <Footer />
      </ToastProvider>
    </div>
  )
}

const StyledApp = withStyles(
  {
    '@global': {
      body: {
        overflowX: 'hidden',
        backgroundColor: '#0a0a0a',
      },
      // Breaking these out into flat keys often fixes the JSS TypeError
      '::-webkit-scrollbar': {
        width: '8px',
      },
      '::-webkit-scrollbar-track': {
        background: '#0a0a0a',
      },
      '::-webkit-scrollbar-thumb': {
        background: '#8b0000',
        borderRadius: '4px',
      },
      '.grecaptcha-badge': {
        visibility: 'hidden',
      },
      'body > div[style*="position: absolute"]': {
        top: '10px !important',
      },
      select: {
        background:
          "url(\"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%204%205'%3E%3Cpath%20fill='%23667189'%20d='M2%200L0%202h4zm0%205L0%203h4z'/%3E%3C/svg%3E\") right .85rem center/.5rem .6rem no-repeat no-repeat #111 !important",
      },
      ':root': {
        '--cirrus-link': '#ff3333',
        '--cirrus-link-dark': '#8b0000',
        '--cirrus-select-bg': 'rgba(139, 0, 0, 0.4)',
        '--cirrus-primary': '#8b0000',
        '--cirrus-bg-main': '#0a0a0a',
      },
    },
    root: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100%',
      background: 'radial-gradient(circle at top, #1a0505 0%, #0a0a0a 100%)',
      color: '#eee',
      '& *:not(code):not(pre)': {
        fontFamily: '"Rajdhani", "Segoe UI", Roboto, sans-serif !important',
      },
      '& pre.code, & code': {
        background: '#150000',
        color: '#ff4d4d',
        border: '1px solid #4a0000',
        boxShadow: '0 0 10px rgba(255, 0, 0, 0.1)',
      },
    },
    contentWrapper: {
      flex: '1 0 auto',
      paddingTop: '2rem',
    },
  },
  App
)

const HistoryHack = () => {
  const navigate = useNavigate()
  navigateRef.current = navigate
  return null
}

const WrappedApp = () => (
  <Router>
    <HistoryHack />
    <StyledApp />
  </Router>
)

export default WrappedApp
