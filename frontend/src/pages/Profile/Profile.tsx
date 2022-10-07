import { useParams } from 'react-router-dom';

export function Profile() {
  const asd = useParams();
  console.log('Profile useParams: ', asd);
  return <div>Profile</div>;
}
