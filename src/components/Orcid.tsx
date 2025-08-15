import { useEffect } from 'react'

function Orcid() {
  return (
    <div className='orcid'>
      <h2>ORCID Account Linking Demo</h2>
      <button
        onClick={() => {
          // @ts-ignore
          window.silk
            // @ts-ignore
            .orcid()
            // @ts-ignore
            .then(() => {
              console.log('Orcid flow started')
            })
            // @ts-ignore
            .catch((err) => console.error(err))
        }}
        className='button'
      >
        Link ORCID
      </button>
    </div>
  )
}

export default Orcid
