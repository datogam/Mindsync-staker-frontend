import { FC } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Box, Paper } from '@material-ui/core';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

import Header from './Header';
import ConnectWallet from './ConnectWallet';

import Positions from 'pages/Positions';

import Admin from 'pages/Admin';
import NormalRouter from 'router/NormalRouter';

const useStyles = makeStyles((theme) => ({
  container: {
    width: '960px',
    margin: '0 auto',
    padding: '100px 0 30px',
    position: 'relative',
    [theme.breakpoints.down('sm')]: {
      padding: '70px 0 10px',
      width: 'auto',
    },
    '& a, a:visited': {
      color: theme.palette.secondary.main,
    },
    '& .MuiInputLabel-shrink': {
      right: 0,
      transform: 'translate(0, 1.5px) scale(1)',
      transformOrigin: 'top left',
      fontSize: 12,
    },
  },
}));

const Layout: FC = () => {
  const classes = useStyles();

  return (
    <Router>
      <Box className={classes.container}>
        <Header />

        <Switch>
          <Route path={'/admin'} component={Admin} />
          <Route path={'/'} component={NormalRouter} />
        </Switch>

        <ConnectWallet />
      </Box>
    </Router>
  );
};

export default Layout;
