import axios from "axios";

const getAllVendors = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/vendors");
    return response.data;
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return [];
  }
};

export default getAllVendors;

export const getVendorById = async (id: string) => {
  try {
    const response = await axios.get(`http://localhost:4000/api/vendors/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vendor with id ${id}:`, error);
    return null;
  }
};

export const getVendorAvailability = async (
  id: string,
  date: string
): Promise<string[]> => {
  try {
    const res = await axios.get<string[]>(
      `http://localhost:4000/api/vendors/${id}/availability`,
      { params: { date } }
    );
    return res.data;
  } catch (err) {
    console.error(err);
    return [];
  }
};
