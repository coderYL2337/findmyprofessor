import React from 'react';
import { Box, Typography, Rating, Paper, Grid } from '@mui/material';

interface Review {
  professor: string;
  subject: string;
  stars: number;
  review: string;
}

interface ProfessorReviewsProps {
  reviews: Review[];
}

const ProfessorReviews: React.FC<ProfessorReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return <Typography>No reviews available.</Typography>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 2 }}>
      <Grid container spacing={3}>
        {reviews.map((review, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="h6">{review.professor}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {review.subject}
              </Typography>
              <Rating value={review.stars} readOnly precision={0.5} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {review.review}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ProfessorReviews;