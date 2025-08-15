import { useAccount, useBalance } from 'wagmi'
import { formatUnits, hexToBigInt } from 'viem'
import { useEffect, useState } from 'react'

function Balance() {
  const [balance, setBalance] = useState<string | null>(null)

  const fetchBalance = async () => {
    const account = (await window.silk.request({
      method: 'eth_requestAccounts',
      params: []
    })) as string[]
    const balance = (await window.silk.request({
      method: 'eth_getBalance',
      params: [account[0]]
    })) as string

    const balanceBigInt = hexToBigInt(balance as `0x${string}`)
    const formatted = formatUnits(balanceBigInt, 18)

    setBalance(formatted)
  }

  return (
    <div>
      <h2>Balance Demo</h2>
      <button onClick={fetchBalance}>Get Balance</button>
      <p>Balance: {balance ?? '<null>'}</p>
    </div>
  )
}

export default Balance
