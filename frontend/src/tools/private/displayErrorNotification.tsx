import { message } from 'antd';

export const displayErrorNotification = (err: any) =>
  void message.error(
    <>
      Error
      <div style={{ textAlign: 'left' }}>
        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */}
        {err?.message?.split('\n').map((e) => (
          <>
            {e}
            <br />
          </>
        ))}
      </div>
    </>,
  );
