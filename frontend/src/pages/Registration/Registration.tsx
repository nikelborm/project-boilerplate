import { Button, Form, Input, message } from 'antd';
import { useRegistrationMutation } from 'hooks';

export function Registration() {
  const [form] = Form.useForm();
  const { sendRegistrationQuery } = useRegistrationMutation();
  const onFinishCreationFailed = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    message.error('Submit failed!');
  };
  return (
    <>
      <h1>Registration</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={sendRegistrationQuery}
        onFinishFailed={onFinishCreationFailed}
        autoComplete="off"
      >
        <Form.Item
          name="firstName"
          label="First name"
          rules={[{ required: true }, { type: 'string', min: 2 }]}
        >
          <Input placeholder="John" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ required: true }, { type: 'string', min: 2 }]}
        >
          <Input placeholder="Doe" spellCheck={false} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email' },
            { required: true },
            { type: 'string', min: 5 },
          ]}
        >
          <Input placeholder="user@mail.ru" spellCheck={false} />
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
          <Input.Password placeholder="***********" spellCheck={false} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
