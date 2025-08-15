import { useEffect } from 'react'

function Address({ address }: { address: string }) {
  return (
    <div className='flex flex-col gap-2 w-full h-fit'>
      <h2>Human Address</h2>
      <p>{address}</p>
    </div>
  )
}

export default Address
