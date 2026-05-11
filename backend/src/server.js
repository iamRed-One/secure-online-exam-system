const app = require('./app');
const { startAutoSubmitJob } = require('./modules/session/autoSubmit.job');
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startAutoSubmitJob();
});