import { message } from 'antd';

export const displayErrorNotification = (err: any) =>
  void message.error(
    <>
      Error
      <div style={{ textAlign: 'left' }}>
        {err?.message?.split('\n').map((e) => (
          <>
            {e}
            <br />
          </>
        ))}
      </div>
    </>,
  );
