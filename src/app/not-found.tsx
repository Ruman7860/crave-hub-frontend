import Link from 'next/link'
const NotFoundPage = () => {
    return (
        <div className="flex justify-center items-center h-screen bg-linear-to-br from-orange-50 via-red-50 to-yellow-50">
            <div className='flex-col justify-center items-center'>

                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="text-lg mt-4">The page you are looking for does not exist.</p>
            </div>
        </div>
    )
}

export default NotFoundPage