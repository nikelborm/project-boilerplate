import { LockOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';
import {
  BasicAuthFormField,
  EmailFormField,
  PasswordFormField,
} from './UniversalAuthFormFields';

export function RegistrationFormFields() {
  return (
    <>
      <EmailFormField />
      <PasswordFormField />
      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
          {
            required: true,
            message: 'Please confirm your password!',
          },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('Passwords does not match!'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="***********"
          spellCheck={false}
        />
      </Form.Item>
      <BasicAuthFormField
        name="firstName"
        label="First name"
        placeholder="John"
        icon={<UserOutlined />}
      />
      <BasicAuthFormField
        name="lastName"
        label="Last name"
        placeholder="Doe"
        icon={<UserOutlined />}
      />
      <BasicAuthFormField
        name="patronymic"
        label="Patronymic"
        placeholder="Sergeevich"
        icon={<UserOutlined />}
      />
      <BasicAuthFormField
        name="gender"
        label="Gender"
        placeholder="Female|Male|other"
        icon={<SmileOutlined />}
      />
    </>
  );
}
