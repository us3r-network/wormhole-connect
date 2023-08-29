import {
  ChainName,
  ChainId,
  TokenId,
  NO_VAA_FOUND,
} from '@wormhole-foundation/wormhole-connect-sdk';
import { Route } from '../../store/transferInput';
import { BridgeRoute } from './bridge';
import { RelayRoute } from './relay';
import { HashflowRoute } from './hashflow';
import { CCTPRelayRoute } from './cctpRelay';
import { TokenConfig } from '../../config/types';
import {
  ParsedMessage,
  ParsedRelayerMessage,
  PayloadType,
  getVaa,
} from '../sdk';
import RouteAbstract, {
  TransferInfoBaseParams,
  MessageInfo,
} from './routeAbstract';
import {
  CHAIN_ID_SEI,
  parseTokenTransferPayload,
} from '@certusone/wormhole-sdk';
import { TransferDisplayData } from './types';
import { BigNumber } from 'ethers';
import { wh } from '../sdk';
import {
  CCTPManualRoute,
  CCTP_LOG_TokenMessenger_DepositForBurn,
} from './cctpManual';

// TODO: need to make this configurable
export const listOfRoutes = [
  Route.BRIDGE,
  Route.CCTPManual,
  Route.CCTPRelay,
  Route.RELAY,
];
export default class Operator {
  getRoute(route: Route): RouteAbstract {
    switch (route) {
      case Route.BRIDGE: {
        return new BridgeRoute();
      }
      case Route.RELAY: {
        return new RelayRoute();
      }
      case Route.CCTPManual: {
        return new CCTPManualRoute();
      }
      case Route.CCTPRelay: {
        return new CCTPRelayRoute();
      }
      case Route.HASHFLOW: {
        return new HashflowRoute();
      }
      default: {
        throw new Error(`${route} is not a valid route`);
      }
    }
  }

  async getRouteFromTx(txHash: string, chain: ChainName): Promise<Route> {
    let vaa;
    let error;
    try {
      const result = await getVaa(txHash, chain);
      vaa = result.vaa;
    } catch (_error: any) {
      error = _error.message;
    }

    // if(HASHFLOW_CONTRACT_ADDRESSES.includes(vaa.emitterAddress)) {
    //   return Route.HASHFLOW
    // }

    if (!vaa) {
      // Currently, CCTP manual is the only route without a VAA
      if (error === NO_VAA_FOUND) {
        const provider = wh.mustGetProvider(chain);
        const receipt = await provider.getTransactionReceipt(txHash);
        if (!receipt) throw new Error(`No receipt for ${txHash} on ${chain}`);
        if (
          receipt.logs.find(
            (log) => log.topics[0] === CCTP_LOG_TokenMessenger_DepositForBurn,
          )
        )
          return Route.CCTPManual;
      }
      throw error;
    }

    const CCTP_CONTRACT_ADDRESSES = [2, 6].map((chainId) => {
      return wh.getContracts(chainId as ChainId)?.cctpContracts?.wormholeCCTP;
    });

    if (
      CCTP_CONTRACT_ADDRESSES.includes(
        '0x' + vaa.emitterAddress.toString('hex').substring(24),
      )
    ) {
      return Route.CCTPRelay;
    }

    const transfer = parseTokenTransferPayload(vaa.payload);
    if (transfer.toChain === CHAIN_ID_SEI) {
      return Route.RELAY;
    }

    return vaa.payload && vaa.payload[0] === PayloadType.AUTOMATIC
      ? Route.RELAY
      : Route.BRIDGE;
  }

  async isRouteAvailable(
    route: Route,
    sourceToken: string,
    destToken: string,
    amount: string,
    sourceChain: ChainName | ChainId,
    destChain: ChainName | ChainId,
  ): Promise<boolean> {
    const r = this.getRoute(route);
    return await r.isRouteAvailable(
      sourceToken,
      destToken,
      amount,
      sourceChain,
      destChain,
    );
  }

  async isSupportedSourceToken(
    route: Route,
    token: TokenConfig | undefined,
    destToken: TokenConfig | undefined,
    sourceChain?: ChainName | ChainId,
    destChain?: ChainName | ChainId,
  ): Promise<boolean> {
    const r = this.getRoute(route);
    return await r.isSupportedSourceToken(
      token,
      destToken,
      sourceChain,
      destChain,
    );
  }

  async isSupportedDestToken(
    route: Route,
    token: TokenConfig | undefined,
    sourceToken: TokenConfig | undefined,
    sourceChain?: ChainName | ChainId,
    destChain?: ChainName | ChainId,
  ): Promise<boolean> {
    const r = this.getRoute(route);
    return await r.isSupportedDestToken(
      token,
      sourceToken,
      sourceChain,
      destChain,
    );
  }

  async supportedSourceTokens(
    route: Route,
    tokens: TokenConfig[],
    destToken?: TokenConfig,
    sourceChain?: ChainName | ChainId,
    destChain?: ChainName | ChainId,
  ): Promise<TokenConfig[]> {
    const r = this.getRoute(route);
    return await r.supportedSourceTokens(
      tokens,
      destToken,
      sourceChain,
      destChain,
    );
  }

  async supportedDestTokens(
    route: Route,
    tokens: TokenConfig[],
    sourceToken?: TokenConfig,
    sourceChain?: ChainName | ChainId,
    destChain?: ChainName | ChainId,
  ): Promise<TokenConfig[]> {
    const r = this.getRoute(route);
    return await r.supportedDestTokens(
      tokens,
      sourceToken,
      sourceChain,
      destChain,
    );
  }

