import api from "./api.service.js";

export async function createTransaction(data) {

  try {

    const res = await api.post("/transactions", data);

    return res.data;

  } catch (err) {

    console.error(err.response?.data || err.message);

    return null;

  }

}