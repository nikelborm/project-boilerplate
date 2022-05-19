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
          rules={[{ type: 'string', min: 2, required: true }]}
        >
          <Input placeholder="John" />
        </Form.Item>
        <Form.Item
          name="lastName"
          label="Last name"
          rules={[{ type: 'string', min: 2, required: true }]}
        >
          <Input placeholder="Doe" spellCheck={false} />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { type: 'email' },
            { type: 'string', min: 7, required: true },
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
