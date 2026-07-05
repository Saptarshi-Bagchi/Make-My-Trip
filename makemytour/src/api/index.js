import axios from "axios"

const BACKEND_URL = "http://localhost:8080"

export const login = async (email, password) => {
    try {
        const url = `${BACKEND_URL}/user/login?email=${email}&password=${password}`
        const res = await axios.post(url);
        const data = res.data
        return data
    }
    catch (error) {
        throw error;
    }
}

export const signup = async (firstName, lastName, phoneNumber, email, password) => {
    try {
        const res = await axios.post(`${BACKEND_URL}/user/signup`, {
            firstName, 
            lastName, 
            phoneNumber, 
            email, 
            password
        });
        const data = res.data
        return data
    }
    catch (error) {
        throw error;
    }
}