import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import './App.css';

const ERC20_ABI: any[] = [
    // Ваш ABI здесь
];

function App() {
    const [provider, setProvider] = useState<EthereumProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
    const [amount, setAmount] = useState<number>(0);
    const [tokenAddress, setTokenAddress] = useState<string>('');
    const [inviteCode, setInviteCode] = useState<string[]>(Array(5).fill(''));

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

    const handleInviteCodeChange = (index: number, value: string) => {
        const newInviteCode = [...inviteCode];
        newInviteCode[index] = value;
        setInviteCode(newInviteCode);
    };

    return (
        <div className="App">
            <header>
                <div className="logo">Scroll</div>
                <nav>
                    <a href="#">Develop</a>
                    <a href="#">Ecosystem</a>
                    <a href="#">Resources</a>
                    <a href="#">Bridge</a>
                    <a href="#">Sessions</a>
                </nav>
                <button className="connect-wallet" onClick={connectWallet}>
                    {account ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                </button>
            </header>
            <main>
                <h1>Mint your Karka airdrop NFT</h1>
                <p>Map your journey and earn badges across the ecosystem.</p>
                <p>Canvas has a mint fee of 0.001 ETH to fight spam.</p>
                <p>Enter an invite code to get 50% off!</p>
                <div className="invite-code">
                    {inviteCode.map((code, index) => (
                        <input 
                            key={index}
                            type="text" 
                            maxLength={1} 
                            value={code}
                            onChange={(e) => handleInviteCodeChange(index, e.target.value)}
                        />
                    ))}
                </div>
                <div className="approve-token">
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
                </div>
                {approvalStatus && <p>{approvalStatus}</p>}
            </main>
        </div>
    );
}

export default App;
