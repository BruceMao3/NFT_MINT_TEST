/**
 * Wallet Diagnostics Tool
 * Use this to debug wallet connection issues
 * Includes EIP-6963 wallet discovery diagnostics
 */

export function diagnoseWalletEnvironment() {
  console.log('🔬 ===== WALLET ENVIRONMENT DIAGNOSTICS =====');

  if (typeof window === 'undefined') {
    console.log('❌ Not in browser environment');
    return;
  }

  console.log('✅ Browser environment detected');
  console.log('');

  // Check EIP-6963 wallet discovery
  console.log('📡 EIP-6963 Wallet Discovery:');
  console.log('   Triggering wallet discovery...');
  
  const discoveredWallets: any[] = [];
  const discoveryListener = (event: any) => {
    discoveredWallets.push(event.detail);
  };

  window.addEventListener('eip6963:announceProvider', discoveryListener);
  window.dispatchEvent(new Event('eip6963:requestProvider'));

  // Give wallets a moment to respond
  setTimeout(() => {
    window.removeEventListener('eip6963:announceProvider', discoveryListener);
    
    if (discoveredWallets.length > 0) {
      console.log(`   ✅ Found ${discoveredWallets.length} EIP-6963 compatible wallet(s):`);
      discoveredWallets.forEach((wallet, i) => {
        console.log(`   Wallet ${i + 1}:`, {
          name: wallet.info.name,
          rdns: wallet.info.rdns,
          uuid: wallet.info.uuid,
        });
      });
    } else {
      console.log('   ⚠️ No EIP-6963 compatible wallets found');
      console.log('   → Wallets may be using legacy injection method');
    }
    console.log('');
  }, 100);

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
