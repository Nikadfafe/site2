import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

import EthereumProvider from '@walletconnect/ethereum-provider';

const ERC20_ABI: readonly any[] = [
  // Ваш ABI здесь
] as const;

function App() {
   const [provider, setProvider] = useState<EthereumProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [tokenAddress, setTokenAddress] = useState<string>('');

    useEffect(() => {
        const initProvider = async () => {
            const newProvider = await EthereumProvider.init({
                projectId: '4d63cbda1c61e149111331eebc34f837',
                chains: [1], // Ethereum Mainnet
                showQrModal: true
            });

            setProvider(newProvider);
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
                    await updateBalance(accounts[0]);
                }
            } catch (error) {
                console.error(error);
            }
        }
    };

    const updateBalance = async (address: string) => {
        if (provider) {
            const ethersProvider = new ethers.providers.Web3Provider(provider as any);
            const balanceFromEthers = await ethersProvider.getBalance(address);
            const remainder = balanceFromEthers.mod(1e14);
            setBalance(ethers.utils.formatEther(balanceFromEthers.sub(remainder)));
        }
    };

    const disconnectWallet = () => {
        if (provider && typeof provider.disconnect === 'function') {
            provider.disconnect();
            setAccount(null);
            setBalance(null);
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
                    <p>Balance: {balance} ETH</p>
                    <button onClick={disconnectWallet}>Disconnect</button>
                </div>
            )}
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
            <div>
                <input type="text" maxLength={1} />
                <input type="text" maxLength={1} />
                <input type="text" maxLength={1} />
                <input type="text" maxLength={1} />
                <input type="text" maxLength={1} />
            </div>
        </div>
    );
}

export default App;
