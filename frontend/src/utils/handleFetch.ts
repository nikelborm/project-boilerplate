export const handleFetch = async (res: Response) => {
  const parsed = await res.json();

  if (res.ok) return parsed;

  throw parsed ?? res.statusText;
};
