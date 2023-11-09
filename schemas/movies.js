const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  original_title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required.'
  }),
  overview: z.string(),
  release_date: z.number().int().min(1900).max(2024),
  vote_count: z.number().int().positive(),
  popularity: z.number().int().positive(),
  video: z.boolean(),
  vote_average: z.number().min(0).max(10).default(5),
  poster_path: z.string(),
  backdrop_path: z.string(),
  genre_ids: z.array(z.number()),
  original_language: z.string()
})

function validateMovie (input) {
  return movieSchema.safeParse(input)
}

function validatePartialMovie (input) {
  return movieSchema.partial().safeParse(input)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}