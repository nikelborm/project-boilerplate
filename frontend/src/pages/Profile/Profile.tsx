import { useParams } from 'react-router-dom';

export function Profile() {
  const asd = useParams();
  console.log('asd: ', asd);
  return <div>Profile</div>;
}
