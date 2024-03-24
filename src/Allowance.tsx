/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { WalletConnectButton, useCosmWasmClient, useSigningCosmWasmClient, useWallet } from "@sei-js/react";

const FT_CONTRACT_ADDRESS = "sei13ff4qe9tja734jvflp6tk6laz3wpjdde0gyua8w0qj727xlm7zzsw6gptr";
const NFT_CONTRACT_ADDRESS = "sei1geqkhqff9lpvg0yj58yg9wkawy86gn3qtt4mytdau46nqqx0cdus47yl5d";

function Allowance() {
    const [error, setError] = useState<string>("");
    const [isNFT, setIsNFT] = useState(false);
    const [contractAddress, setContractAddress] = useState(FT_CONTRACT_ADDRESS);
    const { connectedWallet, accounts } = useWallet();
    const { cosmWasmClient: queryClient } = useCosmWasmClient();
    const { signingCosmWasmClient: signingClient } = useSigningCosmWasmClient();
    const [allowances, setAllowances] = useState<Array<any>>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [spenderAddress, setSpenderAddress] = useState('');
    const [amount, setAmount] = useState(0);
    const [balance, setBalance] = useState('');
    const [tokenInfo, setTokenInfo] = useState<any>({});
    const [approvals, setApprovals] = useState<Array<Array<any>>>([]);
    const [tokens, setTokens] = useState<Array<any>>([]);

    const fetchToken = useCallback(async () => {
        if (!accounts.length || !contractAddress) return;
        const senderAddress = accounts[0].address;

        if (isNFT) {
            const response = await queryClient?.queryContractSmart(contractAddress, {
                tokens: {
                    "owner": senderAddress
                }
            });
            const tokens = response?.tokens || [];
            const approvals = await Promise.all(tokens.map(async (token: string) => await queryClient?.queryContractSmart(contractAddress, {
                approvals: {
                    "token_id": token
                }
            })));

            const tokenInfo = await queryClient?.queryContractSmart(contractAddress, {
                contract_info: {}
            });

            setTokens(tokens || []);
            setApprovals(approvals.map(token => token.approvals) || []);
            setTokenInfo(tokenInfo);
        } else {
            const [balance, tokenInfo, allowances] = await Promise.all([
                queryClient?.queryContractSmart(contractAddress, {
                    balance: {
                        "address": senderAddress
                    },
                }),
                queryClient?.queryContractSmart(contractAddress, {
                    token_info: {},
                }),
                queryClient?.queryContractSmart(contractAddress, {
                    all_allowances: {
                        "owner": senderAddress
                    },
                })
            ]);

            setBalance(balance?.balance);
            setAllowances(allowances?.allowances);
            setTokenInfo(tokenInfo);
        }
    }, [queryClient, accounts, contractAddress]);

    const revokeFT = async (allowance: any) => {
        if (!accounts.length) return;
        setIsRunning(true);

        try {
            const senderAddress = accounts[0].address;

            const msg = {
                decrease_allowance: {
                    spender: allowance.spender,
                    amount: allowance.allowance,
                }
            };

            const fee = {
                amount: [{ amount: "20000", denom: "usei" }],
                gas: "200000",
            };

            // Call smart contract execute msg
            await signingClient?.execute(senderAddress, contractAddress, msg, fee);

            await fetchToken();
            setIsRunning(false);
            setError("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("unknown error");
            }
            setIsRunning(false);
        }
    }

    const increaseAllowance = async () => {
        if (!accounts.length) return;
        setIsRunning(true);

        try {
            const senderAddress = accounts[0].address;

            const msg = amount > 0 ? {
                increase_allowance: {
                    spender: spenderAddress,
                    amount: amount.toString(),
                }
            } : {
                decrease_amount: {
                    spender: spenderAddress,
                    amount: -amount.toString(),
                }
            };

            const fee = {
                amount: [{ amount: "20000", denom: "usei" }],
                gas: "200000",
            };

            // Call smart contract execute msg
            await signingClient?.execute(senderAddress, contractAddress, msg, fee);

            await fetchToken();
            setIsRunning(false);
            setError("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("unknown error");
            }
            setIsRunning(false);
        }
    }

    const revokeNFT = async (token_id: string, spender: string) => {
        if (!accounts.length) return;
        setIsRunning(true);

        try {
            const senderAddress = accounts[0].address;

            const msg = {
                revoke: {
                    spender,
                    token_id
                }
            };

            const fee = {
                amount: [{ amount: "20000", denom: "usei" }],
                gas: "200000",
            };

            // Call smart contract execute msg
            await signingClient?.execute(senderAddress, contractAddress, msg, fee);

            await fetchToken();
            setIsRunning(false);
            setError("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("unknown error");
            }
            setIsRunning(false);
        }
    }

    const approveNFT = async (token_id: string) => {
        if (!accounts.length) return;
        setIsRunning(true);

        try {
            const senderAddress = accounts[0].address;

            const msg = {
                approve: {
                    spender: spenderAddress,
                    token_id,
                }
            };

            const fee = {
                amount: [{ amount: "20000", denom: "usei" }],
                gas: "200000",
            };

            // Call smart contract execute msg
            await signingClient?.execute(senderAddress, contractAddress, msg, fee);

            await fetchToken();
            setIsRunning(false);
            setError("");
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);
            } else {
                setError("unknown error");
            }
            setIsRunning(false);
        }
    }

    useEffect(() => {
        fetchToken();
    }, [connectedWallet, fetchToken]);

    useEffect(() => {
        setContractAddress(isNFT ? NFT_CONTRACT_ADDRESS : FT_CONTRACT_ADDRESS);
    }, [isNFT]);

    if (!connectedWallet) return <WalletConnectButton />;

    return (
        <div>
            <div>
                <h2>Select Token Type:</h2>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="tokenType"
                            value="NFT"
                            checked={isNFT}
                            onChange={() => setIsNFT(true)}
                        />
                        NFT (Non-Fungible Token)
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="radio"
                            name="tokenType"
                            value="FT"
                            checked={!isNFT}
                            onChange={() => setIsNFT(false)}
                        />
                        FT (Fungible Token)
                    </label>
                </div>
            </div>
            <div>
                Contract Address:
                <input value={contractAddress} onChange={(e) => { setContractAddress(e.target.value) }} />
                {!isNFT && <div>Balance: {balance}</div>}
                {tokenInfo && <div>{tokenInfo?.decimals && <>Decimals: {tokenInfo?.decimals}</>} Name: {tokenInfo?.name} Symbol: {tokenInfo?.symbol}</div>}
            </div>
            <div>
                Spender: <input value={spenderAddress} onChange={(e) => setSpenderAddress(e.target.value)} />
                {!isNFT && <>
                    Amount: <input value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
                </>}
            </div>
            {!isNFT ? <>
                <div>
                    <button disabled={isRunning} onClick={() => increaseAllowance()} >Allow</button>
                </div>
                {allowances && allowances.map((allowance) => (
                    <div key={allowance.spender}>
                        <div>{allowance.spender}</div>
                        <div>{allowance.allowance}</div>
                        <button disabled={isRunning} onClick={() => revokeFT(allowance)}>Revoke</button>
                    </div>
                ))}
            </> : <>
                {tokens.map((token, tokenIndex) => (
                    <div key={token}>
                        <h4>{token}</h4>
                        <div>
                            <button disabled={isRunning} onClick={() => approveNFT(token)}>Approve</button>
                            {approvals[tokenIndex].map(approval => (
                                <div key={approval.spender}>
                                    <div>{approval.spender}</div>
                                    <button disabled={isRunning} onClick={() => revokeNFT(token, approval.spender)}>Revoke</button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Allowance;