import "dotenv/config";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import { server } from "./app.js";
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("App is not able to connect with the database.");
    });

    server.listen(PORT, () => {
      console.log("Connection Successful with app at Port:", PORT);
    });
  })
  .catch((err) => {
    console.log(`Err : connection failed with db : `, err);
  });
