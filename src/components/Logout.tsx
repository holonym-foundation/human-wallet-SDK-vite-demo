function Logout({ setAddress }: { setAddress: (address: string) => void }) {
  return (
    <div>
      <h2>Logout</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            .logout()
            // @ts-ignore
            .then((result) => {
              console.log('logged out')
              setAddress('')
            })
            // @ts-ignore
            .catch((err) => console.error(err))
        }}
        className='button'
      >
        Logout
      </button>
    </div>
  )
}

export default Logout
