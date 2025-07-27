import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useParams, Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import RegisterForm from "./components/RegisterForm";
import CreateTravelForm from "./components/CreateTravelForm";
import UserTravelsList from "./components/UserTravelsList";
import LoginForm from "./components/LoginForm";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: #f8f9fa;
`;

const HeadingText = styled.div`
  text-align: center;
  max-width: 800px;
  margin-bottom: 20px;

  h2 {
    font-size: 28px;
    color: #007bff;
    margin-bottom: 5px;
  }

  h3 {
    font-size: 22px;
    color: #333;
    margin-bottom: 15px;
  }
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  width: 100%;
  max-width: 1200px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Section = styled.div`
  width: 100%;
  padding: 20px;
`;

function UserProfileWrapper() {
  const { id } = useParams();
  return <UserTravelsList id={id} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();


  // Восстановление пользователя из localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Сохранять пользователя в localStorage при входе
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    navigate("/");
  };

  return (
    <Container>
        <HeadingText>
          <h2>Дневник путешествий</h2>
          {/*  <h3>---</h3> */}
        </HeadingText>
        {user && <>
          <div className="header-menu">
            <Link to="/">Главная</Link>
            <Link to="/create_travel">Добавить путешествие</Link>
            <div onClick={handleLogout}>Выйти</div>
          </div>
        </>}
        <Routes>
          <Route path="/user_travels/:id" element={<UserProfileWrapper />} />
          <Route path="/create_travel" element={<CreateTravelForm />} />
          <Route path="*" element={
            <Content>
              <Section>
                {user ? (
                  <>
                    <UserTravelsList />
                  </>
                ) : (
                  <>
                    {showRegister ? (
                      <>
                        <RegisterForm onRegister={setUser} />
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                          Уже есть аккаунт?{' '}
                          <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowRegister(false)}>
                            Войти
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <LoginForm onLogin={setUser} />
                        <div style={{ marginTop: 10, textAlign: 'center' }}>
                          Нет аккаунта?{' '}
                          <button type="button" style={{ color: '#007bff', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setShowRegister(true)}>
                            Зарегистрироваться
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}
              </Section>
            </Content>
          } />
        </Routes>
    </Container>
  );
}

export default App;
