import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { Form, Input } from 'antd';

export function EmailFormField() {
  return (
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
  );
}

export function PasswordFormField() {
  return (
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
  );
}

export function BasicAuthFormField({
  name,
  label,
  placeholder,
  icon,
}: {
  name: string;
  label: string;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <Form.Item
      name={name}
      label={label}
      rules={[{ type: 'string', min: 2, required: true }]}
    >
      <Input placeholder={placeholder} prefix={icon} />
    </Form.Item>
  );
}
