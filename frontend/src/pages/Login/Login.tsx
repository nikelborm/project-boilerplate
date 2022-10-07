import { useLoginMutation } from 'hooks';
import { Form, message } from 'antd';
import {
  AuthFormSubmitButton,
  CenteredAuthFormHeader,
  LoginFormFields,
} from 'components';
import { Link } from 'react-router-dom';

export function Login() {
  const [form] = Form.useForm();
  const { sendLoginQuery } = useLoginMutation();
  const onFinishCreationFailed = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    message.error('Submit failed!');
  };
  return (
    <>
      <CenteredAuthFormHeader>Login</CenteredAuthFormHeader>
      <Form
        form={form}
        layout="vertical"
        onFinish={sendLoginQuery}
        onFinishFailed={onFinishCreationFailed}
        autoComplete="on"
        initialValues={{ remember: true }}
      >
        <LoginFormFields />
        <AuthFormSubmitButton
          buttonText="Log in"
          link={<Link to="/auth/registration">create an account now!</Link>}
        />
      </Form>
    </>
  );
}
