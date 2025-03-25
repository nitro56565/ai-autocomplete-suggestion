import { ChangeEvent, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import mammoth from "mammoth";

// Set the PDF.js worker source
GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

function FileTextExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");

  // Handle file selection
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0] || null;
    if (uploadedFile) {
      const fileType = uploadedFile.name.split(".").pop()?.toLowerCase();
      if (fileType && ["pdf", "docx", "txt"].includes(fileType)) {
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

    const fileType = file.name.split(".").pop()?.toLowerCase();

    switch (fileType) {
      case "pdf":
        await extractFromPdf(file);
        break;
      case "docx":
        await extractFromDocx(file);
        break;
      case "txt":
        extractFromTxt(file);
        break;
      default:
        alert("Unsupported file type.");
    }
  };

  // Extract text from PDF files
  const extractFromPdf = async (file: Blob) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const typedArray = new Uint8Array(reader.result as ArrayBuffer);
      try {
        const pdf = await getDocument(typedArray).promise;
        let extractedText = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ");
          extractedText += `Page ${i}:
${pageText}\n\n`;
        }

        setText(extractedText);
      } catch (error) {
        console.error("Failed to extract PDF content", error);
        alert("Error extracting text from PDF.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract text from DOCX files using Mammoth
  const extractFromDocx = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const { value } = await mammoth.extractRawText({ arrayBuffer });
        setText(value.trim());
      } catch (error) {
        console.error("Failed to extract DOCX content", error);
        alert("Error extracting text from DOCX.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // Extract text from TXT files
  const extractFromTxt = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setText(event.target?.result as string);
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
