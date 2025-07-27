import React, { useState } from "react";
import { FormContainer, Form, Input, Button, ErrorMsg } from "./StyledFormComponents";
import axios from "axios";

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await axios.post("http://localhost:3001/api/post/registration", formData);
      if (response.data.success) {
        // После успешной регистрации сразу логиним пользователя
        const loginResp = await axios.post("http://localhost:3001/api/post/login", {
          email: formData.email,
          password: formData.password
        });
        if (loginResp.data.success && onRegister) {
          if (loginResp.data.token) {
            localStorage.setItem("accessToken", loginResp.data.token);
          }
          onRegister({ ...loginResp.data.user, token: loginResp.data.token });
        }
        setFormData({ name: "", email: "", password: "" });
      } else {
        setError("Ошибка регистрации");
      }
    } catch (error) {
      if(error?.response?.data?.error){
        setError(error.response.data.error)
      }else{
        setError("Ошибка регистрации")
      }
    }
  };

  // if (success) {
  //   return <div style={{ textAlign: "center", marginTop: "20px" }}>{success}</div>;
  // }else if (error) {
  //   return <div style={{ textAlign: "center", marginTop: "20px", color: "red" }}>{error}</div>;
  // }
  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <h2
          style={{
            textAlign: "center",
            fontSize: "18px",
            marginBottom: "10px",
          }}
        >
          Регистрация
        </h2>
        <Input
          type="text"
          name="name"
          placeholder="Имя"
          value={formData.name}
          onChange={handleChange}
        />
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
        <Button type="submit">Зарегистрироваться</Button>
        {error && <ErrorMsg>{error}</ErrorMsg>}

      </Form>
    </FormContainer>
  );
};

export default RegisterForm;
