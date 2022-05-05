import { useAuthContextUpdater } from 'hooks';

export function Login() {
  const { updateAuthContext } = useAuthContextUpdater();
  return (
    <div>
      Login
      <button
        onClick={() =>
          updateAuthContext({
            isAuthed: true,
            authInfo: {
              id: 1,
            },
          })
        }
        type="button"
      >
        Login
      </button>
    </div>
  );
}
