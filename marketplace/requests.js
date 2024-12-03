require("dotenv").config();
const axios = require("axios"); // Using axios to sen requests

async function logAction({ store_id, PLU, date, action_id }) {
  try {
    const response = await axios.post(
      `${process.env.STORIES_SERVER_URL}/stories`,
      {
        store_id,
        PLU,
        date,
        action_id,
      }
    );
    console.log("Action logged successfully:", response.data);
  } catch (err) {
    console.error("Error logging action:", err.message);
  }
}

module.exports = logAction;
