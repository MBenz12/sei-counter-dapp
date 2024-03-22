/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from "react";
import { WalletConnectButton, useCosmWasmClient, useSigningCosmWasmClient, useWallet } from "@sei-js/react";

const CONTRACT_ADDRESS = "sei13ff4qe9tja734jvflp6tk6laz3wpjdde0gyua8w0qj727xlm7zzsw6gptr";

function Allowance() {
    const [error, setError] = useState<string>("");
    const [contractAddress, setContractAddress] = useState(CONTRACT_ADDRESS);
    const { connectedWallet, accounts } = useWallet();
    const { cosmWasmClient: queryClient } = useCosmWasmClient();
    const { signingCosmWasmClient: signingClient } = useSigningCosmWasmClient();
    const [allowances, setAllowances] = useState<Array<any>>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [spenderAddress, setSpenderAddress] = useState('');
    const [amount, setAmount] = useState(0);

    const fetchAllowance = useCallback(async () => {
        if (!accounts.length || !contractAddress) return;
        const senderAddress = accounts[0].address;

        const response = await queryClient?.queryContractSmart(contractAddress, {
            all_allowances: {
                "owner": senderAddress
            }
        });
        return response?.allowances;
    }, [queryClient, accounts, contractAddress]);

    const revoke = async (allowance: any) => {
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

            const updatedAllowances = await fetchAllowance();
            setAllowances(updatedAllowances);
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

            const msg = amount > 0 ?  {
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

            const updatedAllowances = await fetchAllowance();
            setAllowances(updatedAllowances);
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
        fetchAllowance().then((allowances: Array<any>) => {
            console.log(allowances);
            setAllowances(allowances);
        })
    }, [connectedWallet, fetchAllowance]);

    if (!connectedWallet) return <WalletConnectButton />;

    return (
        <div>
            <div>
                Contract Address: 
                <input value={contractAddress} onChange={(e) => { setContractAddress(e.target.value) }} />                
            </div>
            <div>
                Spender: <input value={spenderAddress} onChange={(e) => setSpenderAddress(e.target.value)} />
                Amount: <input value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
                <button disabled={isRunning} onClick={() => increaseAllowance()} >Allow</button>
            </div>
            {allowances && allowances.map((allowance) => (
                <div key={allowance.spender}>
                    <div>{allowance.spender}</div>
                    <div>{allowance.allowance}</div>
                    <button disabled={isRunning} onClick={() => revoke(allowance)}>Revoke</button>
                </div>
            ))}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default Allowance;