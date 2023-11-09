const express = require('express'); //commont js
const movies = require('./json');
const crypto = require('node:crypto'); //generar id aleatorio
const cors = require('cors'); //manejo de cors
const z = require('zod'); //crear schemas
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express();
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:1234',
      'https://movies.com',
      'https://midu.dev'
    ]

    if (ACCEPTED_ORIGINS.includes(origin)) {
      return callback(null, true)
    }

    if (!origin) {
      return callback(null, true)
    }

    return callback(new Error('Not allowed by CORS'))
  }
}));

app.disable('x-powered-by'); //deshabilitar header x-powered-by

app.get('/movies', (req ,res) => {
  const { lang } = req.query;
  if(lang){
    const movie = movies.movies.filter(mov => mov.original_language.toLowerCase() === lang.toLowerCase());
    return res.json(movie)
  }

  res.json(movies.movies)
});

app.get('/movies/:id', (req ,res) => {
  const { id } = req.params;
  const movie = movies.movies.find(movie => movie.id === Number(id));
  if(movie) return res.json(movie);

  res.status(404).json({message: 'movie not found'});
});

app.post('/movies', (req ,res) => {
  const result = validateMovie(req.body)

  if (!result.success) {
    // 422 Unprocessable Entity
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  // en base de datos
  const newMovie = {
    id: crypto.randomUUID(), // uuid v4
    ...result.data
  }

  // Esto no sería REST, porque estamos guardando
  // el estado de la aplicación en memoria
  movies.movies.push(newMovie);

  res.status(201).json({message: 'succesfull create movie',newMovie});
});

app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)

  if (!result.success) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const { id } = req.params
  const movieIndex = movies.movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  const updateMovie = {
    ...movies.movies[movieIndex],
    ...result.data
  }

  movies.movies[movieIndex] = updateMovie

  return res.json({message: 'update movie succesfull',updateMovie})
});

app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) {
    return res.status(404).json({ message: 'Movie not found' })
  }

  movies.movies.splice(movieIndex, 1)

  return res.json({ message: 'Movie deleted' })
});

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, ()=> {
  console.log(`Server listening in port http://localhost:${PORT}`)
});