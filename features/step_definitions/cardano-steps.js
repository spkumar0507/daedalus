// @flow
import { Given, Then } from 'cucumber';
import { CardanoNodeStates } from '../../source/common/types/cardano-node.types';
import {
  getCardanoNodeState,
  waitForCardanoNodeToExit
} from '../support/helpers/cardano-node-helpers';

Given(/^cardano-node is running$/, async function () {
  return await this.client.waitUntil(async () => (
    await getCardanoNodeState(this.client) === CardanoNodeStates.RUNNING
  ));
});

Then(/^cardano-node process is not running$/, { timeout: 61000 }, async function () {
  return waitForCardanoNodeToExit(this.client);
});
