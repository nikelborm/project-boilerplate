import { useTokenPairUpdater } from 'hooks';

export function Login() {
  const { updateTokenPair } = useTokenPairUpdater();
  return (
    <div>
      Login
      <button
        onClick={() =>
          updateTokenPair({
            accessToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uVVVJRCI6IjA0MjZkNWQyLTViMWMtNGYyOS1hZjYzLWMzNmUxZjUyMmNkOCIsInVzZXIiOnsiaWQiOjEsImVtYWlsIjoiZW1haWw4QG1haWwucnUiLCJmaXJzdE5hbWUiOiJmaXJzdE5hbWUiLCJsYXN0TmFtZSI6Imxhc3ROYW1lIn0sImlhdCI6MTY1Mjg4OTU0OSwiZXhwIjoxNjUyODkwMTQ5fQ.AnsXkkDWu5kgW9Z2_b86ZSfpCGuJJ0bL6tfHzcQD6-c',
            refreshToken:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzZXNzaW9uVVVJRCI6IjA0MjZkNWQyLTViMWMtNGYyOS1hZjYzLWMzNmUxZjUyMmNkOCIsInVzZXIiOnsiaWQiOjF9LCJpYXQiOjE2NTI4ODk1NDksImV4cCI6MTY1MzQ5NDM0OX0.MILAPy-_GZQIOXtcs7GBrteD5EBUJZrQFhH-CJmoug0',
          })
        }
        type="button"
      >
        Login
      </button>
    </div>
  );
}
