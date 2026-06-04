import { LoadingPage } from '@/components/ui/loading-page'
import React from 'react'

const CheckoutLoading = () => {
  return (
        <LoadingPage
          title="Preparing your order"
          description="Please wait a moment while we process your order."
        />
  )
}

export default CheckoutLoading