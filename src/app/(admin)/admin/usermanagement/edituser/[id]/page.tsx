import React from 'react'
import EditUserPage from './EditUserPage'

function page({ params }: { params: { id: string } }) {
  return (
    <EditUserPage params={params} />
  )
}

export default page