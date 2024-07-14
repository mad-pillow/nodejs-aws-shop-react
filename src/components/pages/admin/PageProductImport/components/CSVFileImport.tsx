import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import axios from "axios";
import React from "react";
import { toast } from "react-toastify";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | null>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const uploadFile = async () => {
    if (!file) {
      return;
    }

    try {
      const token = localStorage.getItem("authorization_token");

      const authorizationToken = token
        ? { Authorization: `Basic ${token}` }
        : null;

      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: {
          ...authorizationToken,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast("File was uploaded", {
          type: "success",
          position: "bottom-right",
        });
      }

      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data);

      const result = await fetch(response.data.url, {
        method: "PUT",
        body: file,
      });

      console.log("Result: ", result);
      setFile(null);
    } catch (error) {
      console.error("There was an error uploading the file: ", error);

      if (axios.isAxiosError(error)) {
        let reason = "Unknown";

        switch (error.response?.status) {
          case 401:
            reason = "Unauthorized";
            break;
          case 403:
            reason = "Forbidden";
            break;
          case 500:
            reason = "Internal Server Error";
            break;
        }

        toast(`File upload failed with error: ${reason}`, {
          type: "error",
          position: "bottom-right",
        });
      }
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
