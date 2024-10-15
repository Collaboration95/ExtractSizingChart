import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Box,
  List,
  ListItem
} from '@mui/material';

const TableComponent = ({ tableData, titlesData, tableInfo }) => {
  if (!tableData || tableData.length === 0) {
    return <Typography>No data available</Typography>;
  }

  return (
    <>
      {tableInfo && tableInfo.map(({ tables, titles }, index) => (
        <Box key={index} mb={4}>
          {titles && titles.length > 0 ? (
            <List>
              {titles.map((title, index) => (
                <ListItem key={index}>
                  <Typography variant="h6"  >{title}</Typography>
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="h6" color="textSecondary">
              No title recognized
            </Typography>
          )}

          {tables.map((row, rowIndex) => (
            <Table key={rowIndex} sx={{ mt: 2, mb: 2, width: '100%', border: 1 }}>
              <TableHead>
                <TableRow sx={{
                   '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.2)' },
                }}>
                  {row.data[0].map((element, index) => (
                    <TableCell key={index}
                    sx={{
                      fontWeight: 'bold',
                      borderBottom: 1,
                     
                    }}
                     >
                      {element}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {row.data.slice(1).map((rowItem, rowItemIndex) => (
                  <TableRow key={rowItemIndex} sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }}}>
                    {rowItem.map((cell, cellIndex) => (
                      <TableCell key={cellIndex} sx={{ borderBottom: 1 }}>
                        {cell}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ))}
        </Box>
      ))}
    </>
  );
};

export default TableComponent;

// import React from "react";
// import { Table, ListGroup, Container, Row, Col } from "react-bootstrap";

// const TableComponent = ({ tableData, titlesData, tableInfo }) => {
//   if (!tableData || tableData.length === 0) {
//     return <div>No data available</div>;
//   }

//   return (
//     <Container>
//       {tableInfo && tableInfo.map(({ tables, titles }, index) => (
//         <Row key={index} className="mb-5">
//           <Col>
//             {titles && titles.length > 0 ? (
//               <ListGroup>
//                 {titles.map((title, idx) => (
//                   <ListGroup.Item key={idx}>{title}</ListGroup.Item>
//                 ))}
//               </ListGroup>
//             ) : (
//               <h5>No title recognized</h5>
//             )}

//             {tables.map((row, rowIndex) => (
//               <Table
//                 key={rowIndex}
//                 striped
//                 bordered
//                 hover
//                 responsive
//                 className="mt-3"
//               >
//                 <thead>
//                   <tr>
//                     {row.data[0].map((element, idx) => (
//                       <th key={idx}>{element}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {row.data.slice(1).map((rowItem, rowItemIndex) => (
//                     <tr key={rowItemIndex}>
//                       {rowItem.map((cell, cellIndex) => (
//                         <td key={cellIndex}>{cell}</td>
//                       ))}
//                     </tr>
//                   ))}
//                 </tbody>
//               </Table>
//             ))}
//           </Col>
//         </Row>
//       ))}
//     </Container>
//   );
// };

// export default TableComponent;
