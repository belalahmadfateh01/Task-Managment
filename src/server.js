import app from "./app.js";
import pool from "./config/db.js";
const PORT = process.env.PORT || 3000;

const result = await pool.query('');
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
})