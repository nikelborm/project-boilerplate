import { Form, Input } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';

export function LoginFormFields() {
  return (
    <>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ type: 'email' }, { type: 'string', min: 7, required: true }]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="user@mail.ru"
          spellCheck={false}
        />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your password!',
          },
          { type: 'string', min: 8 },
        ]}
        hasFeedback
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="***********"
          spellCheck={false}
        />
      </Form.Item>
    </>
  );
}
