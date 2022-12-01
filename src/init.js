import "dotenv/config";
import "./db";
import "./models/Video";
import "./models/User";
import "./models/Comment";
import app from "./server";


const PORT = 4000;

function handleListening(){
  console.log(`💚Server listening on port http://localhost:${PORT}🎃`);
};

app.listen(PORT ,handleListening); //port, callback