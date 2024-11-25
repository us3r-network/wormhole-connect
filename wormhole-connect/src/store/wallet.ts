import { Context } from 'sdklegacy';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TransferWallet } from 'utils/wallet';

export type IconType = (props: {size?: number}) => React.FunctionComponentElement<any>;

export type WalletData = {
  type: Context | undefined;
  address: string;
  currentAddress: string;
  error: string;
  icon?: IconType;
  name: string;
};

export interface WalletState {
  sending: WalletData;
  receiving: WalletData;
}

const NO_WALLET: WalletData = {
  address: '',
  type: undefined,
  currentAddress: '',
  error: '',
  icon: undefined,
  name: '',
};

const initialState: WalletState = {
  sending: NO_WALLET,
  receiving: NO_WALLET,
};

export type ConnectPayload = {
  address: string;
  type: Context;
  icon?: IconType;
  name: string;
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (
      state: WalletState,
      { payload }: PayloadAction<ConnectPayload>,
    ) => {
      state.sending.address = payload.address;
      state.sending.currentAddress = payload.address;
      state.sending.type = payload.type;
      state.sending.name = payload.name;
      state.sending.error = '';
      state.sending.icon = payload.icon;
    },
    connectReceivingWallet: (
      state: WalletState,
      { payload }: PayloadAction<ConnectPayload>,
    ) => {
      state.receiving.address = payload.address;
      state.receiving.currentAddress = payload.address;
      state.receiving.type = payload.type;
      state.receiving.name = payload.name;
      state.receiving.error = '';
      state.receiving.icon = payload.icon;
    },
    clearWallet: (
      state: WalletState,
      { payload }: PayloadAction<TransferWallet>,
    ) => {
      state[payload] = NO_WALLET;
    },
    disconnectWallet: (
      state: WalletState,
      { payload }: PayloadAction<TransferWallet>,
    ) => {
      // disconnect(payload);
      state[payload] = NO_WALLET;
    },
    setWalletError: (
      state: WalletState,
      { payload }: PayloadAction<{ type: TransferWallet; error: string }>,
    ) => {
      const { type, error } = payload;
      state[type].error = error;
    },
    setAddress: (
      state: WalletState,
      { payload }: PayloadAction<{ type: TransferWallet; address: string }>,
    ) => {
      const { type, address } = payload;
      state[type].address = address;
      state[type].currentAddress = address;
    },
    clearWallets: (state: WalletState) => {
      Object.keys(state).forEach((key) => {
        // @ts-ignore
        state[key] = initialState[key];
      });
    },
    swapWallets: (state: WalletState) => {
      const tmp = state.sending;
      state.sending = state.receiving;
      state.receiving = tmp;
    },
  },
});

export const {
  connectWallet,
  connectReceivingWallet,
  clearWallet,
  setAddress,
  setWalletError,
  clearWallets,
  disconnectWallet,
  swapWallets,
} = walletSlice.actions;

export default walletSlice.reducer;
