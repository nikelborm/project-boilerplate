import { useParams } from 'react-router-dom';

export function Profile() {
  const asd = useParams();
  // eslint-disable-next-line no-console
  console.log('Profile useParams: ', asd);
  return <div>Profile</div>;
}
