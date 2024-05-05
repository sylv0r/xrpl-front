import axios from "axios";
import FormData from "form-data";

export const pinFileToIPFS = async (data: Record<string, string>) => {
  const formData = new FormData();
  const jsonData = JSON.stringify(data);

  // Create a Buffer from the JSON data
  const jsonBuffer = Buffer.from(jsonData, "utf-8");

  const jsonBlob = new Blob([jsonBuffer]);

  // Append the Buffer as a file to FormData
  formData.append("file", jsonBlob, {
    filename: `${self.crypto.randomUUID()}.json`,
    contentType: "application/json",
  });

  formData.append(
    "pinataOptions",
    JSON.stringify({
      cidVersion: 0,
    })
  );

  // Setting headers, include FormData's headers to handle the boundary
  const headers = {
    Authorization: "Bearer " + process.env.NEXT_PUBLIC_PINATA_API_KEY,
  };

  try {
    // Send the POST request
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: headers,
      }
    );
    const result = response.data.IpfsHash;
    fetchFileFromIPFS(result);
    return result;
  } catch (error) {
    console.error(error);
  }
};

async function fetchFileFromIPFS(ipfsHash: string) {
  const url = [process.env.NEXT_PUBLIC_PINATA_GATEWAY_BASE_URL, ipfsHash].join(
    ""
  );
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching file from IPFS:", error);
  }
}
