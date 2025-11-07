/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAIN_ID: string
  readonly VITE_RPC_URL: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_CONTRACT_ADDRESS: string
  readonly VITE_MINT_PRICE: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_ETHERSCAN_URL: string
  readonly VITE_TEST_MODE: string
  readonly VITE_MOCK_WALLET_ADDRESS: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
