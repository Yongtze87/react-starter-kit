import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json, redirect } from 'react-router';
import { DocumentReview } from '~/components/admin/document-review';
import { getCurrentUserProfile } from '~/lib/supabase';

export const meta: MetaFunction = () => {
  return [{ title: 'Document Review - Admin Dashboard' }];
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userProfile = await getCurrentUserProfile();

    if (!userProfile || !userProfile.profile) {
      return redirect('/sign-in');
    }

    // Check if user is admin
    if (userProfile.profile.role !== 'admin') {
      return redirect('/dashboard');
    }

    return json({ user: userProfile.profile });
  } catch (error) {
    console.error('Error loading document review:', error);
    return redirect('/sign-in');
  }
}

export default function AdminDocuments() {
  return <DocumentReview />;
}
