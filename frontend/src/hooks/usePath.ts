import { useLocation } from 'react-router-dom';

export function usePath() {
  const path = useLocation().pathname.replace(/\/$/, '');
  const pathParts = path.split('/').filter((e) => e);
  const deepestPathPart = pathParts[1] || pathParts[0];

  return {
    path,
    pathParts,
    deepestPathPart,
  };
}
