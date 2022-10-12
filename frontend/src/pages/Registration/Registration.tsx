import { Button, Form, message } from 'antd';
import {
  AuthFormSubmitButton,
  CenteredAuthFormHeader,
  RegistrationFormFields,
} from 'components';
import { useRegistrationMutation, useTokenPairUpdater } from 'hooks';
import { Link } from 'react-router-dom';

export function Registration() {
  const [form] = Form.useForm();
  const { sendRegistrationQuery, data } = useRegistrationMutation();
  const { updateTokenPair } = useTokenPairUpdater();

  return (
    <>
      <CenteredAuthFormHeader>Registration</CenteredAuthFormHeader>
      {data ? (
        <div>
          <p>
            Your registration was successful. We sent you an email with
            confirmarion button. Please open this link to confirm your email.
          </p>
          <Button
            type="primary"
            onClick={() => updateTokenPair(data.authTokenPair)}
          >
            Ok, log me in
          </Button>
        </div>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={sendRegistrationQuery}
          onFinishFailed={onFinishCreationFailed}
          autoComplete="off"
        >
          <RegistrationFormFields />
          <AuthFormSubmitButton
            buttonText="Create account"
            link={<Link to="/auth/login">enter your account!</Link>}
          />
        </Form>
      )}
    </>
  );
}

const onFinishCreationFailed = () => {
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  message.error('Submit failed!');
};
