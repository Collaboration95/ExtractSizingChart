import React, { useState } from "react";
import { Card, CardContent, Typography, Button } from "@mui/material";
import TableComponent from "./TableComponent";
import { useNotification } from '../context/NotificationContext';
import { uploadImages } from "../controller/imageController";


function processTextractData(blocks) {
  // Ensure blocks is an array
  if (!Array.isArray(blocks)) {
    console.error("Input is not an array");
    return { tables: [], titles: [] };
  }

  // Map WORD blocks for easy lookup
  const wordMap = blocks
    .filter((block) => block.BlockType === "WORD")
    .reduce((acc, block) => {
      acc[block.Id] = block.Text;
      return acc;
    }, {});

  // Filter out table blocks
  const tableBlocks = blocks.filter(
    (block) =>
      block.BlockType === "TABLE" &&
      block.EntityTypes &&
      block.EntityTypes.includes("STRUCTURED_TABLE")
  );

  // Filter for TABLE_TITLE blocks (assuming these blocks exist in the data)
  const titleBlocks = blocks.filter((block) => block.BlockType === "TABLE_TITLE");

  // Process each table
  const tables = tableBlocks.map((tableBlock) => {
    const tableId = tableBlock.Id;

    // Collect all child IDs for the table (these should be CELL block IDs)
    const childIds = tableBlock.Relationships.flatMap((rel) => rel.Ids);

    // Filter for CELL blocks that are children of this table
    const tableCells = blocks.filter(
      (block) => block.BlockType === "CELL" && childIds.includes(block.Id)
    );

    // Check if tableCells is empty
    if (tableCells.length === 0) {
      console.warn(`No cells found for table ${tableId}`);
      return null;
    }

    // Determine table dimensions
    const rowIndices = tableCells
      .map((cell) => cell.RowIndex)
      .filter((index) => typeof index === "number");
    const colIndices = tableCells
      .map((cell) => cell.ColumnIndex)
      .filter((index) => typeof index === "number");

    if (rowIndices.length === 0 || colIndices.length === 0) {
      console.warn(`Invalid row or column indices for table ${tableId}`);
      return null;
    }

    let rows = Math.max(...rowIndices);
    let cols = Math.max(...colIndices);

    // Initialize 2D array for table data
    let tableData = Array.from({ length: rows }, () =>
      Array(cols).fill("")
    );

    // Fill in table data
    tableCells.forEach((cell) => {
      const rowIndex = cell.RowIndex - 1;
      const colIndex = cell.ColumnIndex - 1;

      if (
        rowIndex < 0 ||
        rowIndex >= rows ||
        colIndex < 0 ||
        colIndex >= cols
      ) {
        console.warn(
          `Invalid cell indices: row=${rowIndex}, col=${colIndex} for table ${tableId}`
        );
        return;
      }

      // Get cell content
      const cellContent = blocks
        .filter(
          (block) =>
            block.BlockType === "WORD" &&
            cell.Relationships &&
            cell.Relationships.some(
              (rel) => rel.Type === "CHILD" && rel.Ids.includes(block.Id)
            )
        )
        .map((word) => word.Text)
        .join(" ");

      tableData[rowIndex][colIndex] = cellContent;
    });

    // --- Orientation Detection and Adjustment ---
    // Define functions to check for size and measurement labels
    const isSizeLabel = (s) => {
      const sizeLabels = [
        "XS", "S", "SM", "M", "MD", "L", "LG", "XL", "2XL", "3XL", "4XL",
        "5XL", "6XL", "7XL", "8XL", "9XL", "10XL", "XXS", "XXL", "XXXL",
        "XXXXL", "XXXXXL", "ONE SIZE", "FREE SIZE", "0", "2", "4", "6",
        "8", "10", "12", "14", "16", "18",
      ];
      return sizeLabels.includes(s.trim().toUpperCase());
    };

    const isMeasurementLabel = (s) => {
      const measurementLabels = [
        "CHEST", "WAIST", "HIP", "SHOULDER", "SLEEVE", "LENGTH",
        "INSEAM", "ARM", "NECK", "BUST", "THIGH", "KNEE", "CALF",
        "ANKLE", "SLEEVE LENGTH", "INSEAM (SHORT)", "INSEAM (REGULAR)",
        "INSEAM (TALL)",
      ];
      return measurementLabels.includes(s.trim().toUpperCase());
    };

    // Extract first row and first column (excluding headers)
    const firstRow = tableData[0].slice(1);
    const firstColumn = tableData.slice(1).map((row) => row[0]);

    // Count size labels in first row and first column
    const sizeCountInFirstRow = firstRow.filter(isSizeLabel).length;
    const sizeCountInFirstColumn = firstColumn.filter(isSizeLabel).length;

    // Decide if table needs to be transposed
    let sizesInFirstRow = sizeCountInFirstRow > sizeCountInFirstColumn;

    if (sizesInFirstRow) {
      // Transpose the table
      tableData = transpose(tableData);

      // Swap rows and cols
      [rows, cols] = [cols, rows];
    }

    // Return processed table
    return {
      rows,
      cols,
      data: tableData,
    };
  });

  // Extract titles if necessary
  const titles = titleBlocks.map((titleBlock) => {
    const titleChildrenIds = titleBlock.Relationships.flatMap((rel) => rel.Ids);
    return titleChildrenIds.map((id) => wordMap[id] || "").join(" ");
  });

  // Filter out null values (tables that couldn't be processed)
  return {
    tables: tables.filter((table) => table !== null),
    titles, // Return table titles
  };
}

