import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { RoutesEnum } from 'types';

export function useIdSearchParam(fallback: RoutesEnum) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const id = parseInt(searchParams.get('id') as string, 10);
  useEffect(() => {
    if (Number.isNaN(id)) navigate(`/account/${fallback}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, fallback]);

  return id;
}
