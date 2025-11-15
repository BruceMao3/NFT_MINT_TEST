/**
 * Wallet Diagnostics Tool
 * Use this to debug wallet connection issues
 */

export function diagnoseWalletEnvironment() {
  console.log('🔬 ===== WALLET ENVIRONMENT DIAGNOSTICS =====');

  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }

  console.log('✅ Browser environment detected');
  console.log('');

  // Check window.ethereum
  console.log('📦 window.ethereum:');
  if (!window.ethereum) {
    console.log('  ❌ window.ethereum not found');
  } else {
    console.log('  ✅ window.ethereum exists');
    console.log('  Properties:', {
      isMetaMask: window.ethereum.isMetaMask,
      isTrust: (window.ethereum as any).isTrust,
      isPhantom: (window.ethereum as any).isPhantom,
      isCoinbaseWallet: (window.ethereum as any).isCoinbaseWallet,
      isTokenPocket: (window.ethereum as any).isTokenPocket,
      providers: window.ethereum.providers ? `Array(${window.ethereum.providers.length})` : 'undefined',
    });
  }
  console.log('');

  // Check for multiple providers
  if (window.ethereum?.providers) {
    console.log('📦 Multiple providers detected:');
    window.ethereum.providers.forEach((provider: any, index: number) => {
      console.log(`  Provider ${index}:`, {
        isMetaMask: provider.isMetaMask || false,
        isTrust: provider.isTrust || false,
        isPhantom: provider.isPhantom || false,
        isCoinbaseWallet: provider.isCoinbaseWallet || false,
      });
    });
  } else {
    console.log('📦 Single provider mode');
  }
  console.log('');

  // Check for individual wallet objects
  console.log('🔍 Checking for specific wallet objects:');

  if ((window as any).ethereum) {
    console.log('  ✅ window.ethereum exists');
  }

  if ((window as any).trustWallet) {
    console.log('  ⚠️ window.trustWallet exists');
  }

  if ((window as any).phantom) {
    console.log('  ⚠️ window.phantom exists');
  }

  if ((window as any).coinbaseSolana) {
    console.log('  ⚠️ window.coinbaseSolana exists');
  }

  console.log('');
  console.log('💡 Recommendations:');

  if ((window as any).ethereum?.isTrust) {
    console.log('  ⚠️ Trust Wallet is dominating window.ethereum');
    console.log('  → Try disabling Trust Wallet extension');
  }

  if (window.ethereum?.providers && window.ethereum.providers.length > 1) {
    const hasMetaMask = window.ethereum.providers.some((p: any) => p.isMetaMask);
    const hasTrust = window.ethereum.providers.some((p: any) => p.isTrust);

    if (hasMetaMask && hasTrust) {
      console.log('  ⚠️ Both MetaMask and Trust Wallet detected');
      console.log('  → We should be able to use MetaMask from providers array');
    }
  }

  console.log('');
  console.log('🔬 ===== END DIAGNOSTICS =====');
}

// Call this function to run diagnostics
if (typeof window !== 'undefined') {
  (window as any).diagnoseWallets = diagnoseWalletEnvironment;
  console.log('💡 Run "diagnoseWallets()" in console for wallet diagnostics');
}
