import { Form, message } from 'antd';
import {
  AuthFormSubmitButton,
  CenteredAuthFormHeader,
  RegistrationFormFields,
} from 'components';
import { useRegistrationMutation } from 'hooks';
import { Link } from 'react-router-dom';

export function Registration() {
  const [form] = Form.useForm();
  const { sendRegistrationQuery } = useRegistrationMutation();
  const onFinishCreationFailed = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    message.error('Submit failed!');
  };
  return (
    <>
      <CenteredAuthFormHeader>Registration</CenteredAuthFormHeader>
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
    </>
  );
}
