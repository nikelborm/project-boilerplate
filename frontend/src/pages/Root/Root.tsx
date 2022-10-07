import { Link } from 'react-router-dom';

export function Root() {
  const asd = () => {
    // eslint-disable-next-line no-debugger
    // debugger;
  };
  return (
    <div>
      <Link to="/auth/login">Login!</Link>
      <br />
      <Link to="/auth/registration">Registration!</Link>

      <div>Лендинг с инфой о платформе</div>
      <button onClick={asd} type="button">
        Test debugger
      </button>
    </div>
  );
}
