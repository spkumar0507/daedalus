// @flow
export type TlsConfig = {
  port: number,
  ca: Uint8Array,
  cert: Uint8Array,
  key: Uint8Array,
};

export type NetworkNames = (
  'mainnet' | 'staging' | 'testnet' | 'development' | string
);

export type PlatformNames = (
  'win32' | 'linux' | 'darwin' | string
);

export const NetworkNameOptions = {
  mainnet: 'mainnet',
  staging: 'staging',
  testnet: 'testnet',
  development: 'development'
};

export type CardanoNodeState = (
  'stopped' | 'starting' | 'running' | 'stopping' | 'updating' |
  'updated' | 'crashed' | 'errored' | 'exiting' | 'unrecoverable'
);

export const CardanoNodeStates: {
  STARTING: CardanoNodeState,
  RUNNING: CardanoNodeState;
  EXITING: CardanoNodeState;
  STOPPING: CardanoNodeState;
  STOPPED: CardanoNodeState;
  UPDATING: CardanoNodeState;
  UPDATED: CardanoNodeState;
  CRASHED: CardanoNodeState;
  ERRORED: CardanoNodeState;
  UNRECOVERABLE: CardanoNodeState;
} = {
  STARTING: 'starting',
  RUNNING: 'running',
  EXITING: 'exiting',
  STOPPING: 'stopping',
  STOPPED: 'stopped',
  UPDATING: 'updating',
  UPDATED: 'updated',
  CRASHED: 'crashed',
  ERRORED: 'errored',
  UNRECOVERABLE: 'unrecoverable',
};

export type CardanoPidOptions = (
  'mainnet-PREVIOUS-CARDANO-PID' |
  'staging-PREVIOUS-CARDANO-PID' |
  'testnet-PREVIOUS-CARDANO-PID' |
  'development-PREVIOUS-CARDANO-PID' |
  string
);

export type CardanoNodeStorageKeys = {
  PREVIOUS_CARDANO_PID: CardanoPidOptions
};

export type CardanoNodeProcessNames = (
  'cardano-node' | 'cardano-node.exe'
);

export type ProcessNames = {
  CARDANO_PROCESS_NAME: CardanoNodeProcessNames
};

export const CardanoProcessNameOptions: {
  win32: CardanoNodeProcessNames,
  linux: CardanoNodeProcessNames,
  darwin: CardanoNodeProcessNames,
} = {
  win32: 'cardano-node.exe',
  linux: 'cardano-node',
  darwin: 'cardano-node'
};

/**
 * Expected fault injection types that can be used to tell
 * cardano-node to behave faulty (useful for testing)
 */
export type FaultInjection = (
  'FInjIgnoreShutdown' |
  'FInjIgnoreAPI' |
  'FInjApplyUpdateNoExit' |
  'FInjApplyUpdateWrongExitCode'
);

export const FaultInjections: {
  IgnoreShutdown: FaultInjection,
  IgnoreApi: FaultInjection,
  ApplyUpdateNoExit: FaultInjection,
  ApplyUpdateWrongExitCode: FaultInjection
} = {
  IgnoreShutdown: 'FInjIgnoreShutdown',
  IgnoreApi: 'FInjIgnoreAPI',
  ApplyUpdateNoExit: 'FInjApplyUpdateNoExit',
  ApplyUpdateWrongExitCode: 'FInjApplyUpdateWrongExitCode',
};

export type FaultInjectionIpcResponse = Array<FaultInjection>;
export type FaultInjectionIpcRequest = [FaultInjection, boolean];

export type CardanoStatus = {
  isNodeResponding: boolean,
  isNodeSubscribed: boolean,
  isNodeSyncing: boolean,
  isNodeInSync: boolean,
  hasBeenConnected: boolean,
};
