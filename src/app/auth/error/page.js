import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Authentication Failed</h1>
      <p className="mb-8 text-lg">We could not sign you in. Please try again.</p>
      <Link href="/" className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        Return to Home
      </Link>
    </div>
  );
}
