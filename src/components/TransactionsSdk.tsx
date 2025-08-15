import { useEffect, useState } from "react";
import {
  parseEther,
  toHex,
  createPublicClient,
  http,
  parseGwei,
  createClient,
} from "viem";
import { waitForTransactionReceipt } from "viem/actions";
import { JSON_RPC_METHOD } from "../types";

function TransactionsSdk() {
  const [txHash, setTxHash] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [receiptTestResults, setReceiptTestResults] = useState<any>(null);
  const [isTestingReceipt, setIsTestingReceipt] = useState(false);

  // Transaction Types
  const LEGACY_TX = {
    to: "0x9DD7fA4B4950154F7e75BdD8A77266B99b94Ec08",
    value: toHex(parseEther("0")),
  };

  const CONTRACT_CALL_TX = {
    to: "0xe21935D4Ff567E742Cc38D9AA613Bb8043962004",
    data: "0x6057361d000000000000000000000000000000000000000000000000000000000000007b",
  };
  const EIP1559_TX = {
    to: "0xdbd6b2c02338919EdAa192F5b60F5e5840A50079",
    value: toHex(parseEther("0.00000000000")),
    maxFeePerGas: "0x1000000000", // 68.7 gwei
    maxPriorityFeePerGas: "0x100000000", // 4.3 gwei
  };

  // Personal Sign example
  const personalSignMessage = "Hello World from Human Wallet";

  // Typed Data example
  const typedDataExample = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Person: [
        { name: "name", type: "string" },
        { name: "wallet", type: "address" },
        { name: "age", type: "uint256" },
        { name: "email", type: "string" },
        { name: "isActive", type: "bool" },
        { name: "balance", type: "uint256" },
        { name: "createdAt", type: "uint256" },
        { name: "updatedAt", type: "uint256" },
        { name: "isVerified", type: "bool" },
        { name: "isBanned", type: "bool" },
        { name: "isDeleted", type: "bool" },
        { name: "isFrozen", type: "bool" },
        { name: "isLocked", type: "bool" },
        { name: "isSuspended", type: "bool" },
        { name: "isVerified", type: "bool" },
      ],
    },
    domain: {
      name: "Silk Test DApp",
      version: "1.0",
      chainId: 1,
      verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
    },
    primaryType: "Person",
    message: {
      name: "John Doe",
      wallet: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
      age: 25,
      email: "john.doe@example.com",
      isActive: true,
      balance: 1000,
      createdAt: 1717171717,
      updatedAt: 1717171717,
      isVerified: true,
      isBanned: false,
      isDeleted: false,
      isFrozen: false,
      isLocked: false,
      isSuspended: false,
    },
  };

  const sendContractCall = async () => {
    resetState();

    await window.silk.request({
      method: JSON_RPC_METHOD.wallet_switchEthereumChain,
      params: [
        {
          chainId: "0x2105",
        },
      ],
    });

    const chain = await window.silk.request({
      method: JSON_RPC_METHOD.eth_chainId,
    });

    console.log("chain", chain);

    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      console.log("accounts", accounts);

      // // Estimate gas for the transaction
      // const estimatedGas = await window.silk.request({
      //   method: JSON_RPC_METHOD.eth_estimateGas,
      //   params: [
      //     {
      //       from: accounts[0],
      //       ...CONTRACT_CALL_TX
      //     }
      //   ]
      // })

      // // Set gas limit with some buffer (1.5x the estimated amount)
      // const gasLimit =
      //   typeof estimatedGas === 'string'
      //     ? toHex(Math.floor(parseInt(estimatedGas, 16) * 1.5))
      //     : '0x100000' // Fallback to a high value if estimation fails

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...CONTRACT_CALL_TX,
          },
        ],
      });

      console.log("txHash", txHash);

      setTxHash(txHash as string);
    } catch (error) {
      handleError(error);
    }
  };
  // Reset state on each action
  const resetState = () => {
    setTxHash(null);
    setSignatureData(null);
    setError(null);
  };

  useEffect(() => {
    if (!window?.silk) return;

    window.silk
      .request({
        method: JSON_RPC_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: "0xAA36A7",
          },
        ],
      })
      .then(() => console.log("switched"));
  }, [window?.silk]);

  // Handler for potential errors in requests
  const handleError = (error: any) => {
    console.error("Error:", error);
    setError(error?.message || "Unknown error occurred");
  };

  const sendLegacyTransaction = async () => {
    resetState();

    try {
      await window.silk.request({
        method: JSON_RPC_METHOD.wallet_switchEthereumChain,
        params: [
          {
            chainId: "0xa",
          },
        ],
      });

      const chain = await window.silk.request({
        method: JSON_RPC_METHOD.eth_chainId,
      });

      console.log("chain", chain);

      const gas = await window.silk.request({
        method: JSON_RPC_METHOD.eth_estimateGas,
        params: [LEGACY_TX],
      });

      console.log("gas", gas);

      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      console.log("accounts", accounts);
      console.log("LEGACY_TX", LEGACY_TX);

      console.log("param: ", {
        from: accounts[0],
        ...LEGACY_TX,
      });

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...LEGACY_TX,
          },
        ],
      });

      console.log("txHash", txHash);

      setTxHash(txHash as string);
    } catch (error) {
      handleError(error);
    }
  };

  const sendEIP1559Transaction = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...EIP1559_TX,
          },
        ],
      });

      setTxHash(txHash as string);
    } catch (error) {
      handleError(error);
    }
  };

  const signPersonalMessage = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      const signature = await window.silk.request({
        method: JSON_RPC_METHOD.personal_sign,
        params: [personalSignMessage, accounts[0]],
      });

      setSignatureData(signature as string);
    } catch (error) {
      handleError(error);
    }
  };

  const signTypedData = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      const signature = await window.silk.request({
        method: JSON_RPC_METHOD.eth_signTypedData_v4,
        params: [accounts[0], JSON.stringify(typedDataExample)],
      });

      setSignatureData(signature as string);
    } catch (error) {
      handleError(error);
    }
  };

  // SECTION 2: Bulk Transaction Methods

  const sendBulkLegacyTransactions = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      // We'll send 3 transactions in sequence
      const results = [];
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: JSON_RPC_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...LEGACY_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, "0")}`,
            },
          ],
        });
        results.push(txHash);
      }

      setTxHash(results.join(", "));
    } catch (error) {
      handleError(error);
    }
  };

  const sendBulkEIP1559Transactions = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      // We'll send 3 transactions in sequence
      const results = [];
      for (let i = 0; i < 3; i++) {
        const txHash = await window.silk.request({
          method: JSON_RPC_METHOD.eth_sendTransaction,
          params: [
            {
              from: accounts[0],
              ...EIP1559_TX,
              // Add some random data to make each tx unique
              data: `0x${i.toString(16).padStart(2, "0")}`,
            },
          ],
        });
        results.push(txHash);
      }

      setTxHash(results.join(", "));
    } catch (error) {
      handleError(error);
    }
  };

  const sendMixedTransactions = async () => {
    resetState();
    try {
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      // Send a legacy transaction
      const legacyTxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...LEGACY_TX,
            data: "0x00",
          },
        ],
      });

      // Send an EIP-1559 transaction
      const eip1559TxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            ...EIP1559_TX,
            data: "0x01",
          },
        ],
      });

      // Send a contract interaction transaction
      const contractTxHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from: accounts[0],
            to: "0xfb6E71e0800BcCC0db8a9Cf326fe3213CA1A0EA0",
            value: toHex(parseEther("0.00000001")),
            data: "0xa9059cbb000000000000000000000000c02aaa39b223fe8d0a0e5c4f27ead9083c756cc20000000000000000000000000000000000000000000000000de0b6b3a7640000",
          },
        ],
      });

      setTxHash([legacyTxHash, eip1559TxHash, contractTxHash].join(", "));
    } catch (error) {
      handleError(error);
    }
  };

  // --- DRAIN WALLET USING VIEM FOR ESTIMATION ---
  const drainWalletViem = async () => {
    resetState();
    try {
      const chain = await window.silk.request({
        method: JSON_RPC_METHOD.eth_chainId,
      });

      console.log("chain", chain);
      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];
      const from = accounts[0] as `0x${string}`;
      const to = "0x9DD7fA4B4950154F7e75BdD8A77266B99b94Ec08" as `0x${string}`;

      // 1. Setup viem client for Sepolia
      const client = createPublicClient({
        chain: {
          id: 11155111,
          name: "sepolia",
          nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
          rpcUrls: {
            default: {
              http: [
                "https://eth-sepolia.g.alchemy.com/v2/wxieEGaCXu4vVoL3y2Sf31sJHcmlnppW/",
              ],
            },
          },
        },
        transport: http(
          "https://eth-sepolia.g.alchemy.com/v2/wxieEGaCXu4vVoL3y2Sf31sJHcmlnppW/"
        ),
      });

      // 2. Get balance
      const balance = await client.getBalance({ address: from });
      // 3. Estimate gas
      const gas = await client.estimateGas({ account: from, to });
      // 4. Get gas price
      const gasPrice = await client.getGasPrice();
      // 5. Calculate max value to send (leave a small buffer)
      const buffer = parseEther("0.0001");
      const maxValue = balance - gas * gasPrice - buffer;
      if (maxValue <= 0n) throw new Error("Not enough balance to drain!");

      // 1. Set a higher gas price (e.g., 15.2 Gwei)
      const fastGasPrice = parseGwei("15.215865642"); // or just '20' for 20 Gwei

      // 2. Use this gas price in your transaction
      const txHash = await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [
          {
            from,
            to,
            value: toHex(maxValue),
            gas: toHex(gas),
            gasPrice: toHex(fastGasPrice), // <-- override here
          },
        ],
      });
      setTxHash(txHash as string);
    } catch (error) {
      handleError(error);
    }
  };

  // NEW: Test transaction receipt functionality
  const testTransactionReceipt = async () => {
    resetState();
    setIsTestingReceipt(true);

    try {
      // Switch to Optimism for testing
      await window.silk.request({
        method: JSON_RPC_METHOD.wallet_switchEthereumChain,
        params: [{ chainId: "0xa" }], // Optimism mainnet
      });

      const accounts = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_requestAccounts,
      })) as string[];

      // Send a simple transaction
      console.log("Sending test transaction on Optimism...");
      const testTx = {
        to: "0x9DD7fA4B4950154F7e75BdD8A77266B99b94Ec08",
        value: toHex(parseEther("0.00001")), // Small amount
        from: accounts[0],
      };

      const txHash = (await window.silk.request({
        method: JSON_RPC_METHOD.eth_sendTransaction,
        params: [testTx],
      })) as string;

      console.log("Transaction sent:", txHash);
      setTxHash(txHash);

      // Now test both receipt methods
      const results = {
        txHash,
        oldMethod: null as any,
        newMethod: null as any,
        oldMethodTime: 0,
        newMethodTime: 0,
        oldMethodError: null as string | null,
        newMethodError: null as string | null,
      };

      // Test 1: Old method (direct provider call)
      console.log("Testing old method (direct ethers provider)...");
      const oldStartTime = Date.now();
      try {
        // Simulate the old method - direct call that might timeout
        const oldReceipt = await window.silk.request({
          method: JSON_RPC_METHOD.eth_getTransactionReceipt,
          params: [txHash],
        });
        results.oldMethod = oldReceipt;
        results.oldMethodTime = Date.now() - oldStartTime;
        console.log("Old method result:", oldReceipt);
      } catch (error: any) {
        results.oldMethodError = error.message;
        results.oldMethodTime = Date.now() - oldStartTime;
        console.log("Old method error:", error.message);
      }

      // Test 2: New method with viem (simulate the updated implementation)
      console.log("Testing new method (viem waitForTransactionReceipt)...");
      const newStartTime = Date.now();
      try {
        // Create viem client for Optimism
        const viemClient = createClient({
          chain: {
            id: 10,
            name: "Optimism",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: {
              default: {
                http: [
                  "https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/",
                ],
              },
              public: {
                http: [
                  "https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/",
                ],
              },
            },
          },
          transport: http(
            "https://tiniest-blissful-diagram.optimism.quiknode.pro/324cd24fac66376fac3bf440e9eb60d0329ff812/"
          ),
        });

        const newReceipt = await waitForTransactionReceipt(viemClient, {
          hash: txHash as `0x${string}`,
          timeout: 60000, // 60 second timeout
        });

        results.newMethod = newReceipt;
        results.newMethodTime = Date.now() - newStartTime;
        console.log("New method result:", newReceipt);
      } catch (error: any) {
        results.newMethodError = error.message;
        results.newMethodTime = Date.now() - newStartTime;
        console.log("New method error:", error.message);

        // Fallback to old method as the actual implementation does
        try {
          const fallbackReceipt = await window.silk.request({
            method: JSON_RPC_METHOD.eth_getTransactionReceipt,
            params: [txHash],
          });
          results.newMethod = fallbackReceipt;
        } catch (fallbackError: any) {
          console.log("Fallback also failed:", fallbackError.message);
        }
      }

      setReceiptTestResults(results);
      console.log("Receipt test completed:", results);
    } catch (error: any) {
      handleError(error);
    } finally {
      setIsTestingReceipt(false);
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="font-bold text-2xl">
        Silk SDK Transaction Tests (Sign with Human Wallet)
      </h2>

      {/* Section 1: Single Transaction/Signing Methods */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          1. Send Single Transactions
        </h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button onClick={sendLegacyTransaction} className="button">
              Send Legacy Transaction
            </button>
            <button onClick={sendEIP1559Transaction} className="button">
              Send EIP-1559 Transaction
            </button>
            <button onClick={signPersonalMessage} className="button">
              Personal Sign
            </button>
            <button onClick={signTypedData} className="button">
              Sign Typed Data (EIP-712)
            </button>
            <button onClick={sendContractCall} className="button">
              Send Contract Call
            </button>
            <button onClick={drainWalletViem} className="button">
              Drain Wallet (sepolia)
            </button>
          </div>
        </div>
      </div>

      {/* NEW: Transaction Receipt Test Section */}
      <div className="p-4 border rounded-lg bg-blue-50">
        <h3 className="text-xl font-semibold mb-4">
          🧪 Transaction Receipt Test (Updated Implementation)
        </h3>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            This test sends a transaction on Optimism and compares the old vs
            new receipt fetching methods. The new method uses viem's
            waitForTransactionReceipt for better timeout handling.
          </p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testTransactionReceipt}
              className={`button ${
                isTestingReceipt ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isTestingReceipt}
            >
              {isTestingReceipt
                ? "Testing Receipt Methods..."
                : "Test Transaction Receipt (Optimism)"}
            </button>
          </div>
          {isTestingReceipt && (
            <div className="text-sm text-blue-600">
              ⏳ Sending transaction and testing receipt methods... This may
              take up to 60 seconds.
            </div>
          )}
        </div>
      </div>

      {/* Section 2: Bulk Transaction Methods */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">
          2. Send Bulk Transactions
        </h3>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <button onClick={sendBulkLegacyTransactions} className="button">
              Send 3 Legacy Transactions
            </button>
            <button onClick={sendBulkEIP1559Transactions} className="button">
              Send 3 EIP-1559 Transactions
            </button>
            <button onClick={sendMixedTransactions} className="button">
              Send Mixed Transaction Types
            </button>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-xl font-semibold mb-4">Results</h3>

        {txHash && (
          <div className="mb-4">
            <h3 className="font-medium">Transaction Hash:</h3>
            <p className="break-all bg-gray-100 p-2 rounded">{txHash}</p>
          </div>
        )}

        {signatureData && (
          <div className="mb-4">
            <h3 className="font-medium">Signature:</h3>
            <p className="break-all bg-gray-100 p-2 rounded">{signatureData}</p>
          </div>
        )}

        {error && (
          <div className="mb-4">
            <h3 className="font-medium text-red-500">Error:</h3>
            <p className="break-all bg-red-50 text-red-700 p-2 rounded">
              {error}
            </p>
          </div>
        )}

        {receiptTestResults && (
          <div className="mb-6">
            <h3 className="font-medium text-lg mb-3">
              🧪 Transaction Receipt Test Results
            </h3>

            <div className="bg-white border rounded-lg p-4 space-y-4">
              {/* Transaction Info */}
              <div>
                <h4 className="font-semibold text-green-600">
                  ✅ Transaction Sent
                </h4>
                <p className="text-sm break-all bg-gray-100 p-2 rounded mt-1">
                  Hash: {receiptTestResults.txHash}
                </p>
              </div>

              {/* Method Comparison */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Old Method Results */}
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-orange-600 mb-2">
                    🐌 Old Method (Direct Ethers)
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Time:</strong> {receiptTestResults.oldMethodTime}
                      ms
                    </p>
                    {receiptTestResults.oldMethodError ? (
                      <p className="text-red-600">
                        <strong>Error:</strong>{" "}
                        {receiptTestResults.oldMethodError}
                      </p>
                    ) : (
                      <div>
                        <p className="text-green-600">
                          <strong>Status:</strong> Success
                        </p>
                        <p>
                          <strong>Block:</strong>{" "}
                          {receiptTestResults.oldMethod?.blockNumber?.toString()}
                        </p>
                        <p>
                          <strong>Gas Used:</strong>{" "}
                          {receiptTestResults.oldMethod?.gasUsed?.toString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Method Results */}
                <div className="border rounded p-3">
                  <h4 className="font-semibold text-blue-600 mb-2">
                    🚀 New Method (Viem + Fallback)
                  </h4>
                  <div className="text-sm space-y-1">
                    <p>
                      <strong>Time:</strong> {receiptTestResults.newMethodTime}
                      ms
                    </p>
                    {receiptTestResults.newMethodError ? (
                      <p className="text-yellow-600">
                        <strong>Fallback Used:</strong>{" "}
                        {receiptTestResults.newMethodError}
                      </p>
                    ) : (
                      <p className="text-green-600">
                        <strong>Status:</strong> Success
                      </p>
                    )}
                    {receiptTestResults.newMethod && (
                      <div>
                        <p>
                          <strong>Block:</strong>{" "}
                          {receiptTestResults.newMethod?.blockNumber?.toString()}
                        </p>
                        <p>
                          <strong>Gas Used:</strong>{" "}
                          {receiptTestResults.newMethod?.gasUsed?.toString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-blue-50 p-3 rounded">
                <h4 className="font-semibold text-blue-800 mb-2">📊 Summary</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Performance:</strong>
                    {receiptTestResults.newMethodTime <
                    receiptTestResults.oldMethodTime
                      ? ` 🏆 New method was ${
                          receiptTestResults.oldMethodTime -
                          receiptTestResults.newMethodTime
                        }ms faster`
                      : ` ⚠️ Old method was ${
                          receiptTestResults.newMethodTime -
                          receiptTestResults.oldMethodTime
                        }ms faster`}
                  </p>
                  <p>
                    <strong>Reliability:</strong>
                    {receiptTestResults.newMethod &&
                    receiptTestResults.oldMethod
                      ? " ✅ Both methods returned receipts"
                      : receiptTestResults.newMethod
                      ? " 🔄 New method succeeded, old method failed"
                      : " ❌ Both methods had issues"}
                  </p>
                  <p className="text-blue-700 font-medium mt-2">
                    💡 The new implementation automatically waits for pending
                    transactions to be mined, reducing timeout errors for users.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TransactionsSdk;
