import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

const ERC20_ABI: any[] = [
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address"
      },
      {
        name: "_value",
        type: "uint256"
      }
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    type: "function"
  },
  // Можно также добавить другие стандартные функции ERC20, если они вам нужны:
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address"
      }
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256"
      }
    ],
    type: "function"
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8"
      }
    ],
    type: "function"
  }
];;

function App() {
    const [provider, setProvider] = useState<EthereumProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [tokenAddress, setTokenAddress] = useState<string>('');

    useEffect(() => {
        const initProvider = async () => {
            try {
                const newProvider = await EthereumProvider.init({
                    projectId: '4d63cbda1c61e149111331eebc34f837',
                    chains: [1],
                    showQrModal: true
                });
                setProvider(newProvider);
            } catch (error) {
                console.error("Failed to initialize provider:", error);
            }
        };
        initProvider();
    }, []);

    const connectWallet = async () => {
        if (provider) {
            try {
                await provider.connect();
                const accounts = await provider.request({ method: 'eth_requestAccounts' }) as string[];
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                }
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        }
    };

    const approveToken = async () => {
        if (provider && account) {
            try {
                const ethersProvider = new ethers.providers.Web3Provider(provider as any);
                const signer = ethersProvider.getSigner(account);
                const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

                setApprovalStatus("Approval pending...");
                const tx = await tokenContract.approve(account, ethers.utils.parseEther(amount.toString()));
                await tx.wait();
                setApprovalStatus("Approval successful!");
            } catch (error) {
                console.error(error);
                setApprovalStatus("Approval failed");
            }
        }
    };

    return (
        <div className="App">
            <h1>WalletConnect Example</h1>
            {!account ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <div>
                    <p>Connected Account: {account}</p>
                    <div>
                        <input
                            type="text"
                            value={tokenAddress}
                            onChange={(e) => setTokenAddress(e.target.value)}
                            placeholder="Token Address"
                        />
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value))}
                            placeholder="Amount"
                        />
                        <button onClick={approveToken}>Approve Token</button>
                        {approvalStatus && <p>{approvalStatus}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
