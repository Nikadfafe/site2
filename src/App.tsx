import React, { useState, useEffect } from 'react';
import EthereumProvider from '@walletconnect/ethereum-provider';

function App() {
    const [provider, setProvider] = useState<EthereumProvider | null>(null);
    const [account, setAccount] = useState<string | null>(null);

    useEffect(() => {
        const initProvider = async () => {
            try {
                const newProvider = await EthereumProvider.init({
                    projectId: '4d63cbda1c61e149111331eebc34f837', // Замените на ваш реальный project_id
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

    return (
        <div className="App">
            <h1>WalletConnect Example</h1>
            {!account ? (
                <button onClick={connectWallet}>Connect Wallet</button>
            ) : (
                <p>Connected Account: {account}</p>
            )}
        </div>
    );
}

export default App;
