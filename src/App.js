import React, { useState, useEffect } from "react";
import axios from "axios";
import io from "socket.io-client";
import "./index.css";
import "./loaders.css";

const socket = io("http://localhost:3001");

function App() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [status, setStatus] = useState("");
  const [readyMessage, setReadyMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePath, setFilePath] = useState("");
  // const [numbersFromTextarea, setNumbersFromTextarea] = useState([]);

  useEffect(() => {
    socket.on("whatsappReady", () => {
      setReadyMessage("WhatsApp is now active!");
    });
    socket.on("whatsapploggedout", () => {
      setReadyMessage("WhatsApp is now logged out!");
    });

    const fetchReadyMessage = async () => {
      try {
        const response = await axios.get("http://localhost:3001/onready");
        setReadyMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching onready message:", error.message);
      }
    };

    fetchReadyMessage();

    return () => {
      socket.off("whatsappReady");
      socket.off("whatsapploggedout");
    };
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };
  // const sendAllNumbers = async () => {
  //   try {
  //     const numbersText = document.querySelector(".numbersTextarea").value;
  //     const message = document.querySelector(".messageTextarea").value;
  //     console.log(message)
  //     const numbers = numbersText
  //       .split(",")
  //       .map((number) => number.trim())
  //       .filter((number) => number.length === 10);
  //     console.log(numbers);

  //     const response = await axios.post("http://localhost:3001/sendnumbers", {
  //       numbers: numbers,
  //       message:message,
  //       filePath:file,
  //     });
  //     console.log("Numbers sent successfully:", response.data);

  //   } catch (error) {
  //     console.error("Error sending numbers:", error.message);
  //   }
  // };


  const generateQRCode = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3001/generateqrcode");
      setQrCodeUrl(response.data.qrCodeUrl);
      setStatus("QR code generation initiated");
    } catch (error) {
      console.error("Error generating QR code:", error.message);
      setStatus("Error generating QR code");
    }
    finally {
      setIsLoading(false);
    }
  };


  const sendAllNumbers = async () => {
    try {
      const numbersText = document.querySelector(".numbersTextarea").value;
      const message = document.querySelector(".messageTextarea").value;

      const numbers = numbersText
        .split(",")
        .map((number) => number.trim())
        .filter((number) => number.length === 10);

      // Check if a file is selected
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        // Send file to the server
        const response = await axios.post("http://localhost:3001/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        // Update state with the returned file path
        setFilePath(response.data.filePath);
        console.log("File path:", filePath);
        const responseofmsg = await axios.post("http://localhost:3001/sendnumbers", {
          numbers: numbers,
          message: message,
          filePath: filePath,
        });
        console.log("Numbers sent successfully:", responseofmsg.data);
      } else {
        console.log("No file selected");
      }

    } catch (error) {
      console.error("Error sending numbers:", error.message);
    }
  };


  const logoutWhatsapp = async () => {
    try {
      const response = await axios.post("http://localhost:3001/logout");
      console.log(response.data.message);
    } catch (error) {
      console.error(error.message);

    }
  };


  return (
    <div className="main">
      <div className="header">
        <h1>WhatsApp Bulk Messanger</h1>
      </div>
      <div className="main-whatsapp-terminal">
        <div className="whatsapp_authorizations">
          <p>Status: {status}</p>
          {isLoading && <div className="qrloader"></div>}
          {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
          <p>{readyMessage}</p>
          <button onClick={generateQRCode}>Generate QR Code</button>
          <button onClick={logoutWhatsapp}>Terminate</button>
        </div>
        <div className="whatsapp_nos">
          <div>
            <h2>Enter Message:</h2>

            <div>
              <textarea
                className="messageTextarea"
              />
            </div>

            <div>
              <h1>File Upload Example</h1>
              <input type="file" onChange={handleFileChange} />
            </div>

          </div>
          <div>
            <h2>Enter Numbers:</h2>
            <div>
              <textarea
                className="numbersTextarea"
              />
            </div>

            <button
              onClick={sendAllNumbers}
              className="glow-on-hover"
              type="button"
            >
              SEND NOW
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
