import React, { useEffect, useState } from "react";
import axios from "axios";
import { FormContainer } from "./StyledFormComponents";
import { Link } from "react-router-dom";
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const TravelCard = ({ travel }) => (
  <div style={{
    border: '1px solid #ddd',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
    background: '#fff',
    maxWidth: 900,
    width: '100%'
  }}>
    <h3 style={{ margin: '0 0 8px 0' }}>{travel.title}</h3>
    <div style={{ marginBottom: 8, color: '#555' }}>{travel.description}</div>
    <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
      {travel.images && travel.images.map((img, idx) => (
            <Zoom>
            <img key={idx} src={img} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} 
          /></Zoom>
      ))}
    </div>
    <div><b>Стоимость путешествия:</b> {travel.price} ₽</div>
    <div className="rating-block" style={{ marginTop: 8 }}>
      <span style={{ marginRight: 12 }}><b>Удобство:</b> {travel.comfort_rating || '-'}</span>
      <span style={{ marginRight: 12 }}><b>Безопасность:</b> {travel.safety_rating || '-'}</span>
      <span style={{ marginRight: 12 }}><b>Населённость:</b> {travel.population_rating || '-'}</span>
      <span><b>Растительность:</b> {travel.vegetation_rating || '-'}</span>
    </div>

    {travel.author_name && (
      <div style={{ color: '#888', marginTop: 8 }}>
        Автор: <Link to={`/user_travels/${travel.author_id}`}>{travel.author_name}</Link> 
      </div>
    )}

    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
      Создано: {new Date(travel.created_at).toLocaleString()}
    </div>
  </div>
);

const UserTravelsList = (props) => {
  const [travels, setTravels] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTravels = async () => {
      setLoading(true);
      setError("");
      const id = props.id;
      try {
        const token = localStorage.getItem("accessToken");
        let api_url = '/api/all-travels';
        if(id) api_url = '/api/my-travels';
        const response = await axios.get("http://localhost:3001"+api_url, {
          params: { id: id },
          headers: { Authorization: token ? `Bearer ${token}` : undefined }
        });
        setTravels(response.data);
      } catch (err) {
        setError("Ошибка при загрузке путешествий");
      } finally {
        setLoading(false);
      }
    };
    fetchTravels();
  }, []);

  return (
    <FormContainer>
      <div style={{ width: '100%', maxWidth: 900 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>Путешествия</h2>
        {loading && <div>Загрузка...</div>}
        {error && <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>}
        {(!loading && travels.length === 0) && <div style={{ textAlign: 'center', color: '#888' }}>Пока еще не делились путешествиями</div>}
        {travels.map(travel => (
          <TravelCard key={travel.id} travel={travel} />
        ))}
      </div>
    </FormContainer>
  );
};

export default UserTravelsList; 