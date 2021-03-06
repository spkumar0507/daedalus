// @flow
import { createWriteStream, readFileSync } from 'fs';
import { spawn, exec } from 'child_process';
import { BrowserWindow } from 'electron';
import { Logger } from '../utils/logging';
import { prepareArgs } from './config';
import { CardanoNode } from './CardanoNode';
import {
  cardanoTlsConfigChannel,
  cardanoRestartChannel,
  cardanoAwaitUpdateChannel,
  cardanoStateChangeChannel,
  cardanoFaultInjectionChannel,
  cardanoStatusChannel,
} from '../ipc/cardano.ipc';
import { safeExitWithCode } from '../utils/safeExitWithCode';
import type {
  TlsConfig,
  CardanoNodeState,
  CardanoStatus
} from '../../common/types/cardano-node.types';
import type { LauncherConfig } from '../config';
import {
  NODE_KILL_TIMEOUT,
  NODE_SHUTDOWN_TIMEOUT,
  NODE_STARTUP_MAX_RETRIES,
  NODE_STARTUP_TIMEOUT, NODE_UPDATE_TIMEOUT
} from '../config';

const startCardanoNode = (node: CardanoNode, launcherConfig: Object) => {
  const { nodePath, tlsPath, logsPrefix } = launcherConfig;
  const nodeArgs = prepareArgs(launcherConfig);
  const logFilePath = logsPrefix + '/cardano-node.log';
  const config = {
    nodePath,
    logFilePath,
    tlsPath,
    nodeArgs,
    startupTimeout: NODE_STARTUP_TIMEOUT,
    startupMaxRetries: NODE_STARTUP_MAX_RETRIES,
    shutdownTimeout: NODE_SHUTDOWN_TIMEOUT,
    killTimeout: NODE_KILL_TIMEOUT,
    updateTimeout: NODE_UPDATE_TIMEOUT,
  };
  return node.start(config);
};

const restartCardanoNode = async (node: CardanoNode) => {
  try {
    await node.restart();
  } catch (error) {
    Logger.info(`Could not restart CardanoNode: ${error}`);
  }
};

/**
 * Configures, starts and manages the CardanoNode responding to node
 * state changes, app events and IPC messages coming from the renderer.
 *
 * @param launcherConfig {LauncherConfig}
 * @param mainWindow
 */
export const setupCardano = (
  launcherConfig: LauncherConfig, mainWindow: BrowserWindow
): CardanoNode => {

  const cardanoNode = new CardanoNode(Logger, {
    // Dependencies on node.js apis are passed as props to ease testing
    spawn,
    exec,
    readFileSync,
    createWriteStream,
    broadcastTlsConfig: (config: ?TlsConfig) => {
      if (!mainWindow.isDestroyed()) cardanoTlsConfigChannel.send(config, mainWindow);
    },
    broadcastStateChange: (state: CardanoNodeState) => {
      if (!mainWindow.isDestroyed()) cardanoStateChangeChannel.send(state, mainWindow);
    },
  }, {
    // CardanoNode lifecycle hooks
    onStarting: () => {},
    onRunning: () => {},
    onStopping: () => {},
    onStopped: () => {},
    onUpdating: () => {},
    onUpdated: () => {},
    onCrashed: (code) => {
      const restartTimeout = cardanoNode.startupTries > 0 ? 30000 : 0;
      Logger.info(`CardanoNode crashed with code ${code}. Restarting in ${restartTimeout}ms …`);
      setTimeout(() => restartCardanoNode(cardanoNode), restartTimeout);
    },
    onError: () => {},
    onUnrecoverable: () => {}
  });
  startCardanoNode(cardanoNode, launcherConfig);

  cardanoStatusChannel.onRequest(() => {
    Logger.info('ipcMain: Received request from renderer for cardano status.');
    return Promise.resolve(cardanoNode.status);
  });

  cardanoStatusChannel.onReceive((status: CardanoStatus) => {
    Logger.info('ipcMain: Received request from renderer to cache cardano status.');
    cardanoNode.saveStatus(status);
    return Promise.resolve(cardanoNode.status);
  });

  cardanoStateChangeChannel.onRequest(() => {
    Logger.info('ipcMain: Received request from renderer for node state.');
    return Promise.resolve(cardanoNode.state);
  });

  cardanoTlsConfigChannel.onRequest(() => {
    Logger.info('ipcMain: Received request from renderer for tls config.');
    return Promise.resolve(cardanoNode.tlsConfig);
  });

  cardanoAwaitUpdateChannel.onReceive(() => {
    Logger.info('ipcMain: Received request from renderer to await update.');
    setTimeout(async () => {
      await cardanoNode.expectNodeUpdate();
      Logger.info('CardanoNode applied an update. Exiting Daedalus with code 20.');
      safeExitWithCode(20);
    });
    return Promise.resolve();
  });

  cardanoRestartChannel.onReceive(() => {
    Logger.info('ipcMain: Received request from renderer to restart node.');
    return cardanoNode.restart(true); // forced restart
  });

  cardanoFaultInjectionChannel.onReceive((fault) => {
    Logger.info(`ipcMain: Received request to inject a fault into cardano node: ${String(fault)}`);
    return cardanoNode.setFault(fault);
  });

  return cardanoNode;
};
