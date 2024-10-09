import React, { useState } from 'react';
import { Card, CardContent, Typography, Button } from '@mui/material';
import TableComponent from './TableComponent'; 

function processTextractData(blocks) {
    // Ensure blocks is an array
    if (!Array.isArray(blocks)) {
      console.error('Input is not an array');
      return [];
    }
  
    // Filter out table blocks
    const tableBlocks = blocks.filter(block => 
      block.BlockType === 'TABLE' &&
      block.EntityTypes &&
      block.EntityTypes.includes('STRUCTURED_TABLE')
    );
  
    // Process each table
    const tables = tableBlocks.map(tableBlock => {
      const tableId = tableBlock.Id;
  
      // Collect all child IDs for the table (these should be CELL block IDs)
      const childIds = tableBlock.Relationships.flatMap(rel => rel.Ids);
  
      // Filter for CELL blocks that are children of this table
      const tableCells = blocks.filter(block => 
        block.BlockType === 'CELL' && 
        childIds.includes(block.Id)
      );
  
      // Check if tableCells is empty
      if (tableCells.length === 0) {
        console.warn(`No cells found for table ${tableId}`);
        return null;
      }
  
      // Determine table dimensions
      const rowIndices = tableCells.map(cell => cell.RowIndex).filter(index => typeof index === 'number');
      const colIndices = tableCells.map(cell => cell.ColumnIndex).filter(index => typeof index === 'number');
  
      if (rowIndices.length === 0 || colIndices.length === 0) {
        console.warn(`Invalid row or column indices for table ${tableId}`);
        return null;
      }
  
      const rows = Math.max(...rowIndices);
      const cols = Math.max(...colIndices);
  
      // Check if rows or cols are valid
      if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows <= 0 || cols <= 0) {
        console.warn(`Invalid dimensions for table ${tableId}: rows=${rows}, cols=${cols}`);
        return null;
      }
  
      // Initialize 2D array for table data
      const tableData = Array(rows).fill().map(() => Array(cols).fill(''));
  
      // Fill in table data
      tableCells.forEach(cell => {
        const rowIndex = cell.RowIndex - 1;
        const colIndex = cell.ColumnIndex - 1;
  
        if (rowIndex < 0 || rowIndex >= rows || colIndex < 0 || colIndex >= cols) {
          console.warn(`Invalid cell indices: row=${rowIndex}, col=${colIndex} for table ${tableId}`);
          return;
        }
  
        // Get cell content
        const cellContent = blocks
          .filter(block => 
            block.BlockType === 'WORD' && 
            cell.Relationships && 
            cell.Relationships.some(rel => rel.Type === 'CHILD' && rel.Ids.includes(block.Id))
          )
          .map(word => word.Text)
          .join(' ');
  
        tableData[rowIndex][colIndex] = cellContent;
      });
  
      return {
        rows,
        cols,
        data: tableData
      };
    });
  
    // Filter out null values (tables that couldn't be processed)
    return tables.filter(table => table !== null);
  }

const DragAndDropImage = () => {
    const [imagePreviews, setImagePreviews] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState(null);
    const [tableData, setTableData] = useState(null); 

    const handleDrop = (event) => {
      event.preventDefault();
      const files = event.dataTransfer.files;
      const validFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
      
      setSelectedFiles(validFiles); // Store selected files to send later
      const previewURLs = validFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prevPreviews => [...prevPreviews, ...previewURLs]);
    };
  
    const handleDragOver = (event) => {
      event.preventDefault();
    };
  
    const handleUpload = async () => {
      if (!selectedFiles) return;
  
      const formData = new FormData();
  
      // Append all selected files to FormData
      selectedFiles.forEach((file) => {
        formData.append('images', file); // 'images' is the key for sending multiple files
      });

    fetch('api/upload/', {
      method: 'POST',
      body: formData, // FormData will contain the images
    })
    .then(async response => {
      if (response.ok) {
        console.log('Images uploaded successfully');
        // console.log( await response.json())
        return response.json();
      } else {
        console.error('Image upload failed');
        throw new Error('Image upload failed');
      }
    })
    .then(data => {
        let allTablesData = data.results.map(result => processTextractData(result.tableData.Blocks));
        // console.log("allTablesData is ", allTablesData);
        
        // Flatten the array of arrays into a single array of tables
        let flattenedTablesData = allTablesData.flat();
        // console.log("flattenedTablesData is ", flattenedTablesData);
        setTableData(flattenedTablesData);
    })
    .catch(error => {
      console.error('Error uploading images:', error);
    });
    };
  
    return (
      <div className="flex flex-col items-center">
        <div
          className="w-full max-w-lg p-6 my-4 border-2 border-dashed border-gray-300"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>Drag and drop images here, or click to select files</p>
        </div>
  
        {/* Display image previews */}
        <div className="grid grid-cols-3 gap-4">
          {imagePreviews.map((src, index) => (
            <div key={index} className="w-32 h-32 border rounded overflow-hidden">
              <img src={src} alt={`preview-${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
  
        <button onClick={handleUpload} className="my-4 p-2 bg-blue-500 text-white">
          Upload Images
        </button>

        {tableData && (
        <div className="my-4 w-full max-w-lg">
          <h2>Extracted Table Data:</h2>
          <TableComponent tableData={tableData} /> {/* Pass table data as prop */}
        </div>
      )}

      </div>
    );
  };
  
export default DragAndDropImage;

