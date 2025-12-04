import type { LoaderFunctionArgs, MetaFunction } from 'react-router';
import { json, redirect } from 'react-router';
import { AdminOverview } from '~/components/admin/admin-overview';
import { getCurrentUserProfile } from '~/lib/supabase';

export const meta: MetaFunction = () => {
  return [{ title: 'Admin Dashboard - AI Accounting Assistant' }];
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
    console.error('Error loading admin dashboard:', error);
    return redirect('/sign-in');
  }
}

export default function AdminDashboard() {
  return <AdminOverview />;
}
