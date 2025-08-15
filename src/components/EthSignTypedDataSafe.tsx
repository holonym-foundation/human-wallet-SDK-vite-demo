// @ts-nocheck
import { useState, useEffect } from 'react'
import SafeConfirmTransaction from './SafeConfirmTransaction'
import { createSafeClient, SafeClient } from '@safe-global/sdk-starter-kit'
/**
 * Function to extract the EIP-712 typed data from a Safe transaction
 * This is used to prepare the data for signing with eth_signTypedData_v4
 */
function extractTypedDataFromSafeTransaction(
  safeTransaction,
  safeAddress,
  chainId
) {
  // Get the transaction data

  // Create the domain separator
  const domain = {
    chainId: chainId,
    verifyingContract: safeAddress
  }

  // Define the types exactly as Safe expects them
  const types = {
    SafeTx: [
      { type: 'address', name: 'to' },
      { type: 'uint256', name: 'value' },
      { type: 'bytes', name: 'data' },
      { type: 'uint8', name: 'operation' },
      { type: 'uint256', name: 'safeTxGas' },
      { type: 'uint256', name: 'baseGas' },
      { type: 'uint256', name: 'gasPrice' },
      { type: 'address', name: 'gasToken' },
      { type: 'address', name: 'refundReceiver' },
      { type: 'uint256', name: 'nonce' }
    ]
  }

  // Create the message object from the transaction data
  const message = {
    to: safeTransaction.to,
    value: safeTransaction.value,
    data: safeTransaction.data || '0x',
    operation: safeTransaction.operation,
    safeTxGas: safeTransaction.safeTxGas.toString(),
    baseGas: safeTransaction.baseGas.toString(),
    gasPrice: safeTransaction.gasPrice,
    gasToken: safeTransaction.gasToken,
    refundReceiver: safeTransaction.refundReceiver,
    nonce: safeTransaction.nonce.toString()
  }

  // Return the complete EIP-712 typed data structure
  return {
    types,
    domain,
    primaryType: 'SafeTx',
    message
  }
}

/**
 * Helper function to format a signature for Safe
 * This function adjusts the v value according to Safe's requirements
 */
function formatSafeSignature(signature) {
  // Remove the '0x' prefix
  const signatureWithoutPrefix = signature.slice(2)

  // Extract r, s, v components
  const r = '0x' + signatureWithoutPrefix.slice(0, 64)
  const s = '0x' + signatureWithoutPrefix.slice(64, 128)

  // Get v value (last byte)
  let v = parseInt(signatureWithoutPrefix.slice(128, 130), 16)

  console.log('Original signature components:', { r, s, v: v.toString(16) })

  // For eth_signTypedData_v4, Safe expects v to be 27 or 28
  // If v is already 27 or 28, we don't need to adjust it
  // If v is 0 or 1, we need to add 27
  if (v < 27) {
    v += 27
    console.log('Adjusted v value to:', v.toString(16))
  }

  // Reconstruct the signature with the adjusted v value
  const adjustedSignature =
    '0x' +
    signatureWithoutPrefix.slice(0, 128) +
    v.toString(16).padStart(2, '0')

  console.log('Adjusted signature:', adjustedSignature)
  return adjustedSignature
}

