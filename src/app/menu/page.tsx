import GuestMenuClient from './GuestMenuClient';

interface MenuPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const resolvedParams = await searchParams;

  // Format parameter records to strings
  const params: Record<string, string> = {};
  for (const key in resolvedParams) {
    const val = resolvedParams[key];
    if (typeof val === 'string') {
      params[key] = val;
    } else if (Array.isArray(val)) {
      params[key] = val[0] || '';
    }
  }

  return <GuestMenuClient params={params} />;
}