  async computeReceiveAmount(
    route: Route,
    sendAmount: number | undefined,
    routeOptions: any,
  ): Promise<number> {
    const r = this.getRoute(route);
    return await r.computeReceiveAmount(sendAmount, routeOptions);
  }
  async computeSendAmount(
    route: Route,
    receiveAmount: number | undefined,
    routeOptions: any,
  ): Promise<number> {
    const r = this.getRoute(route);
    return await r.computeSendAmount(receiveAmount, routeOptions);
  }

  async validate(
    route: Route,
    token: TokenId | 'native',
    amount: string,
    sendingChain: ChainName | ChainId,
    senderAddress: string,
    recipientChain: ChainName | ChainId,
    recipientAddress: string,
    routeOptions: any,
  ): Promise<boolean> {
    const r = this.getRoute(route);
    return await r.validate(
      token,
      amount,
      sendingChain,
      senderAddress,
      recipientChain,
      recipientAddress,
      routeOptions,
    );
  }

  async estimateSendGas(
    route: Route,
    token: TokenId | 'native',
    amount: string,
    sendingChain: ChainName | ChainId,
    senderAddress: string,
    recipientChain: ChainName | ChainId,
    recipientAddress: string,
    routeOptions: any,
  ): Promise<string> {
    const r = this.getRoute(route);
    return await r.estimateSendGas(
      token,
      amount,
      sendingChain,
      senderAddress,
      recipientChain,
      recipientAddress,
      routeOptions,
    );
  }

  async estimateClaimGas(
    route: Route,
    destChain: ChainName | ChainId,
  ): Promise<string> {
    const r = this.getRoute(route);
    return await r.estimateClaimGas(destChain);
  }

  async send(
    route: Route,
    token: TokenId | 'native',
    amount: string,
    sendingChain: ChainName | ChainId,
    senderAddress: string,
    recipientChain: ChainName | ChainId,
    recipientAddress: string,
    routeOptions: any,
  ): Promise<string> {
    const r = this.getRoute(route);
    return await r.send(
      token,
      amount,
      sendingChain,
      senderAddress,
      recipientChain,
      recipientAddress,
      routeOptions,
    );
  }

  async redeem(
    route: Route,
    destChain: ChainName | ChainId,
    messageInfo: MessageInfo,
    payer: string,
  ): Promise<string> {
    const r = this.getRoute(route);
    return await r.redeem(destChain, messageInfo, payer);
  }

  async parseMessage(
    route: Route,
    info: MessageInfo,
  ): Promise<ParsedMessage | ParsedRelayerMessage> {
    const r = this.getRoute(route);
    return await r.parseMessage(info);
  }

  async getPreview(
    route: Route,
    token: TokenConfig,
    destToken: TokenConfig,
    amount: number,
    sendingChain: ChainName | ChainId,
    receipientChain: ChainName | ChainId,
    sendingGasEst: string,
    claimingGasEst: string,
    routeOptions?: any,
  ): Promise<TransferDisplayData> {
    const r = this.getRoute(route);
    return await r.getPreview(
      token,
      destToken,
      amount,
      sendingChain,
      receipientChain,
      sendingGasEst,
      claimingGasEst,
      routeOptions,
    );
  }

  public async getNativeBalance(
    route: Route,
    address: string,
    network: ChainName | ChainId,
  ): Promise<BigNumber | null> {
    const r = this.getRoute(route);
    return r.getNativeBalance(address, network);
  }

  public async getTokenBalance(
    route: Route,
    address: string,
    tokenId: TokenId,
    network: ChainName | ChainId,
  ): Promise<BigNumber | null> {
    const r = this.getRoute(route);
    return r.getTokenBalance(address, tokenId, network);
  }

  public async getRelayerFee(
    route: Route,
    sourceChain: ChainName | ChainId,
    destChain: ChainName | ChainId,
    token: string,
  ): Promise<BigNumber> {
    const r = this.getRoute(route);
    return r.getRelayerFee(sourceChain, destChain, token);
  }

  public async getForeignAsset(
    route: Route,
    tokenId: TokenId,
    network: ChainName | ChainId,
  ): Promise<string | null> {
    const r = this.getRoute(route);
    return r.getForeignAsset(tokenId, network);
  }

  public async isTransferCompleted(
    route: Route,
    destChain: ChainName | ChainId,
    messageInfo: MessageInfo,
  ): Promise<boolean> {
    const r = this.getRoute(route);
    return r.isTransferCompleted(destChain, messageInfo);
  }

  public async getMessageInfo(
    route: Route,
    tx: string,
    network: ChainName | ChainId,
    unsigned?: boolean,
  ): Promise<MessageInfo | undefined> {
    const r = this.getRoute(route);
    return r.getMessageInfo(tx, network, unsigned);
  }

  public getTransferSourceInfo<T extends TransferInfoBaseParams>(
    route: Route,
    params: T,
  ): Promise<TransferDisplayData> {
    const r = this.getRoute(route);
    return r.getTransferSourceInfo(params);
  }

  public getTransferDestInfo<T extends TransferInfoBaseParams>(
    route: Route,
    params: T,
  ): Promise<TransferDisplayData> {
    const r = this.getRoute(route);
    return r.getTransferDestInfo(params);
  }

  // swap information (native gas slider)
  public nativeTokenAmount(
    route: Route,
    destChain: ChainName | ChainId,
    token: TokenId,
    amount: BigNumber,
    walletAddress: string,
  ): Promise<BigNumber> {
    const r = this.getRoute(route);
    return r.nativeTokenAmount(destChain, token, amount, walletAddress);
  }

  public maxSwapAmount(
    route: Route,
    destChain: ChainName | ChainId,
    token: TokenId,
    walletAddress: string,
  ): Promise<BigNumber> {
    const r = this.getRoute(route);
    return r.maxSwapAmount(destChain, token, walletAddress);
  }
}
