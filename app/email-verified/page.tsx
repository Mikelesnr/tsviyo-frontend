import EmailVerifiedForm from './EmailVerifiedPage';
import { Suspense } from 'react';

function Loading() {
  return (
    <div className="text-center py-8">
      <p className="text-gray-600">Loading verification status...</p>
    </div>
  );
}

export default function EmailVerifiedPage() {
  return (
    <Suspense fallback={<Loading />}>
      <EmailVerifiedForm />
    </Suspense>
  );
}