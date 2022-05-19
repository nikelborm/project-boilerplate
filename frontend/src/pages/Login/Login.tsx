import { useLoginMutation } from 'hooks';
import { Form, Button, message, Input } from 'antd';

export function Login() {
  const [form] = Form.useForm();
  const { sendLoginQuery } = useLoginMutation();
  const onFinishCreationFailed = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    message.error('Submit failed!');
  };
  return (
    <>
      <h1>Login</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={sendLoginQuery}
        onFinishFailed={onFinishCreationFailed}
        autoComplete="off"
      >
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
