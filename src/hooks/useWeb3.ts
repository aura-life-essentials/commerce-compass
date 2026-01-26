import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletConnection {
  id: string;
  wallet_address: string;
  chain: string;
  ens_name: string | null;
  is_primary: boolean;
  connected_at: string;
}

export function useWeb3() {
  const { user } = useAuthContext();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [connections, setConnections] = useState<WalletConnection[]>([]);

  // Check if wallet is already connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            getChainId();
            getBalance(accounts[0]);
          }
        });
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          getBalance(accounts[0]);
        } else {
          setWalletAddress(null);
          setBalance('0');
        }
      });

      window.ethereum.on('chainChanged', (newChainId: string) => {
        setChainId(newChainId);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  // Fetch user's wallet connections
  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('wallet_connections')
      .select('*')
      .eq('user_id', user.id);

    if (data) {
      setConnections(data as WalletConnection[]);
    }
  };

  const getChainId = async () => {
    if (window.ethereum) {
      const id = await window.ethereum.request({ method: 'eth_chainId' });
      setChainId(id);
    }
  };

  const getBalance = async (address: string) => {
    if (window.ethereum) {
      try {
        const bal = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        // Convert from wei to ETH
        const ethBalance = parseInt(bal, 16) / 1e18;
        setBalance(ethBalance.toFixed(4));
      } catch (error) {
        console.error('Error getting balance:', error);
      }
    }
  };

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast.error('Please install MetaMask or another Web3 wallet');
      return null;
    }

    setIsConnecting(true);
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        setWalletAddress(address);
        await getChainId();
        await getBalance(address);

        // Save to database if user is logged in
        if (user) {
          const { error } = await supabase
            .from('wallet_connections')
            .upsert({
              user_id: user.id,
              wallet_address: address.toLowerCase(),
              chain: 'ethereum',
              is_primary: connections.length === 0
            }, { onConflict: 'wallet_address' });

          if (error) {
            console.error('Error saving wallet:', error);
          } else {
            await fetchConnections();
          }
        }

        toast.success('Wallet connected!');
        return address;
      }
    } catch (error: any) {
      if (error.code === 4001) {
        toast.error('Connection rejected by user');
      } else {
        toast.error('Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
    return null;
  }, [user, connections]);

  const disconnectWallet = useCallback(() => {
    setWalletAddress(null);
    setBalance('0');
    setChainId(null);
    toast.info('Wallet disconnected');
  }, []);

  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;

    const baseChainId = '0x2105'; // Base mainnet

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: baseChainId }]
      });
    } catch (error: any) {
      // If the chain hasn't been added, add it
      if (error.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: baseChainId,
            chainName: 'Base',
            nativeCurrency: {
              name: 'Ethereum',
              symbol: 'ETH',
              decimals: 18
            },
            rpcUrls: ['https://mainnet.base.org'],
            blockExplorerUrls: ['https://basescan.org']
          }]
        });
      }
    }
  }, []);

  const signMessage = useCallback(async (message: string) => {
    if (!window.ethereum || !walletAddress) return null;

    try {
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress]
      });
      return signature;
    } catch (error) {
      toast.error('Failed to sign message');
      return null;
    }
  }, [walletAddress]);

  const getChainName = (id: string | null) => {
    const chains: Record<string, string> = {
      '0x1': 'Ethereum',
      '0x2105': 'Base',
      '0x89': 'Polygon',
      '0xa': 'Optimism',
      '0xa4b1': 'Arbitrum'
    };
    return id ? chains[id] || 'Unknown' : 'Not Connected';
  };

  return {
    walletAddress,
    isConnecting,
    chainId,
    chainName: getChainName(chainId),
    balance,
    connections,
    connectWallet,
    disconnectWallet,
    switchToBase,
    signMessage,
    isConnected: !!walletAddress,
    hasWallet: !!window.ethereum
  };
}
