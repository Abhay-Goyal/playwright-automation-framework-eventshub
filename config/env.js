import dotenv from "dotenv"
import path from "path";

dotenv.config({
    path : path.join(__dirname , `../.env/.env.${process.env.ENV}`)
})

export const config = {
    base_url : process.env.base_url,
    timeout : parseInt(process.env.timeout)
}
