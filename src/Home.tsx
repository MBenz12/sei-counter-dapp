import { useCallback, useEffect, useState } from "react";
import {
  useCosmWasmClient,
  useSigningCosmWasmClient,
  useWallet,
  WalletConnectButton,
} from "@sei-js/react";
 
// atlantic-2 example contract
const CONTRACT_ADDRESS =
  "sei1kaq032fm8nz9ct58c8s7chgds5zz68pvy4npwx3r9a0kq9ygw0sscuas7c";
 
function Home() {
  const [count, setCount] = useState<number | undefined>();
  const [error, setError] = useState<string>("");
  const [isIncrementing, setIsIncrementing] = useState<boolean>(false);
 
  // Helpful hook for getting the currently connected wallet and chain info
  const { connectedWallet, accounts } = useWallet();
 
  // For querying cosmwasm smart contracts
  const { cosmWasmClient: queryClient } = useCosmWasmClient();
 
  // For executing messages on cosmwasm smart contracts
  const { signingCosmWasmClient: signingClient } = useSigningCosmWasmClient();
 
  const fetchCount = useCallback(async () => {
    const response = await queryClient?.queryContractSmart(CONTRACT_ADDRESS, {
      get_count: {},
    });
    return response?.count;
  }, [queryClient]);
 
  useEffect(() => {
    fetchCount().then(setCount);
  }, [connectedWallet, fetchCount]);
 
  const incrementCounter = async () => {
    setIsIncrementing(true);
    try {
      const senderAddress = accounts[0].address;
 
      // Build message content
      const msg = { increment: {} };
 
      // Define gas price and limit
      const fee = {
        amount: [{ amount: "20000", denom: "usei" }],
        gas: "200000",
      };
 
      // Call smart contract execute msg
      await signingClient?.execute(senderAddress, CONTRACT_ADDRESS, msg, fee);
 
      // Updates the counter state again
      const updatedCount = await fetchCount();
      setCount(updatedCount);
 
      setIsIncrementing(false);
      setError("");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("unknown error");
      }
      setIsIncrementing(false);
    }
  };
 
  // Helpful component for wallet connection
  if (!connectedWallet) return <WalletConnectButton />;
 
  return (
    <div>
      <h1>Count is: {count ? count : "---"}</h1>
      <button disabled={isIncrementing} onClick={incrementCounter}>
        {isIncrementing ? "incrementing..." : "increment"}
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
 
export default Home;