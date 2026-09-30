import 'dotenv/config';
import {app} from './src/app.js';
import connectDB from './src/db/db.js';
import dns from 'dns'

dns.setServers(['8.8.8.8', '1.1.1.1'])

const PORT = process.env.PORT || 3000;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("Failed to start server:", error)
    }
)



