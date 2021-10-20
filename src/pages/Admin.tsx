import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { Paper } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as ethers from 'ethers';
import Box from '@material-ui/core/Box';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

import { useWallet } from 'contexts/wallet';
import { useContracts } from 'contexts/contracts';
import { useNotifications } from 'contexts/notifications';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  margin: {
    margin: theme.spacing(1),
  },
  withoutLabel: {
    marginTop: theme.spacing(3),
  },
  textField: {
    width: '30ch',
  },
}));

export default function Admin() {
  const classes = useStyles();
  const { stakingRewardsContract, token0Contract } = useContracts();
  const { startConnecting: startConnectingWallet, address } = useWallet();
  const [aprmai, setAprmai] = useState('');
  const [apreth, setApreth] = useState('');
  const [starttime, setStarttime] = useState('');
  const [endtime, setEndtime] = useState('');
  const [totalReward, setTotalReward] = useState('');
  const [isCreatedIncentive, setIsCreatedIncentive] = useState(false);
  const { showSuccessNotification, showErrorNotification } = useNotifications();

  const getTimestamp = (strDatetime: string) => {
    let b = strDatetime.split(/\D+/);
    return (
      new Date(
        parseInt(b[0]),
        parseInt(b[1]) - 1,
        parseInt(b[2]),
        parseInt(b[3]),
        parseInt(b[4])
      ).getTime() / 1000
    );
  };

  const create_incentive = async () => {
    if (!(token0Contract && stakingRewardsContract && address)) return;

    try {
      const provider = ethers.getDefaultProvider();
      const block = await provider.getBlock('latest');
      const epoch = block.timestamp;
      // const startTime = epoch + 1000;
      const startTime = getTimestamp(starttime);
      const days = (n: number) => 86400 * n;
      const hours = (n: number) => 3600 * n;
      // const endTime = startTime + hours(3);
      const endTime = getTimestamp(endtime);
      const times = {
        startTime,
        endTime,
      };
      const BN = ethers.BigNumber.from;
      const BNe = (n: ethers.BigNumberish, exponent: ethers.BigNumberish) =>
        BN(n).mul(BN(10).pow(exponent));
      const BNe18 = (n: ethers.BigNumberish) => BNe(n, 18);
      const tReward = BNe18(parseInt(totalReward));

      setIsCreatedIncentive(true);

      await token0Contract.approve(stakingRewardsContract.address, tReward);

      await stakingRewardsContract.createIncentive(
        {
          pool: '0x3f9803da84d100b3df248e4810d4a0cea4ef4954',
          rewardToken: token0Contract.address,
          ...times,
          refundee: address,
        },
        tReward,
        aprmai,
        apreth,
        { gasLimit: '0x4C4B40', gasPrice: '0x9502F900' }
      );
    } catch (e) {
      console.log('createincentive error');
      showErrorNotification((e as Error).message);
      setIsCreatedIncentive(false);
    }
  };

  useEffect(() => {
    if (!stakingRewardsContract) return;

    let isMounted = true;
    const unsubs = [
      () => {
        isMounted = false;
      },
    ];

    const updateIncentive = () => {
      console.log('hello1');
      if (isMounted) {
        console.log('hello2');
        showSuccessNotification(
          'Create Incentive',
          'Incentive is created successfully'
        );
        setIsCreatedIncentive(false);
      }
    };

    const subscribe = () => {
      const incentiveCreatedEvent = stakingRewardsContract.filters.IncentiveCreated();
      stakingRewardsContract.on(incentiveCreatedEvent, updateIncentive);
      unsubs.push(() => {
        stakingRewardsContract.off(incentiveCreatedEvent, updateIncentive);
      });
    };

    subscribe();
  }, [stakingRewardsContract, address]);

  return (
    <Paper>
      <Box p={5}>
        {!address ? (
          <>
            <Box>
              <Typography variant='h5'>
                You are about to earn rewards by staking MAI tokens on Ethereum!
              </Typography>
            </Box>

            <Box mt={2}>
              <Button
                color='secondary'
                variant='contained'
                onClick={startConnectingWallet}
              >
                Connect Wallet
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Box className='flex items-center'>
              <FormControl
                className={clsx(
                  classes.margin,
                  classes.withoutLabel,
                  classes.textField
                )}
              >
                <InputLabel htmlFor='apr-mai'>APRmai</InputLabel>
                <Input
                  id='apr-mai'
                  endAdornment={
                    <InputAdornment position='end'>%</InputAdornment>
                  }
                  onChange={(e) => setAprmai(e.target.value)}
                />
              </FormControl>
              <FormControl
                className={clsx(
                  classes.margin,
                  classes.withoutLabel,
                  classes.textField
                )}
              >
                <InputLabel htmlFor='apr-eth'>APReth</InputLabel>
                <Input
                  id='apr-eth'
                  endAdornment={
                    <InputAdornment position='end'>%</InputAdornment>
                  }
                  onChange={(e) => setApreth(e.target.value)}
                />
              </FormControl>
            </Box>
            <Box className='flex items-center'>
              <FormControl
                className={clsx(
                  classes.margin,
                  classes.withoutLabel,
                  classes.textField
                )}
              >
                <TextField
                  id='start-time'
                  label='Start time'
                  type='datetime-local'
                  className={classes.textField}
                  onChange={(e) => setStarttime(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
              <FormControl
                className={clsx(
                  classes.margin,
                  classes.withoutLabel,
                  classes.textField
                )}
              >
                <TextField
                  id='end-time'
                  label='End time'
                  type='datetime-local'
                  className={classes.textField}
                  onChange={(e) => setEndtime(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            </Box>
            <Box className='flex items-center'>
              <FormControl
                className={clsx(
                  classes.margin,
                  classes.withoutLabel,
                  classes.textField
                )}
              >
                <InputLabel htmlFor='total-reward'>Total Reward</InputLabel>
                <Input
                  id='total-reward'
                  endAdornment={
                    <InputAdornment position='end'>MAI</InputAdornment>
                  }
                  onChange={(e) => setTotalReward(e.target.value)}
                />
              </FormControl>
            </Box>
            <Box m={2} mt={3} className='item-center'>
              <Button
                variant='contained'
                color='secondary'
                onClick={create_incentive}
                disabled={isCreatedIncentive === true}
              >
                {isCreatedIncentive === false
                  ? 'Create Incentive'
                  : 'Creating Incentive...'}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
