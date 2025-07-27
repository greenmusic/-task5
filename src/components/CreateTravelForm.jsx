import React, { useState } from "react";
import axios from "axios";
import { FormContainer, Form, Input, Button, ErrorMsg } from "./StyledFormComponents";

const RatingInput = ({ label, name, value, onChange }) => (
  <div style={{ marginBottom: 8 }}>
    <label>
      {label}: <Input type="number" min={1} max={10} name={name} value={value} onChange={onChange} style={{ width: 60 }} />
    </label>
  </div>
);

const CreateTravelForm = ({ onCreated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    comfort_rating: "",
    safety_rating: "",
    population_rating: "",
    vegetation_rating: "",
    images: []
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    Promise.all(files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    })).then(imagesBase64 => {
      setFormData(prev => ({ ...prev, images: imagesBase64 }));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const response = await axios.post(
        "http://localhost:3001/api/travels",
        {
          title: formData.title,
          description: formData.description,
          price: formData.price,
          comfort_rating: formData.comfort_rating,
          safety_rating: formData.safety_rating,
          population_rating: formData.population_rating,
          vegetation_rating: formData.vegetation_rating,
          images: formData.images
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : undefined
          }
        }
      );
      if (response.data.success) {
        setSuccess("Путешествие успешно добавлено!");
        setFormData({
          title: "",
          description: "",
          price: "",
          comfort_rating: "",
          safety_rating: "",
          population_rating: "",
          vegetation_rating: "",
          images: []
        });
        if (onCreated) onCreated();
      } else {
        setError("Ошибка при добавлении путешествия");
      }
    } catch (err) {
      setError("Ошибка при добавлении путешествия");
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer>
      <Form onSubmit={handleSubmit}>
        <h2 style={{ textAlign: "center", fontSize: "18px", marginBottom: "10px" }}>
          Добавить путешествие
        </h2>
        <Input
          type="text"
          name="title"
          placeholder="Название"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <Input
          as="textarea"
          name="description"
          placeholder="Описание"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />
        <Input
          type="number"
          name="price"
          placeholder="Стоимость путешествия (₽)"
          value={formData.price}
          onChange={handleChange}
          min={0}
          required
        />
        <RatingInput label="Удобство передвижения" name="comfort_rating" value={formData.comfort_rating} onChange={handleChange} />
        <RatingInput label="Безопасность" name="safety_rating" value={formData.safety_rating} onChange={handleChange} />
        <RatingInput label="Населённость" name="population_rating" value={formData.population_rating} onChange={handleChange} />
        <RatingInput label="Растительность" name="vegetation_rating" value={formData.vegetation_rating} onChange={handleChange} />
        <div style={{ margin: '10px 0' }}>
          <label>
            Фотографии (можно несколько):
            <Input type="file" accept="image/*" multiple onChange={handleImageChange} />
          </label>
        </div>
        {formData.images.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {formData.images.map((img, idx) => (
              <img key={idx} src={img} alt="preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
            ))}
          </div>
        )}
        <Button type="submit" disabled={loading}>{loading ? "Сохраняю..." : "Добавить"}</Button>
        {error && <ErrorMsg>{error}</ErrorMsg>}
        {success && <div style={{ color: 'green', marginTop: 10, textAlign: 'center' }}>{success}</div>}
      </Form>
    </FormContainer>
  );
};

export default CreateTravelForm; 