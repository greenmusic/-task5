const express = require('express');
const cors = require('cors');
const app = express();
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_secret_key_here'; // Лучше вынести в env

// JWT middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
}
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cors());

const db = mysql.createPool({  
    host: "localhost",
    database: "travel_db",
    user: "root",
    password: ""
});


// Защищённый эндпоинт
app.get("/api/get/all_users", authenticateToken, (req, res) => {
    const sqlSelect = "SELECT * FROM users";
    db.query(sqlSelect, (err, result) => {
        res.send(result);
    });
});

app.post("/api/post/registration", async (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlInsert = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        db.query(sqlInsert, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if(err.code === 'ER_DUP_ENTRY'){
                    res.status(500).json({ error: "Пользователь с такими данными уже зарегистрирован" });
                }else{
                    res.status(500).json({ error: "Регистрация не удалась"});
                }
            } else {
                res.json({ success: true });
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Server error"});
    }
});

// Новый эндпоинт для логина
app.post("/api/post/login", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
    }
    const sqlSelect = "SELECT * FROM users WHERE email = ?";
    db.query(sqlSelect, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: "Server error" });
        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        // Генерируем JWT
        const token = jwt.sign(
          { id: user.id, name: user.name, email: user.email },
          JWT_SECRET,
          { expiresIn: '7d' }
        );
        res.json({ success: true, user: { id: user.id, name: user.name, email: user.email }, token });
    });
});

// Создание путешествия (только для авторизованных)
app.post("/api/travels", authenticateToken, (req, res) => {
  const {
    title,
    description,
    images, // массив base64-строк
    price,
    comfort_rating,
    safety_rating,
    population_rating,
    vegetation_rating
  } = req.body;
  const author_id = req.user.id;
  const author_name = req.user.name;
  if (!title || !images || !Array.isArray(images) || images.length === 0 || !price) {
    return res.status(400).json({ error: "Необходимо заполнить все обязательные поля (название, картинки, стоимость)" });
  }

  const sql = `INSERT INTO travels
    (title, description, author_id, author_name, images, price, comfort_rating, safety_rating, population_rating, vegetation_rating)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  db.query(
    sql,
    [
      title,
      description || null,
      author_id,
      author_name,
      JSON.stringify(images),
      price,
      comfort_rating || null,
      safety_rating || null,
      population_rating || null,
      vegetation_rating || null
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: "Ошибка при создании путешествия" });
      }
      res.json({ success: true, travel_id: result.insertId });
    }
  );
});

// Получить все путешествия текущего пользователя
app.get("/api/my-travels", authenticateToken, (req, res) => {

  const userId = req.query.id ? req.query.id : req.user.id;
  const sql = "SELECT * FROM travels WHERE author_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при получении путешествий" });
    }
    // Преобразуем images из JSON-строки в массив
    const travels = results.map(travel => ({
      ...travel,
      images: travel.images ? travel.images : []
    }));
    res.json(travels);
  });
});

// Получить все путешествия текущего пользователя
app.get("/api/all-travels", authenticateToken, (req, res) => {

  const sql = "SELECT * FROM travels";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: "Ошибка при получении путешествий" });
    }
    // Преобразуем images из JSON-строки в массив
    const travels = results.map(travel => ({
      ...travel,
      images: travel.images ? travel.images : []
    }));
    res.json(travels);
  });
});



app.listen(3001, () => {
    console.log('running on port 3001');
});