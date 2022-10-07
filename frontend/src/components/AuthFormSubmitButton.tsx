import styled from 'styled-components';

import { Form, Button } from 'antd';

const StretchedAntButton = styled(Button)`
  width: 100%;
  margin-bottom: 10px;
`;

export function AuthFormSubmitButton({
  buttonText,
  link,
}: {
  buttonText: string;
  // eslint-disable-next-line react/require-default-props
  link?: React.ReactElement;
}) {
  return (
    <Form.Item>
      <StretchedAntButton type="primary" htmlType="submit">
        {buttonText}
      </StretchedAntButton>
      {link && <>Or {link}</>}
    </Form.Item>
  );
}
