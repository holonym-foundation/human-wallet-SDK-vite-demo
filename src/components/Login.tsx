import { useEffect } from 'react'

function Login({
  setAddress,
  setSignerAddress
}: {
  setAddress: (address: string) => void
  setSignerAddress: (address: string) => void
}) {
  useEffect(() => {
    if (!window.silk) return

    const getAccount = async () => {
      await window.silk.request({
        method: 'eth_requestAccounts',
        params: []
      })
    }

    getAccount()

    window.silk.on('accountsChanged', (accounts: string[]) => {
      setAddress(accounts[0])
    })
  }, [])

  return (
    <div>
      <h2>Login Demo</h2>
      <button
        onClick={async () => {
          // @ts-ignore
          await window.silk.login(window.ethereum)

          window.silk
            .request({
              method: 'eth_requestAccounts'
            })
            .then((accounts: any) => {
              setAddress(accounts[0])
              setSignerAddress(accounts[0])
            })
          // @ts-ignore
        }}
        className='button'
      >
        Login
      </button>
    </div>
  )
}

export default Login
