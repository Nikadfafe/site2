import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import EthereumProvider from '@walletconnect/ethereum-provider';

const ERC20_ABI = [
    // Здесь должен быть ваш ABI
];

function WalletConnection({ provider, account, balance, onConnect, onDisconnect }) {
    return (
        <div>
            {!account ? (
                <button onClick={onConnect}>Connect Wallet</button>
            ) : (
                <div>
                    <p>Connected Account: {account}</p>
                    <p>Balance: {balance} ETH</p>
                    <button onClick={onDisconnect}>Disconnect</button>
                </div>
            )}
        </div>
    );
}

function TokenApproval({ provider, account, onApprove }) {
    const [tokenAddress, setTokenAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [approvalStatus, setApprovalStatus] = useState(null);

    const handleApprove = async () => {
        setApprovalStatus("Approval pending...");
        try {
            await onApprove(tokenAddress, amount);
            setApprovalStatus("Approval successful!");
        } catch (error) {
            console.error(error);
            setApprovalStatus("Approval failed");
        }
    };

    return (
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
            <button onClick={handleApprove}>Approve Token</button>
            {approvalStatus && <p>{approvalStatus}</p>}
        </div>
    );
}

function App() {
    const [provider, setProvider] = useState(null);
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState(null);

    useEffect(() => {
        const initProvider = async () => {
            try {
                const newProvider = await EthereumProvider.init({
                    projectId: process.env.REACT_APP_PROJECT_ID,
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
                const accounts = await provider.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    await updateBalance(accounts[0]);
                }
            } catch (error) {
                console.error("Failed to connect wallet:", error);
            }
        }
    };

    const updateBalance = async (address) => {
        if (provider) {
            try {
                const ethersProvider = new ethers.providers.Web3Provider(provider);
                const balanceFromEthers = await ethersProvider.getBalance(address);
                const remainder = balanceFromEthers.mod(1e14);
                setBalance(ethers.utils.formatEther(balanceFromEthers.sub(remainder)));
            } catch (error) {
                console.error("Failed to update balance:", error);
            }
        }
    };

    const disconnectWallet = () => {
        if (provider && typeof provider.disconnect === 'function') {
            provider.disconnect();
            setAccount(null);
            setBalance(null);
        }
    };

    const approveToken = async (tokenAddress, amount) => {
        if (provider && account) {
            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner(account);
            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
            const tx = await tokenContract.approve(account, ethers.utils.parseEther(amount.toString()));
            await tx.wait();
        }
    };

    return (
        <div className="App">
            <h1>WalletConnect Example</h1>
            <WalletConnection
                provider={provider}
                account={account}
                balance={balance}
                onConnect={connectWallet}
                onDisconnect={disconnectWallet}
            />
            <TokenApproval
                provider={provider}
                account={account}
                onApprove={approveToken}
            />
        </div>
    );
}

export default App;
