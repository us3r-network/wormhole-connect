import { CONFIG } from '@wormhole-foundation/wormhole-connect-sdk';
import { ChainsConfig, Icon } from '../types';

const { chains } = CONFIG.TESTNET;

export const TESTNET_CHAINS: ChainsConfig = {
  goerli: {
    ...chains.goerli!,
    displayName: 'Goerli',
    explorerUrl: 'https://goerli.etherscan.io/',
    explorerName: 'Etherscan',
    gasToken: 'ETH',
    chainId: 5,
    icon: Icon.ETH,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  mumbai: {
    ...chains.mumbai!,
    displayName: 'Mumbai',
    explorerUrl: 'https://mumbai.polygonscan.com/',
    explorerName: 'Polygonscan',
    gasToken: 'MATIC',
    chainId: 80001,
    icon: Icon.POLYGON,
    automaticRelayer: true,
    maxBlockSearch: 1000,
  },
  bsc: {
    ...chains.bsc!,
    displayName: 'BSC',
    explorerUrl: 'https://testnet.bscscan.com/',
    explorerName: 'BscScan',
    gasToken: 'BNB',
    chainId: 97,
    icon: Icon.BSC,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  fuji: {
    ...chains.fuji!,
    displayName: 'Fuji',
    explorerUrl: 'https://testnet.avascan.info/blockchain/c/',
    explorerName: 'Avascan',
    gasToken: 'AVAX',
    chainId: 43113,
    icon: Icon.AVAX,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  fantom: {
    ...chains.fantom!,
    displayName: 'Fantom',
    explorerUrl: 'https://testnet.ftmscan.com/',
    explorerName: 'FtmScan',
    gasToken: 'FTM',
    chainId: 4002,
    icon: Icon.FANTOM,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  alfajores: {
    ...chains.alfajores!,
    displayName: 'Alfajores',
    explorerUrl: 'https://explorer.celo.org/alfajores/',
    explorerName: 'Celo Explorer',
    gasToken: 'CELO',
    chainId: 44787,
    icon: Icon.CELO,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  moonbasealpha: {
    ...chains.moonbasealpha!,
    displayName: 'Moonbase',
    explorerUrl: 'https://moonbase.moonscan.io/',
    explorerName: 'Moonscan',
    gasToken: 'GLMR',
    chainId: 1287,
    icon: Icon.GLMR,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  solana: {
    ...chains.solana!,
    displayName: 'Solana',
    explorerUrl: 'https://explorer.solana.com/',
    explorerName: 'Solana Explorer',
    gasToken: 'SOL',
    chainId: 0,
    icon: Icon.SOLANA,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  sui: {
    ...chains.sui!,
    displayName: 'Sui',
    explorerUrl: 'https://suivision.xyz/',
    explorerName: 'Sui Explorer',
    gasToken: 'SUI',
    chainId: 0,
    icon: Icon.SUI,
    automaticRelayer: true,
    maxBlockSearch: 0,
  },
  aptos: {
    ...chains.aptos!,
    displayName: 'Aptos',
    explorerUrl: 'https://explorer.aptoslabs.com/',
    explorerName: 'Aptos Explorer',
    gasToken: 'APT',
    chainId: 0,
    icon: Icon.APT,
    maxBlockSearch: 0,
  },
  basegoerli: {
    ...chains.basegoerli!,
    displayName: 'Base Goerli',
    explorerUrl: 'https://goerli.basescan.org/',
    explorerName: 'BaseScan',
    gasToken: 'ETHbase',
    chainId: 84531,
    icon: Icon.BASE,
    automaticRelayer: true,
    maxBlockSearch: 2000,
  },
  klaytn: {
    ...chains.klaytn!,
    displayName: 'Klaytn',
    explorerUrl: 'https://baobab.klaytnscope.com/',
    explorerName: 'Klaytn Scope',
    gasToken: 'KLAY',
    chainId: 1001,
    icon: Icon.KLAY,
    maxBlockSearch: 2000,
  },
  sei: {
    ...chains.sei!,
    displayName: 'Sei',
    explorerUrl: 'https://testnet.sei.explorers.guru/',
    explorerName: 'Sei Explorer',
    gasToken: 'SEI',
    chainId: 0,
    icon: Icon.SEI,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  osmosis: {
    ...chains.osmosis!,
    displayName: 'Osmosis',
    explorerUrl: 'https://testnet.mintscan.io/osmosis-testnet/',
    explorerName: 'MintScan',
    gasToken: 'OSMO',
    chainId: 'osmo-test-5',
    icon: Icon.OSMO,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  wormchain: {
    ...chains.wormchain!,
    displayName: 'Wormchain',
    explorerUrl: '',
    explorerName: '',
    gasToken: 'WORM',
    chainId: 'wormchain-testnet-0',
    icon: Icon.OSMO,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  arbitrumgoerli: {
    ...chains.arbitrumgoerli!,
    displayName: 'Arbitrum Goerli',
    explorerUrl: 'https://testnet.arbiscan.io/',
    explorerName: 'Arbitrum Goerli Explorer',
    gasToken: 'ETHarbitrum',
    chainId: 421613,
    icon: Icon.ARBITRUM,
    maxBlockSearch: 2000,
  },
  optimismgoerli: {
    ...chains.optimismgoerli!,
    displayName: 'Optimism Goerli',
    explorerUrl: 'https://goerli-optimism.etherscan.io/',
    explorerName: 'Optimistic Goerli Explorer',
    gasToken: 'ETHoptimism',
    chainId: 420,
    icon: Icon.OPTIMISM,
    maxBlockSearch: 2000,
  },
  cosmoshub: {
    ...chains.cosmoshub!,
    displayName: 'Cosmoshub',
    explorerUrl: 'https://testnet.mintscan.io/cosmoshub-testnet/',
    explorerName: 'MintScan',
    gasToken: 'ATOM',
    chainId: 'theta-testnet-001',
    icon: Icon.ATOM,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  evmos: {
    ...chains.evmos!,
    displayName: 'Evmos',
    explorerUrl: 'https://testnet.mintscan.io/evmos-testnet/',
    explorerName: 'MintScan',
    gasToken: 'EVMOS',
    chainId: 'evmos_9000-4',
    icon: Icon.EVMOS,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  kujira: {
    ...chains.kujira!,
    displayName: 'Kujira',
    explorerUrl: 'https://finder.kujira.app/harpoon-4/',
    explorerName: 'Kujira Finder',
    gasToken: 'KUJI',
    chainId: 'harpoon-4',
    icon: Icon.KUJI,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  sepolia: {
    ...chains.sepolia!,
    displayName: 'Sepolia',
    explorerUrl: 'https://sepolia.etherscan.io/',
    explorerName: 'Etherscan',
    gasToken: 'ETHsepolia',
    chainId: 11155111,
    icon: Icon.ETH,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  arbitrum_sepolia: {
    ...chains.arbitrum_sepolia!,
    displayName: 'Arbitrum Sepolia',
    explorerUrl: 'https://sepolia.arbiscan.io/',
    explorerName: 'Etherscan',
    gasToken: 'ETHarbitrum_sepolia',
    chainId: 421614,
    icon: Icon.ARBITRUM,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  base_sepolia: {
    ...chains.base_sepolia!,
    displayName: 'Base Sepolia',
    explorerUrl: 'https://base-sepolia.blockscout.com/',
    explorerName: 'Etherscan',
    gasToken: 'ETHbase_sepolia',
    chainId: 84532,
    icon: Icon.BASE,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  optimism_sepolia: {
    ...chains.optimism_sepolia!,
    displayName: 'Optimism Sepolia',
    explorerUrl: 'https://sepolia-optimistic.etherscan.io/',
    explorerName: 'Etherscan',
    gasToken: 'ETHoptimism_sepolia',
    chainId: 11155420,
    icon: Icon.OPTIMISM,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  injective: {
    ...chains.injective!,
    displayName: 'Injective',
    explorerUrl: 'https://testnet.explorer.injective.network',
    explorerName: 'Injective Explorer',
    gasToken: 'INJ',
    chainId: 'injective-888',
    icon: Icon.INJ,
    automaticRelayer: false,
    maxBlockSearch: 0,
  },
  scroll: {
    ...chains.scroll!,
    displayName: 'Scroll',
    explorerUrl: 'https://sepolia.scrollscan.dev/',
    explorerName: 'Scrollscan',
    gasToken: 'ETHscroll',
    chainId: 534351,
    icon: Icon.SCROLL,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  blast: {
    ...chains.blast!,
    displayName: 'Blast',
    explorerUrl: 'https://testnet.blastscan.io/',
    explorerName: 'Blastscan',
    gasToken: 'ETHblast',
    chainId: 168587773,
    icon: Icon.BLAST,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  xlayer: {
    ...chains.xlayer!,
    displayName: 'X Layer',
    explorerUrl: 'https://www.okx.com/web3/explorer/xlayer-test/',
    explorerName: 'OKX Explorer',
    gasToken: 'OKB',
    chainId: 195,
    icon: Icon.XLAYER,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
  mantle: {
    ...chains.mantle!,
    displayName: 'Mantle',
    explorerUrl: 'https://explorer.testnet.mantle.xyz/',
    explorerName: 'Mantle Explorer',
    gasToken: 'MNT',
    chainId: 5001,
    icon: Icon.MANTLE,
    automaticRelayer: false,
    maxBlockSearch: 2000,
  },
};
