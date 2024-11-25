import React, { Fragment, PropsWithChildren } from "react"
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core"
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum"
import { SolanaWalletConnectors } from "@dynamic-labs/solana"
import { CosmosWalletConnectors } from "@dynamic-labs/cosmos"
import { OnConnectCallback } from "./useDynamicWallet"
import { isEVMChain } from "./utils"
import { Chain } from '@wormhole-foundation/sdk';
import { Theme } from "@mui/material"

interface ConfiguredDynamicContextProps {
    theme?: Theme
    onConnectCallbackRef: React.MutableRefObject<OnConnectCallback | undefined>
    chainRef: React.MutableRefObject<Chain | undefined>
}

export const ConfiguredDynamicContext: React.FC<PropsWithChildren<ConfiguredDynamicContextProps>> = (
    { children, onConnectCallbackRef, chainRef }
) => {
    return <Fragment>
        <DynamicContextProvider
            // TODO: Config theme
            // theme={ theme ?? { mode: "dark" } }
            theme={"dark"}
            settings={{
                environmentId: "62ee0eb5-f9dc-4b19-8ae7-09b371cc0873",
                initialAuthenticationMode: "connect-only",
                walletConnectors: [
                    EthereumWalletConnectors,
                    SolanaWalletConnectors,
                    CosmosWalletConnectors,
                ],
                walletsFilter: (wallets) => {
                    const chain = chainRef?.current
                    if (chain && isEVMChain(chain)) {
                        return wallets.filter(w => w.walletConnector.supportedChains.includes("EVM"))
                    } else if (chain === "Solana") {
                        return wallets.filter(w => w.walletConnector.supportedChains.includes("SOL"))
                    } else if (chain === "Cosmoshub") {
                        return wallets.filter(w => w.walletConnector.supportedChains.includes("COSMOS"))
                    } else {
                        return []
                    }
                },
                events: {
                    onAuthSuccess: ({ primaryWallet }) => {
                        console.log("onAuthSuccess", primaryWallet?.chain, primaryWallet?.address, primaryWallet?.connector.name)
                        if (primaryWallet)
                            onConnectCallbackRef.current?.(primaryWallet)
                    },
                    onWalletAdded: ({ wallet }) => {
                        console.log("onAuthSuccess", wallet?.chain, wallet?.address, wallet?.connector.name)
                        onConnectCallbackRef.current?.(wallet)
                    },
                },
                // // TODO: Config networks
                // overrides: {
                //     evmNetworks: [],
                // },
                // walletConnectPreferredChains: [],
            }}
        >
            {children}
        </DynamicContextProvider>
    </Fragment>
}