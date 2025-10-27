import { redirect } from 'next/navigation';

/**
 * Root page - redirects to context studio
 */
export default function Home() {
  redirect('/design');
}
