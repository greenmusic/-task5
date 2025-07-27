import React, { useState } from "react";
import { FormContainer, Form, Input, Button, ErrorMsg } from "./StyledFormComponents";
import axios from "axios";

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:3001/api/post/login", formData);
      if (response.data.success) {
        // Сохраняем токен
        if (response.data.token) {
          localStorage.setItem("accessToken", response.data.token);
        }
        if (onLogin) onLogin({ ...response.data.user, token: response.data.token });
        setFormData({ email: "", password: "" });
        setError("");
        setSuccess("Вход успешен");
      } else {
        setError("Неверный email или пароль");
      }
    } catch (err) {
      setError("Неверный email или пароль");
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center", fontSize: "18px", marginBottom: "10px" }}>
          Вход
        </h2>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          type="password"
          name="password"
          placeholder="Пароль"
          value={formData.password}
          onChange={handleChange}
        />
        <Button type="submit">Войти</Button>
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Form>
    </FormContainer>
  );
};

export default LoginForm; 