// Helper function to transpose a matrix
function transpose(matrix) {
  return matrix[0].map((col, i) => matrix.map((row) => row[i]));
}


function mapTablesToModels(allTablesData) {
  // Initialize an array to hold all sizing charts
  const sizingCharts = [];

  allTablesData.forEach((tableData, index) => {
    const { tables, titles } = tableData;

    // Create a new SizingChart
    const sizingChart = {
      id: index + 1, // You might want to use a more robust ID system
      sizes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    tables.forEach((table, tableIndex) => {
      const { data } = table;

      // Check if the table has enough rows and columns
      if (data.length < 2 || data[0].length < 2) {
        console.warn(`Table at index ${tableIndex} does not have enough data.`);
        return;
      }

      // Assume the first row contains measurement labels
      const headers = data[0];
      const measurementLabels = headers.slice(1); // Skip the first header (Size label)

      // Process each row after the header
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const sizeLabel = row[0]; // The size label (e.g., "S", "M", "L")

        // Create a new Size
        const size = {
          id: sizingChart.sizes.length + 1,
          label: sizeLabel,
          measurements: [],
          sizingChartId: sizingChart.id,
        };

        // Process each measurement in the row
        for (let j = 1; j < row.length; j++) {
          const value = parseFloat(row[j]);
          const label = measurementLabels[j - 1];

          // Skip if value is not a number
          if (isNaN(value)) {
            console.warn(`Invalid measurement value at row ${i}, column ${j}`);
            continue;
          }

          // Create a new Measurement
          const measurement = {
            id: size.measurements.length + 1,
            label: label,
            value: value,
            unit: "cm", // You may need to determine the unit dynamically
            sizeId: size.id,
          };

          size.measurements.push(measurement);
        }

        sizingChart.sizes.push(size);
      }
    });

    sizingCharts.push(sizingChart);
  });

  return sizingCharts;
}



const DragAndDropImage = () => {
  const [tableInfo,setTableInfo] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [titlesData,setTitlesData] = useState(null);
  const { addNotification } = useNotification();

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    const validFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/"),
    );

    setSelectedFiles(validFiles); // Store selected files to send later
    const previewURLs = validFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevPreviews) => [...prevPreviews, ...previewURLs]);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFiles) return;

    try {
      const data = await uploadImages(selectedFiles, addNotification);

      addNotification("Info Received from cloud", "success");
      console.log("Data received from cloud is ", data);

      data.results.map((result) => {
        console.log("result is ", result);
      });
      const allTablesData = data.results.map((result) =>
          processTextractData(result.tableData.Blocks)
      );
      console.log("allTablesData is ", allTablesData);

      const sizingCharts = mapTablesToModels(allTablesData);
      console.log("Sizing Charts:", sizingCharts);

      let flattenedTablesData = allTablesData.map((data) => data.tables).flat();
      let allTitlesData = allTablesData.map((data) => data.titles).flat();

      setTableData(flattenedTablesData);
      setTitlesData(allTitlesData);
      setTableInfo(allTablesData);
    } catch (error) {
      console.error("Error processing images:", error);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="w-full h-32 text-align-center flex items-center justify-center
         max-w-lg p-6 my-4 border-2 border-dashed border-gray-300 hover:border-3 hover:border-double"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <p>Drag and drop images here, or click to select files</p>
      </div>

      {/* Display image previews */}
      <div className="grid grid-cols-3 gap-4">
        {imagePreviews.map((src, index) => (
          <div key={index} className="w-32 h-32 border rounded overflow-hidden">
            <img
              src={src}
              alt={`preview-${index}`}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleUpload}
        className="my-4 p-2 bg-blue-500 text-white"
      >
        Upload Images
      </button>

      {tableData && (
        <div className="my-4 w-full max-w-lg">
          <h2>Extracted Table Data:</h2>
          <TableComponent tableData={tableData} tableInfo={tableInfo} titlesData={titlesData} />{" "}
          {/* Pass table data as prop */}
        </div>
      )}
    </div>
  );
};

export default DragAndDropImage;
