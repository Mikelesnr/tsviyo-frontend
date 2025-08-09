import ResetPasswordForm from './ResetPasswordPage';
import { Suspense } from 'react';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<p className="text-center py-8">Loading reset form...</p>}>
      <ResetPasswordForm />
    </Suspense>
  );
}