function EthSignTypedDataSafe({ signerAddress }) {
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [signature, setSignature] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [safeTxHash, setSafeTxHash] = useState('')
  const [safeClient, setSafeClient] = useState<SafeClient | null>(null)
  const [safeTransaction, setSafeTransaction] = useState(null)
  const [chainId, setChainId] = useState(10) // Default to Optimism
  const [pendingTransactions, setPendingTransactions] = useState([])

  // Example Safe transaction details
  const safeAddress = '0xEF42eE1874BFE45563A04A233FeEa1D8643F63A1'
  const maliciousAddress = '0x0d524a5b52737c0a02880d5e84f7d20b8d66bfba'

  // Initialize Safe SDK and fetch Safe details
  useEffect(() => {
    if (!signerAddress) return

    const initSafe = async () => {
      try {
        // Get chain ID
        const chainIdHex = await window.silk.request({
          method: 'eth_chainId'
        })
        const chainId = parseInt(chainIdHex, 16)
        setChainId(chainId)

        // Create Safe client
        const client: SafeClient = await createSafeClient({
          provider: 'https://mainnet.optimism.io',
          signer: signerAddress,
          safeAddress: safeAddress
        })

        console.log('client', client)
        setSafeClient(client)

        // Fetch pending transactions
        const response = await client.getPendingTransactions()

        setPendingTransactions(response.results || [])
      } catch (error) {
        console.error('Error initializing Safe client:', error)
        setStatus(
          `Error: ${error.message || 'Failed to initialize Safe client'}`
        )
      }
    }

    initSafe()
  }, [signerAddress])

  const signTransaction = async (transaction) => {
    if (!safeClient) {
      setStatus('Safe client not initialized')
      return
    }

    try {
      setIsLoading(true)
      setStatus('Preparing to sign...')

      // Extract the EIP-712 typed data for signing
      const typedData = extractTypedDataFromSafeTransaction(
        transaction,
        safeAddress,
        chainId
      )

      console.log('typedData', typedData)

      setStatus('Waiting for signature...')

      // Request signature using eth_signTypedData_v4
      const signature = await window.silk.request({
        method: 'eth_signTypedData_v4',
        params: [signerAddress, JSON.stringify(typedData)]
      })

      const formattedSignature = formatSafeSignature(signature)

      const safeTxHash = transaction.safeTxHash

      // Call the confirmTransaction function from the Safe SDK
      const result = await safeClient.apiKit.confirmTransaction(
        safeTxHash,
        formattedSignature
      )

      setStatus('Transaction confirmed successfully!')

      // Update the transaction's confirmations to show it's signed
      setPendingTransactions((prevTransactions) =>
        prevTransactions.map((tx) =>
          tx.safeTxHash === transaction.safeTxHash
            ? {
                ...tx,
                confirmations: [
                  ...(tx.confirmations || []),
                  {
                    owner: signerAddress,
                    submissionDate: new Date().toISOString()
                  }
                ]
              }
            : tx
        )
      )

      setStatus('Transaction signed successfully!')
    } catch (error) {
      console.error('Error signing transaction:', error)
      setStatus(`Error: ${error.message || 'Failed to sign transaction'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const TransactionCard = ({ transaction, title, status }) => {
    const isMalicious =
      transaction.to.toLowerCase() === maliciousAddress.toLowerCase()
    const hasSigned = transaction.confirmations?.some(
      (conf) => conf.owner.toLowerCase() === signerAddress.toLowerCase()
    )
    const isPending = !hasSigned && !isMalicious

    return (
      <div className='transaction-card'>
        <div className='transaction-badges'>
          {isMalicious && (
            <span className='badge badge-danger'>
              Example Malicious Transaction
            </span>
          )}
          {hasSigned && <span className='badge badge-success'>Signed</span>}
          {isPending && (
            <span className='badge badge-warning'>
              Example Regular Transaction
            </span>
          )}
        </div>
        <div className='transaction-header'>
          <h3 className='transaction-title'>{title}</h3>
        </div>
        <div className='transaction-details'>
          <div className='detail-row'>
            <span className='detail-label'>Recipient:</span>
            <span className='detail-value'>{transaction.to}</span>
          </div>
          <div className='detail-row'>
            <span className='detail-label'>Amount:</span>
            <span className='detail-value'>
              {Number(transaction.value) / 1e18} ETH
            </span>
          </div>
          <div className='detail-row'>
            <span className='detail-label'>Chain ID:</span>
            <span className='detail-value'>{chainId}</span>
          </div>
        </div>
        {!hasSigned && (
          <button
            onClick={() => signTransaction(transaction)}
            disabled={isLoading}
            className='button button-primary'
          >
            {isLoading ? 'Signing...' : 'Sign Transaction'}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className='container'>
      {signerAddress && (
        <>
          <div className='info-card'>
            <p>Safe Connected:</p>
            <span>{safeAddress}</span>
          </div>

          <h2 className='section-title'>Pending Transactions</h2>

          {pendingTransactions.map((tx, index) => {
            const hasSigned = tx.confirmations?.some(
              (conf) => conf.owner.toLowerCase() === signerAddress.toLowerCase()
            )
            const isMalicious =
              tx.to.toLowerCase() === maliciousAddress.toLowerCase()

            let title = 'Regular Transaction'
            if (hasSigned) {
              title = 'Awaiting Confirmations'
            } else if (isMalicious) {
              title = 'Malicious Transaction'
            }

            return (
              <TransactionCard
                key={tx.safeTxHash}
                transaction={tx}
                title={title}
                status={hasSigned ? 'signed' : 'pending'}
              />
            )
          })}

          {status && (
            <div
              className={`status-message ${
                status.startsWith('Error')
                  ? 'error'
                  : status.includes('success')
                  ? 'success'
                  : 'info'
              }`}
            >
              {status}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EthSignTypedDataSafe
