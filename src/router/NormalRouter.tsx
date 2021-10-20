import { Paper } from '@material-ui/core';
import Positions from 'pages/Positions';
import { Route } from 'react-router';

import StakeModal from 'modals/StakeModal';
import UnstakeModal from 'modals/UnstakeModal';
import WithdrawModal from 'modals/WithdrawModal';

export default function NormalRouter() {
  return (
    <>
      <Paper>
        <Positions />
      </Paper>

      <Route path={'/stake/:tokenId'} component={StakeModal} />
      <Route path={'/unstake/:tokenId'} component={UnstakeModal} />
      <Route path={'/withdraw/:tokenId'} component={WithdrawModal} />
    </>
  );
}
