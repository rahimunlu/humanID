import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/wallet');
  return null;
}
