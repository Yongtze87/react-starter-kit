import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json, redirect } from 'react-router';
import { EscalationManagement } from '~/components/admin/escalation-management';
import { getCurrentUserProfile } from '~/lib/supabase';

export const meta: MetaFunction = () => {
  return [{ title: 'Escalation Management - Admin Dashboard' }];
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
    console.error('Error loading escalation management:', error);
    return redirect('/sign-in');
  }
}

export default function AdminEscalations() {
  return <EscalationManagement />;
}
