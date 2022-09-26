import { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import detectEthereumProvider from "@metamask/detect-provider";
import "./App.css";
import { loadContract } from "./utils/load-contract";

function App() {
  const [web3Api, setWeb3Api] = useState({
    provider: null,
    web3: null,
    contract: null,
    isProviderLoaded: false,
  });
  // account state
  const [account, setAccount] = useState(null);
  // account balance state
  const [balance, setBalance] = useState(null);
  // reload component state
  const [reloadEffect, setReloadEffect] = useState(false);
  // contract loaded or not
  const failedToConnectContract = account && web3Api.contract;
  // account changed or network changed
  const setAccountListener = async (provider) => {
    await provider.on("accountsChanged", (accounts) => {
      setAccount(accounts[0]);
    });

    await provider.on("chainChanged", (_) => {
      window.location.reload();
    });
  };
  // reload the component
  const reload = useCallback(
    () => setReloadEffect(!reloadEffect),
    [reloadEffect]
  );
  // load provider
  useEffect(() => {
    const loadProvider = async () => {
      // with metamask we have an access to window.ethereum & to window.web3
      // metamask injects a global API into websites &
      // this API allows websites to request users, accounts, read data to blockchain, sign messages and transactions

      const provider = await detectEthereumProvider();

      if (provider) {
        const contract = await loadContract("Faucet", provider);
        setAccountListener(provider);
        setWeb3Api({
          web3: new Web3(provider),
          provider,
          contract,
          isProviderLoaded: true,
        });
      } else {
        setWeb3Api((api) => ({ ...api, isProviderLoaded: true }));
        console.error("Please install MetaMask!");
      }

      // let provider = null;

      // if (window.ethereum) {
      //   provider = window.ethereum;
      //   try {
      //     await provider.request({ method: "eth_requestAccounts" });
      //   } catch {
      //     console.error("User denied account access");
      //   }
      // } else if (window.web3) {
      //   provider = window.web3.currentProvider;
      // } else if (!process.env.production) {
      //   provider = new Web3.providers.HttpProvider("http://localhost:7545");
      // }

      // setWeb3Api({
      //   web3: new Web3(provider),
      //   provider,
      // });
    };

    loadProvider();
  }, []);
  // get connected account
  useEffect(() => {
    const getAccount = async () => {
      let accounts = await web3Api.web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    web3Api.web3 && getAccount();
  }, [web3Api.web3, reloadEffect]);
  // load contract balance
  useEffect(() => {
    const loadBalance = async () => {
      const { contract, web3 } = web3Api;
      const balance = await web3.eth.getBalance(contract.address);
      setBalance(web3.utils.fromWei(balance, "ether"));
    };

    web3Api.contract && loadBalance();
  }, [web3Api, reloadEffect]);
  // request for connecting metamask
  const connectWallet = async () => {
    const { provider } = web3Api;
    await provider.request({
      method: "eth_requestAccounts",
    });
    reload();
  };
  // contract function for addFunds to the contract address
  const addFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    await contract.addFunds({
      from: account,
      value: web3.utils.toWei("1", "ether"),
    });

    // window.location.reload()
    reload();
  }, [web3Api, account, reload]);
  // contract function for withdrawFunds from the contract address
  const withdrawFunds = useCallback(async () => {
    const { contract, web3 } = web3Api;
    const withdrawAmount = web3.utils.toWei("0.1", "ether");
    await contract.withdraw(withdrawAmount, { from: account });

    reload();
  }, [web3Api, account, reload]);

  return (
    <>
      <div className="faucet-wraper">
        <div className="faucet">
          {web3Api.isProviderLoaded ? (
            <div className="flex">
              <strong>Account:</strong>
              <span className="ml-2">
                {account ? (
                  account
                ) : !web3Api.provider ? (
                  <div className="bg-yellow-100 text-yellow-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded dark:bg-yellow-200 dark:text-yellow-900">
                    <span>
                      Wallet is not detected!{" "}
                      <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://metamask.io/download/"
                      >
                        Install metamask
                      </a>
                    </span>
                  </div>
                ) : (
                  <button
                    className="bg-green-600 hover:bg-green-700 rounded text-white py-1 px-3"
                    onClick={connectWallet}
                  >
                    Connect Wallet
                  </button>
                )}
              </span>
            </div>
          ) : (
            <span>Looking for web3...</span>
          )}
          <div className="balance-view mb-2 text-2xl text-center">
            Current balance: <strong>{balance}</strong> ETH
          </div>
          {!failedToConnectContract && (
            <span className="text-center block pb-1 text-red-400">
              <i>Connect to Ganache</i>
            </span>
          )}
          <div className="text-center">
            <button
              disabled={!failedToConnectContract}
              onClick={addFunds}
              className="bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded mr-2 disabled:opacity-50"
            >
              Donate 1 eth
            </button>
            <button
              disabled={!failedToConnectContract}
              onClick={withdrawFunds}
              className="bg-gray-500 hover:bg-gray-700 text-white py-1 px-3 rounded disabled:opacity-50"
            >
              Withdraw 0.1 eth
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
