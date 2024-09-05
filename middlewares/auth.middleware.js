import jwt from "jsonwebtoken"
import userModel from "../models/user.model.js"

const authentication = async (req, res, next) => {
    try {
        let token = req?.cookies?.accessToken || req?.headers['authorization']
        if (!token) return res.status(400).send({ message: "Token is not provided", status: false })
        token = token.split(" ")[1]
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodeToken) return res.status(401).send({ meessage: "Unauthrized", status: false })
        const user = await userModel.findById(decodeToken.userId).select("-password")
        if (!user) return res.status(401).send({ message: "Invalid Access Token", status: false })
        req.user = user
        next()
    } catch (error) {
        console.log(error)
        return res.status(401).send({ message: "Invalid token", error: error.message, status: false })
    }
}
export default authentication 