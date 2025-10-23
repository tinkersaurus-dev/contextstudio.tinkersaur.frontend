import { redirect } from 'next/navigation';

/**
 * Root page - redirects to canvas page
 */
export default function Home() {
  redirect('/canvas');
}
