import { useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import mammoth from "mammoth";

// Set the PDF.js worker source
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

function FileTextExtractor() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState("");

  // Handle file selection
  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      const fileType = uploadedFile.name.split(".").pop().toLowerCase();
      if (["pdf", "docx", "txt"].includes(fileType)) {
        setFile(uploadedFile);
        setText(""); // Clear previous text on new file upload
      } else {
        alert("Please upload a valid PDF, DOCX, or TXT file.");
        setFile(null);
      }
    }
  };

  // Handle text extraction on button click
  const handleExtractText = async () => {
    if (!file) {
      alert("Please upload a file first!");
      return;
    }

    const fileType = file.name.split(".").pop().toLowerCase();

    if (fileType === "pdf") {
      extractFromPdf(file);
    } else if (fileType === "docx") {
      extractFromDocx(file);
    } else if (fileType === "txt") {
      extractFromTxt(file);
    }
  };

  // Extract text from PDF files
  const extractFromPdf = async (file) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result);
      const pdf = await getDocument(typedArray).promise;
      let extractedText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        extractedText += `Page ${i}:\n${pageText}\n\n`;
      }

      setText(extractedText);
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract text from DOCX files using Mammoth
  const extractFromDocx = (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const { value } = await mammoth.extractRawText({ arrayBuffer });
      setText(value.trim());
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract text from TXT files
  const extractFromTxt = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target.result);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">File Text Extractor</h1>

      <input
        type="file"
        accept=".pdf,.docx,.txt"
        onChange={handleFileUpload}
        className="mb-4"
      />

      <button
        onClick={handleExtractText}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Extract Text
      </button>

      {text && (
        <div className="border p-4 bg-gray-100 mt-2 rounded-md overflow-auto max-h-80">
          <h2 className="text-lg font-semibold mb-2">Extracted Text:</h2>
          <pre className="text-sm whitespace-pre-wrap break-words">{text}</pre>
        </div>
      )}
    </div>
  );
}

export default FileTextExtractor;
