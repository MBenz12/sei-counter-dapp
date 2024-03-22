import { SeiWalletProvider } from "@sei-js/react";
import './App.css'
import Home from "./Home";
import Allowance from "./Allowance";

function App() {
  return (
    <SeiWalletProvider
      chainConfiguration={{
        // chainId: "pacific-1",
        // restUrl: "https://rest.sei-apis.com",
        // rpcUrl: "https://rpc.sei-apis.com",
        chainId: "atlantic-2",
        restUrl: "https://rest.atlantic-2.seinetwork.io",
        rpcUrl: "https://rpc.atlantic-2.seinetwork.io",
      }}
      wallets={["compass", "fin", "leap", "keplr"]}
    >
      {/* <Home /> */}
      <Allowance />
    </SeiWalletProvider>
  )
}

export default App
