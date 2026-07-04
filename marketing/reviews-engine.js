const { readMarketingData } = require("./lead-sources");

function reviews(input = {}) {
  const data = readMarketingData(input);
  const ratings = data.reviews.map((review) => Number(review.rating || 0)).filter(Boolean);
  const averageRating = ratings.length ? Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(2)) : 0;
  return {
    ok: true,
    data: {
      demoMode: data.demoMode,
      totalReviews: data.reviews.length,
      averageRating,
      reviewsNeeded: Math.max(0, 5 - data.reviews.length),
      reputationStatus: averageRating >= 4.5 || !ratings.length ? "healthy" : "needs_attention",
      recommendedAction: "Ask satisfied customers for reviews only after owner approval.",
      generatedAt: new Date().toISOString()
    }
  };
}

module.exports = { reviews };
