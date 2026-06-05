// app.post("/login", async (req, res) => {
//     const { email, password } = req.body;
//
//     const result = await pool.query(
//         "SELECT * FROM users WHERE email = $1",
//         [email]
//     );
//
//     if (result.rows.length === 0) {
//         return res.status(401).json({ error: "User neexistuje" });
//     }
//
//     res.json({ message: "LoginPage OK" });
// });